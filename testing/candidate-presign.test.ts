import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
    redactPresignedReplayEvent,
    redactPresignedUploadUrl,
    redactPresignedUploadBreadcrumb,
    redactPresignedUploadSpan,
    redactPresignedUploadTransaction,
} from '../src/providers/logged-in/sentry-presign-redaction';
import {
    CANDIDATE_VIDEO_EXTENSIONS,
    PROFILE_PHOTO_MAX_BYTES,
    SINGLE_PUT_MAX_BYTES,
    TEMP_UPLOAD_HOST,
    candidateUploadError,
    getPublicFileMetadata,
    startCandidateUpload,
    type CandidateUploadPurpose,
    type CandidateXhr,
} from '../src/providers/logged-in/temp-upload';

const root = process.cwd();
const signedUrl = 'https://' + TEMP_UPLOAD_HOST + '/clip.webm?X-Amz-Signature=rawsigvalue&X-Amz-Credential=AKIATEMPUPLOADTEST01%2F20261008%2Feu-west-2%2Fs3%2Faws4_request';

function read(relative: string): string {
    return readFileSync(join(root, relative), 'utf8');
}

function presignBody(purpose: CandidateUploadPurpose, name: string, type: string) {
    return {
        method: 'PUT',
        upload_url: signedUrl,
        key: 'server-key.' + name.split('.').pop(),
        bucket: 'studenthub-public-anyone-can-upload-24hr-expiry',
        public_url: 'https://' + TEMP_UPLOAD_HOST + '/server-key.' + name.split('.').pop(),
        headers: {
            'Content-Type': type || 'video/webm',
            'x-amz-acl': 'public-read',
        },
    };
}

function xhrFor(status: number, headers: string[]) {
    return function () {
        const request: CandidateXhr = {
            upload: { onprogress: null },
            status,
            open() {},
            setRequestHeader(name, value) {
                headers.push(name + ': ' + value);
            },
            send() {
                if (this.upload.onprogress) {
                    this.upload.onprogress({ lengthComputable: true, loaded: 4, total: 8 });
                }
                if (this.onload) {
                    this.onload();
                }
            },
            onload: null,
            onerror: null,
            onabort: null,
        };
        return request;
    };
}

describe('candidate presign', () => {
    it('rejects an unauthenticated upload before any request', async () => {
        let called = false;
        const upload = startCandidateUpload({
            file: { name: 'photo.jpg', type: 'image/jpeg', size: 100 },
            purpose: 'profile_photo',
            token: '',
            endpoint: 'https://student.api.studenthub.co/v1/temp-upload/url',
            fetchImpl: async () => {
                called = true;
                throw new Error('fetch should not run');
            },
            createRequest: () => {
                throw new Error('xhr should not run');
            },
        });
        await expect(upload.done()).rejects.toThrow('Temporary upload is unavailable.');
        expect(called).toBe(false);
    });

    it('treats a presign failure as unavailable and does not save', async () => {
        let saved = false;
        let put = false;
        const upload = startCandidateUpload({
            file: { name: 'photo.jpg', type: 'image/jpeg', size: 100 },
            purpose: 'profile_photo',
            token: 'candidate-token',
            endpoint: 'https://student.api.studenthub.co/v1/temp-upload/url',
            fetchImpl: async () => new Response('{}', { status: 503 }),
            createRequest: () => {
                put = true;
                throw new Error('xhr should not run');
            },
        });
        upload.done().then(() => {
            saved = true;
        }).catch(() => undefined);
        await expect(upload.done()).rejects.toThrow('Temporary upload is unavailable.');
        expect(saved).toBe(false);
        expect(put).toBe(false);
    });

    it('sends the bearer token only to the API and keeps the save payload as the returned key', async () => {
        const putHeaders: string[] = [];
        let apiHeaders: Record<string, string> = {};
        let apiBody: any = null;
        const upload = startCandidateUpload({
            file: { name: '42.webm', type: '', size: 2000 },
            purpose: 'video',
            token: 'candidate-token',
            endpoint: 'https://student.api.studenthub.co/v1/temp-upload/url',
            fetchImpl: async (_input, init) => {
                apiHeaders = init.headers as Record<string, string>;
                apiBody = JSON.parse(String(init.body));
                return new Response(JSON.stringify(presignBody('video', '42.webm', 'video/webm')), { status: 200 });
            },
            createRequest: xhrFor(200, putHeaders),
        });
        const progress: number[] = [];
        upload.on('httpUploadProgress', (event) => progress.push(event.loaded));
        const result = await upload.done();
        expect(apiHeaders.Authorization).toBe('Bearer candidate-token');
        expect(apiBody).toEqual({
            purpose: 'video',
            filename: '42.webm',
            content_type: '',
            file_size: 2000,
        });
        expect(putHeaders.join('\n')).not.toContain('Authorization');
        expect(putHeaders).toContain('Content-Type: video/webm');
        expect(putHeaders).toContain('x-amz-acl: public-read');
        expect(result.Key).toBe('server-key.webm');
        expect(progress).toEqual([4]);
    });

    it('does not resolve a save payload when the PUT fails', async () => {
        let savedKey = '';
        const upload = startCandidateUpload({
            file: { name: 'front.png', type: 'image/png', size: 50 },
            purpose: 'civil_id',
            token: 'candidate-token',
            endpoint: 'https://student.api.studenthub.co/v1/temp-upload/url',
            fetchImpl: async () => new Response(JSON.stringify(presignBody('civil_id', 'front.png', 'image/png')), { status: 200 }),
            createRequest: xhrFor(403, []),
        });
        upload.done().then((result) => {
            savedKey = result.Key;
        }).catch(() => undefined);
        await expect(upload.done()).rejects.toThrow('Temporary upload failed.');
        expect(savedKey).toBe('');
    });

    it('keeps the 10 MB photo limit and the single-PUT ceiling for uncapped paths', () => {
        expect(candidateUploadError({ name: 'photo.jpg', type: 'image/jpeg', size: PROFILE_PHOTO_MAX_BYTES }, 'profile_photo')).toBeNull();
        expect(candidateUploadError({ name: 'photo.jpg', type: 'image/jpeg', size: PROFILE_PHOTO_MAX_BYTES + 1 }, 'profile_photo'))
            .toContain('10MB');
        expect(candidateUploadError({ name: 'clip.mp4', type: 'video/mp4', size: 20 * 1024 * 1024 }, 'video')).toBeNull();
        expect(candidateUploadError({ name: 'cv.pdf', type: 'application/pdf', size: SINGLE_PUT_MAX_BYTES }, 'resume')).toBeNull();
        expect(candidateUploadError({ name: 'cv.pdf', type: '', size: SINGLE_PUT_MAX_BYTES + 1 }, 'resume'))
            .toContain('single-PUT');
        expect(candidateUploadError({ name: 'logo.svg', type: 'image/svg+xml', size: 100 }, 'civil_id'))
            .toContain('.jpg');
        expect(candidateUploadError({ name: 'clip.avi', type: 'video/avi', size: 100 }, 'video'))
            .toContain('.webm');
        expect(CANDIDATE_VIDEO_EXTENSIONS).toEqual(['mp4', 'mov', 'webm']);
        expect(candidateUploadError({ name: '9.webm', type: '', size: 100 }, 'video')).toBeNull();
        expect(candidateUploadError({ name: '9.webm', type: 'video/webm;codecs=vp8,opus', size: 100 }, 'video')).toBeNull();
    });

    it('does not load browser AWS credentials from the upload pages', () => {
        const sources = [
            'src/providers/logged-in/aws.service.ts',
            'src/pages/(auth)/personal-photo/page.tsx',
            'src/pages/(auth)/civil-id/page.tsx',
            'src/pages/(auth)/video/page.tsx',
        ].map(read).join('\n');
        expect(sources).not.toContain('/aws/config');
        expect(sources).not.toContain('accessKeyId');
        expect(sources).not.toContain('HeadObject');
        expect(sources).not.toContain('setAWSConfig');
        expect(sources).toContain("uploadFileToTempS3(file, 'profile_photo')");
        expect(sources).toContain("uploadFileToTempS3(file, 'civil_id')");
        expect(sources).toContain("uploadFileToTempS3(file, 'resume')");
        expect(sources).toContain("uploadFileToTempS3(file, 'video')");
        expect(read('src/pages/(auth)/video/page.tsx')).toContain('updateResume(res.Key)');
        expect(read('src/pages/(auth)/video/page.tsx')).toContain('updateVideo(res.Key)');
        expect(read('src/pages/(auth)/civil-id/page.tsx')).toContain('updateCivilPhotoFront(response.Key)');
        expect(read('src/pages/(auth)/civil-id/page.tsx')).toContain('updateCivilPhotoBack(response.Key)');
        expect(read('src/pages/(auth)/personal-photo/page.tsx')).toContain('response.Key');
    });

    it('uses an anonymous HEAD for resume metadata and hides it when that fails', async () => {
        const original = globalThis.fetch;
        let method = '';
        let authorization = '';
        globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
            method = init && init.method ? init.method : '';
            const headers = new Headers(init && init.headers);
            authorization = headers.get('Authorization') || '';
            return new Response(null, { status: 403 });
        }) as typeof fetch;
        try {
            const hidden = await getPublicFileMetadata('candidate-resume/cv.pdf', 'https://files.example');
            expect(hidden).toBeNull();
            expect(method).toBe('HEAD');
            expect(authorization).toBe('');
        } finally {
            globalThis.fetch = original;
        }
    });
});

describe('candidate telemetry redaction', () => {
    it('redacts breadcrumbs, spans, transactions, and replay events without changing a separate upload URL', () => {
        const uploadUrl = signedUrl;
        const breadcrumb = redactPresignedUploadBreadcrumb({
            category: 'xhr',
            message: 'PUT ' + signedUrl,
            data: { url: signedUrl, status_code: 200 },
        });
        expect(breadcrumb.data.url).toContain('X-Amz-Signature=%5Bredacted%5D');
        expect(breadcrumb.data.url).not.toContain('rawsigvalue');
        expect(breadcrumb.data.status_code).toBe(200);
        expect(uploadUrl).toContain('rawsigvalue');

        const repeated = redactPresignedUploadBreadcrumb({
            message: signedUrl + ' x-amz-signature=secondrawsig',
        });
        expect(repeated).not.toBeNull();
        expect(repeated.message).not.toContain('rawsigvalue');
        expect(repeated.message).not.toContain('secondrawsig');
        expect(uploadUrl).toContain('rawsigvalue');

        const span = redactPresignedUploadSpan({
            description: 'PUT ' + signedUrl,
            data: { 'http.url': signedUrl },
        });
        expect(span.description).not.toContain('rawsigvalue');
        expect(span.data['http.url']).not.toContain('rawsigvalue');

        const transaction = redactPresignedUploadTransaction({
            type: 'transaction',
            spans: [{ description: signedUrl }],
        });
        expect(JSON.stringify(transaction)).not.toContain('rawsigvalue');

        const replay = redactPresignedReplayEvent({
            type: 5,
            data: { tag: 'performanceSpan', payload: { description: signedUrl } },
        });
        expect(JSON.stringify(replay)).not.toContain('rawsigvalue');
        const dom = { type: 3, data: { source: 0 } };
        expect(redactPresignedReplayEvent(dom)).toBe(dom);
    });

    it('keeps unsigned and already-redacted temporary URLs and redacts a query string without the bucket host', () => {
        const uploadUrl = signedUrl;
        const publicUrl = 'https://' + TEMP_UPLOAD_HOST + '/preview.jpg';
        const publicBreadcrumb = {
            category: 'xhr',
            message: 'GET ' + publicUrl,
            data: { url: publicUrl, status_code: 200 },
        };
        expect(redactPresignedUploadBreadcrumb(publicBreadcrumb)).toBe(publicBreadcrumb);
        const publicTransaction = {
            type: 'transaction',
            spans: [{ description: publicUrl }],
        };
        expect(redactPresignedUploadTransaction(publicTransaction)).toBe(publicTransaction);

        const redactedUrl = 'https://' + TEMP_UPLOAD_HOST + '/preview.jpg?X-Amz-Signature=%5Bredacted%5D&X-Amz-Credential=%5Bredacted%5D';
        const redactedBreadcrumb = { message: redactedUrl, data: { url: redactedUrl } };
        expect(redactPresignedUploadBreadcrumb(redactedBreadcrumb)).toBe(redactedBreadcrumb);

        const queryOnly = redactPresignedUploadSpan({
            description: 'PUT',
            data: { 'http.query': 'X-Amz-Signature=rawsigvalue&X-Amz-Credential=credvalue' },
        });
        expect(queryOnly.data['http.query']).toBe('X-Amz-Signature=[redacted]&X-Amz-Credential=[redacted]');
        expect(queryOnly.data['http.query']).not.toContain('rawsigvalue');
        expect(uploadUrl).toContain('rawsigvalue');

        const ordinary = { category: 'ui', message: 'clicked profile' };
        expect(redactPresignedUploadBreadcrumb(ordinary)).toBe(ordinary);

        const shared = { url: 'https://example.test/plain' };
        expect(redactPresignedUploadTransaction({ spans: [shared, shared] })).toBeNull();
    });

    it('redacts a second raw value of a sensitive parameter and keeps a fully redacted URL', () => {
        const fullyRedacted = 'https://' + TEMP_UPLOAD_HOST + '/preview.jpg?X-Amz-Signature=%5Bredacted%5D&X-Amz-Credential=%5Bredacted%5D';
        expect(redactPresignedUploadUrl(fullyRedacted)).toBe(fullyRedacted);

        const mixed = 'https://' + TEMP_UPLOAD_HOST + '/preview.jpg?X-Amz-Signature=%5Bredacted%5D&X-Amz-Signature=syntheticrawvalue';
        const cleaned = redactPresignedUploadUrl(mixed);
        expect(cleaned).not.toContain('syntheticrawvalue');
        expect(cleaned.toLowerCase()).toContain('x-amz-signature=%5bredacted%5d');
    });
});
