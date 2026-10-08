/**
 * Profile photo display correction.
 * Permanent photos use the URL resolved by the Candidate API.
 * A temporary upload preview is the presigned public URL and is separate.
 * A failed image load does not change the stored key.
 */

export const PROFILE_PHOTO_PLACEHOLDER = '/assets/images/avatar.jpg';

export interface PersonalPhotoFields {
    candidate_personal_photo?: string | null;
    candidate_personal_photo_url?: string | null;
}

export function storedPersonalPhotoUrl(photo: PersonalPhotoFields | null | undefined): string | null {
    const url = photo && photo.candidate_personal_photo_url;
    if (typeof url === 'string' && url !== '') {
        return url;
    }
    return null;
}

export function personalPhotoSrc(photo: PersonalPhotoFields | null | undefined, previewUrl?: string | null): string {
    if (typeof previewUrl === 'string' && previewUrl !== '') {
        return previewUrl;
    }
    return storedPersonalPhotoUrl(photo) || PROFILE_PHOTO_PLACEHOLDER;
}

export function retainPhotoKeyAfterLoadError<T extends PersonalPhotoFields>(photo: T): T {
    return photo;
}
