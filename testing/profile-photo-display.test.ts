import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    personalPhotoSrc,
    PROFILE_PHOTO_PLACEHOLDER,
    retainPhotoKeyAfterLoadError,
    storedPersonalPhotoUrl,
} from '../src/providers/logged-in/profile-photo-display';

const root = process.cwd();

describe('profile photo display', () => {
    it('uses the resolved URL for an existing S3-backed photo', () => {
        const photo = {
            candidate_personal_photo: 'candidate-profile-photos/existing.jpg',
            candidate_personal_photo_url: 'https://cdn.example.test/candidate-profile-photos/existing.jpg',
        };

        expect(storedPersonalPhotoUrl(photo)).toBe(photo.candidate_personal_photo_url);
        expect(personalPhotoSrc(photo)).toBe(photo.candidate_personal_photo_url);
        expect(personalPhotoSrc(photo)).not.toContain('candidate-photo/');
    });

    it('shows a newly saved photo URL after profile reload', () => {
        const saved = {
            candidate_personal_photo: 'candidate-profile-photos/new.jpg',
            candidate_personal_photo_url: 'https://cdn.example.test/candidate-profile-photos/new.jpg',
        };
        const reloaded = { ...saved };

        expect(personalPhotoSrc(reloaded)).toBe(saved.candidate_personal_photo_url);
        expect(reloaded.candidate_personal_photo).toBe(saved.candidate_personal_photo);
    });

    it('keeps the stored key when the image fails to load', () => {
        const photo = {
            candidate_personal_photo: 'candidate-profile-photos/broken.jpg',
            candidate_personal_photo_url: 'https://cdn.example.test/candidate-profile-photos/broken.jpg',
        };
        const retained = retainPhotoKeyAfterLoadError(photo);

        expect(retained.candidate_personal_photo).toBe(photo.candidate_personal_photo);
        expect(retained.candidate_personal_photo_url).toBe(photo.candidate_personal_photo_url);
        expect(personalPhotoSrc(null)).toBe(PROFILE_PHOTO_PLACEHOLDER);
    });

    it('keeps a temporary upload preview ahead of the stored URL', () => {
        const preview = 'https://studenthub-public-anyone-can-upload-24hr-expiry.s3.eu-west-2.amazonaws.com/temp.jpg';
        const photo = {
            candidate_personal_photo: 'temp.jpg',
            candidate_personal_photo_url: preview,
        };

        expect(personalPhotoSrc(photo, preview)).toBe(preview);
    });

    it('does not build Cloudinary candidate-photo URLs in the profile surfaces', () => {
        const personalPhoto = readFileSync(resolve(root, 'src/pages/(auth)/personal-photo/page.tsx'), 'utf8');
        const profileName = readFileSync(resolve(root, 'src/components/app/profile/name.tsx'), 'utf8');

        expect(personalPhoto).not.toContain("VITE_CLOUDINARY_URL + 'candidate-photo/'");
        expect(profileName).not.toContain("VITE_CLOUDINARY_URL + 'candidate-photo/'");
        expect(personalPhoto).toContain('response.Location');
        expect(personalPhoto).toContain('candidate_personal_photo_url');
        expect(personalPhoto).toContain('onPhotoLoadError');
        expect(personalPhoto).not.toContain('function resetPhoto');
        expect(profileName).toContain('setPhotoFailed(true)');
        expect(profileName).not.toContain('candidate_personal_photo = ""');
    });
});
