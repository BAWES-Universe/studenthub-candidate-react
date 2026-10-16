/**
 * Candidate temporary upload.
 *
 * Presign uses fetch with the Candidate bearer token. The S3 PUT uses XHR
 * and must not use the Axios singleton, which attaches Authorization.
 * The upload URL returned by the API is sent unchanged.
 *
 * profile_photo keeps the 10 MB product limit. civil_id, resume, and video
 * have no smaller product cap; declared size is checked against the 5 GiB
 * single-PUT transport ceiling. That check is not an S3 content-length-range.
 */

export const TEMP_UPLOAD_HOST = 'studenthub-public-anyone-can-upload-24hr-expiry.s3.eu-west-2.amazonaws.com';

export const PROFILE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const SINGLE_PUT_MAX_BYTES = 5 * 1024 * 1024 * 1024;

export const CANDIDATE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tif', 'tiff'];
export const CANDIDATE_RESUME_EXTENSIONS = ['pdf'];
export const CANDIDATE_VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];

export const CANDIDATE_IMAGE_ACCEPT = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/bmp',
    'image/tiff',
].concat(CANDIDATE_IMAGE_EXTENSIONS.map((extension) => '.' + extension)).join(',');

export const CANDIDATE_RESUME_ACCEPT = 'application/pdf,.pdf';
export const CANDIDATE_VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';

const UNSUPPORTED_PREFIX = 'This file type is not supported.';
const PHOTO_TOO_LARGE = 'The selected file is too large. Maximum allowed size is 10MB.';
const TRANSPORT_TOO_LARGE = 'File size exceeds the 5 GiB single-PUT transport limit.';
const UNAVAILABLE = 'Temporary upload is unavailable.';
const FAILED = 'Temporary upload failed.';

const IMAGE_TYPES: Record<string, string[]> = {
    jpg: ['image/jpeg', 'image/jpg', 'image/pjpeg'],
    jpeg: ['image/jpeg', 'image/jpg', 'image/pjpeg'],
    png: ['image/png', 'image/x-png'],
    gif: ['image/gif'],
    webp: ['image/webp'],
    heic: ['image/heic', 'image/heif'],
    heif: ['image/heif', 'image/heic'],
    bmp: ['image/bmp', 'image/x-ms-bmp'],
    tif: ['image/tiff', 'image/tif'],
    tiff: ['image/tiff', 'image/tif'],
};

const PDF_TYPES: Record<string, string[]> = {
    pdf: ['application/pdf', 'application/x-pdf'],
};

const VIDEO_TYPES: Record<string, string[]> = {
    mp4: ['video/mp4'],
    mov: ['video/quicktime', 'video/mov'],
    webm: ['video/webm'],
};

export type CandidateUploadPurpose = 'profile_photo' | 'civil_id' | 'resume' | 'video';

export interface UploadFileLike {
    name?: string;
    type?: string;
    size: number;
}

export interface CandidateUploadResult {
    Key: string;
    Location: string;
    Bucket: string;
}

export interface CandidateUploadProgress {
    loaded: number;
    total: number;
}

export interface CandidateUploadHandle {
    on(event: string, callback: (progress: CandidateUploadProgress) => void): CandidateUploadHandle;
    done(): Promise<CandidateUploadResult>;
}

interface PresignResponse {
    method?: string;
    upload_url?: string;
    key?: string;
    bucket?: string;
    public_url?: string;
    headers?: {
        'Content-Type'?: string;
        'x-amz-acl'?: string;
    };
}

export interface CandidateXhr {
    upload: {
        onprogress: ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null;
    };
    status: number;
    open(method: string, url: string): void;
    setRequestHeader(name: string, value: string): void;
    send(body: UploadFileLike): void;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    onabort: (() => void) | null;
}

export interface CandidateUploadDependencies {
    file: UploadFileLike;
    purpose: CandidateUploadPurpose;
    token: string;
    endpoint: string;
    fetchImpl: (input: string, init: RequestInit) => Promise<Response>;
    createRequest: () => CandidateXhr;
}

export function fileExtension(name: string): string {
    if (!name) {
        return '';
    }
    const basename = name.split(/[\\/]/).pop() || '';
    const pos = basename.lastIndexOf('.');
    if (basename === '' || pos < 1) {
        return '';
    }
    return basename.slice(pos + 1).toLowerCase();
}

export function unsupportedFormatMessage(extensions: string[]): string {
    return UNSUPPORTED_PREFIX + ' Accepted formats: ' + extensions.map((extension) => '.' + extension).join(', ');
}

function policyFor(purpose: CandidateUploadPurpose): { extensions: string[]; types: Record<string, string[]>; maxBytes: number; oversized: string } {
    if (purpose === 'profile_photo') {
        return {
            extensions: CANDIDATE_IMAGE_EXTENSIONS,
            types: IMAGE_TYPES,
            maxBytes: PROFILE_PHOTO_MAX_BYTES,
            oversized: PHOTO_TOO_LARGE,
        };
    }
    if (purpose === 'civil_id') {
        return {
            extensions: CANDIDATE_IMAGE_EXTENSIONS,
            types: IMAGE_TYPES,
            maxBytes: SINGLE_PUT_MAX_BYTES,
            oversized: TRANSPORT_TOO_LARGE,
        };
    }
    if (purpose === 'resume') {
        return {
            extensions: CANDIDATE_RESUME_EXTENSIONS,
            types: PDF_TYPES,
            maxBytes: SINGLE_PUT_MAX_BYTES,
            oversized: TRANSPORT_TOO_LARGE,
        };
    }
    return {
        extensions: CANDIDATE_VIDEO_EXTENSIONS,
        types: VIDEO_TYPES,
        maxBytes: SINGLE_PUT_MAX_BYTES,
        oversized: TRANSPORT_TOO_LARGE,
    };
}

function declaredType(type: string | undefined): string {
    return (type || '').split(';')[0].trim().toLowerCase();
}

/**
 * Client-side purpose check. Returns a message, or null when the file can be presigned.
 * Empty MIME is accepted when the extension is supported.
 */
export function candidateUploadError(file: UploadFileLike, purpose: CandidateUploadPurpose): string | null {
    const policy = policyFor(purpose);
    const extension = fileExtension(file.name || '');
    if (policy.extensions.indexOf(extension) === -1) {
        return unsupportedFormatMessage(policy.extensions);
    }

    const type = declaredType(file.type);
    if (type !== '' && type !== 'application/octet-stream') {
        const allowed = policy.types[extension] || [];
        if (allowed.indexOf(type) === -1) {
            return 'Filename extension does not match the file type.';
        }
    }

    if (!Number.isFinite(file.size) || file.size < 1) {
        return 'Invalid file size.';
    }

    if (file.size > policy.maxBytes) {
        return policy.oversized;
    }

    return null;
}

function isPresignedPut(body: PresignResponse): body is PresignResponse & {
    upload_url: string;
    key: string;
    bucket: string;
    public_url: string;
    headers: { 'Content-Type': string; 'x-amz-acl': string };
} {
    if (!body || body.method !== 'PUT' || typeof body.key !== 'string' || body.key === '') {
        return false;
    }
    if (typeof body.public_url !== 'string' || body.public_url.indexOf('https://') !== 0) {
        return false;
    }
    if (!body.headers || !body.headers['Content-Type'] || !body.headers['x-amz-acl']) {
        return false;
    }
    if (typeof body.upload_url !== 'string') {
        return false;
    }

    let uploadUrl: URL;
    try {
        uploadUrl = new URL(body.upload_url);
    } catch (err) {
        return false;
    }

    return uploadUrl.protocol === 'https:' && uploadUrl.hostname === TEMP_UPLOAD_HOST;
}

export function startCandidateUpload(options: CandidateUploadDependencies): CandidateUploadHandle {
    let progressListener: ((progress: CandidateUploadProgress) => void) | null = null;

    const promise = new Promise<CandidateUploadResult>((resolve, reject) => {
        const problem = candidateUploadError(options.file, options.purpose);
        if (problem) {
            reject(new Error(problem));
            return;
        }

        if (!options.token || !options.endpoint) {
            reject(new Error(UNAVAILABLE));
            return;
        }

        const filename = options.file.name || 'file';
        options.fetchImpl(options.endpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + options.token,
            },
            body: JSON.stringify({
                purpose: options.purpose,
                filename: filename,
                content_type: options.file.type || '',
                file_size: options.file.size,
            }),
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(UNAVAILABLE);
            }
            const body = await response.json() as PresignResponse;
            if (!isPresignedPut(body)) {
                throw new Error(UNAVAILABLE);
            }

            const xhr = options.createRequest();
            xhr.open('PUT', body.upload_url);
            xhr.setRequestHeader('Content-Type', body.headers['Content-Type']);
            xhr.setRequestHeader('x-amz-acl', body.headers['x-amz-acl']);
            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable || !progressListener) {
                    return;
                }
                progressListener({ loaded: event.loaded, total: event.total });
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        Key: body.key,
                        Location: body.public_url,
                        Bucket: body.bucket,
                    });
                    return;
                }
                reject(new Error(FAILED));
            };
            xhr.onerror = () => reject(new Error(FAILED));
            xhr.send(options.file);
        }).catch((err: unknown) => {
            if (err instanceof Error && (err.message === UNAVAILABLE || err.message === FAILED)) {
                reject(err);
                return;
            }
            reject(new Error(UNAVAILABLE));
        });
    });

    const handle: CandidateUploadHandle = {
        on(event, callback) {
            if (event === 'httpUploadProgress') {
                progressListener = callback;
            }
            return handle;
        },
        done() {
            return promise;
        },
    };

    return handle;
}

export interface PublicObjectMetadata {
    ContentLength?: number;
    LastModified?: Date;
}

/**
 * Optional resume display. Anonymous HEAD of the public object URL.
 * Failure hides the metadata. This does not use AWS credentials.
 */
export async function getPublicFileMetadata(key: string, permanentBaseUrl: string): Promise<PublicObjectMetadata | null> {
    const base = (permanentBaseUrl || '').replace(/\/$/, '');
    if (!base || !key) {
        return null;
    }

    try {
        const response = await fetch(base + '/' + key.replace(/^\//, ''), { method: 'HEAD' });
        if (!response.ok) {
            return null;
        }
        const lengthHeader = response.headers.get('content-length');
        const modifiedHeader = response.headers.get('last-modified');
        const length = lengthHeader ? Number(lengthHeader) : NaN;
        const metadata: PublicObjectMetadata = {};
        if (Number.isFinite(length) && length > 0) {
            metadata.ContentLength = length;
        }
        if (modifiedHeader) {
            const modified = new Date(modifiedHeader);
            if (!Number.isNaN(modified.getTime())) {
                metadata.LastModified = modified;
            }
        }
        if (!metadata.ContentLength) {
            return null;
        }
        return metadata;
    } catch (err) {
        return null;
    }
}
