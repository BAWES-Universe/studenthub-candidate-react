import { store } from '@/store/store';
import {
    CandidateUploadPurpose,
    CandidateXhr,
    getPublicFileMetadata,
    PublicObjectMetadata,
    startCandidateUpload,
} from './temp-upload';

/**
 * Presign with the Candidate bearer token, then PUT with XHR.
 * Axios is not used. Browser AWS credentials are not requested.
 */
export function uploadFileToTempS3(file: File, purpose: CandidateUploadPurpose) {
    const { isAuthenticated, token } = store.getState().auth;
    const base = String(import.meta.env.VITE_API_ENDPOINT || '').replace(/\/$/, '');

    return startCandidateUpload({
        file,
        purpose,
        token: isAuthenticated && token ? token : '',
        endpoint: base ? base + '/temp-upload/url' : '',
        fetchImpl: (input, init) => fetch(input, init),
        createRequest: () => new XMLHttpRequest() as unknown as CandidateXhr,
    });
}

/**
 * Optional resume size display. Anonymous HEAD only.
 * A missing or blocked response hides the metadata.
 */
export function getFileMetadata(key: string): Promise<PublicObjectMetadata | null> {
    return getPublicFileMetadata(key, String(import.meta.env.VITE_PERMANENT_BUCKET_URL || ''));
}
