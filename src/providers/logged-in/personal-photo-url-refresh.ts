import { useEffect, useRef } from 'react';

export interface PersonalPhotoRefreshUser {
    candidate_personal_photo?: string | null;
    candidate_personal_photo_url?: string | null;
}

export interface AppliedPersonalPhoto {
    candidate_personal_photo: string;
    candidate_personal_photo_url: string;
}

/**
 * One profile read when a stored photo key has no resolved URL.
 * A response with no URL does not start another read.
 * A photo selected while the read is in flight is left in place.
 */
export function useMissingPersonalPhotoUrlRefresh(options: {
    user: PersonalPhotoRefreshUser | null | undefined;
    formPhotoKey: () => string;
    loadProfile: () => Promise<PersonalPhotoRefreshUser>;
    apply: (photo: AppliedPersonalPhoto) => void;
}) {
    const completed = useRef(false);
    const formPhotoKeyRef = useRef(options.formPhotoKey);
    const loadProfileRef = useRef(options.loadProfile);
    const applyRef = useRef(options.apply);
    formPhotoKeyRef.current = options.formPhotoKey;
    loadProfileRef.current = options.loadProfile;
    applyRef.current = options.apply;

    const photoKey = options.user?.candidate_personal_photo || '';
    const photoUrl = options.user?.candidate_personal_photo_url || '';

    useEffect(() => {
        if (!photoKey || photoUrl || completed.current) {
            return;
        }

        const keyAtRequest = photoKey;
        let active = true;
        loadProfileRef.current().then((res) => {
            if (!active) {
                return;
            }
            completed.current = true;
            if (formPhotoKeyRef.current() !== keyAtRequest) {
                return;
            }
            applyRef.current({
                candidate_personal_photo: res?.candidate_personal_photo || '',
                candidate_personal_photo_url: res?.candidate_personal_photo_url || '',
            });
        }).catch(() => {
            if (active) {
                completed.current = true;
            }
        });

        return () => {
            active = false;
        };
    }, [photoKey, photoUrl]);
}
