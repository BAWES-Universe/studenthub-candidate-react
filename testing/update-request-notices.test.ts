import { describe, expect, it } from 'vitest';
import { activityActionHref, documentRequestActivityNote, isCustomStaffMessage, visibleUpdateNotices } from '../src/providers/logged-in/update-request-notices';
import { applyCivilRemoval, applyCivilUploadResponse, applyCommittedCivilId, canonicalCivilFormValues, civilPreviewOnError, civilRemovalOutcome, civilSubmissionPayload, rememberCivilStaging, replacePreviewUrl, shouldWriteCanonicalCivilUser, tokenAfterCivilSave, CivilDraft } from '../src/providers/logged-in/civil-id-submission';

describe('update request notices', () => {
    it('shows a photo notice and a civil notice independently', () => {
        expect(visibleUpdateNotices([
            { type: 'profile_photo' },
            { type: 'civil_id' },
        ])).toEqual({ photo: true, civil: true });

        expect(visibleUpdateNotices([{ type: 'profile_photo' }])).toEqual({
            photo: true,
            civil: false,
        });
    });

    it('hides notices when nothing is pending', () => {
        expect(visibleUpdateNotices([])).toEqual({ photo: false, civil: false });
        expect(visibleUpdateNotices(null)).toEqual({ photo: false, civil: false });
    });

    it('links an activity card only while the request is pending', () => {
        expect(activityActionHref(12, 'pending')).toBe('/personal-photo?fromProfile=1');
        expect(activityActionHref(13, 'pending')).toBe('/civil-id?fromProfile=1');
        expect(activityActionHref(12, 'submitted')).toBeNull();
        expect(activityActionHref(13, 'missing')).toBeNull();
        expect(activityActionHref(0, 'pending')).toBeNull();
        expect(activityActionHref(14, 'pending')).toBeNull();
    });

    it('keeps a custom staff message out of home and profile notices', () => {
        expect(isCustomStaffMessage(14)).toBe(true);
        expect(isCustomStaffMessage(12)).toBe(false);
        expect(isCustomStaffMessage(13)).toBe(false);
        expect(visibleUpdateNotices([
            { type: 'profile_photo' },
            { type: 'civil_id' },
        ])).toEqual({ photo: true, civil: true });
    });

    it('keeps the latest staging revision and ignores a response without one', () => {
        const staged = rememberCivilStaging(null, {
            update_request_id: 'cur-a',
            staging_revision: 2,
        });
        expect(staged).toEqual({ update_request_id: 'cur-a', staging_revision: 2 });
        expect(rememberCivilStaging(staged, { candidate_civil_photo_front: 'old-front.jpg' })).toEqual(staged);
        expect(rememberCivilStaging(staged, { update_request_id: 'cur-a', staging_revision: 1 })).toEqual(staged);
        expect(rememberCivilStaging(staged, { update_request_id: 'cur-a', staging_revision: 3 })).toEqual({
            update_request_id: 'cur-a',
            staging_revision: 3,
        });
    });

    it('keeps the civil form when removal fails and stores a successful staged revision', () => {
        const token = { update_request_id: 'cur-a', staging_revision: 2 };
        expect(civilRemovalOutcome(token, { operation: 'error', message: 'This Civil ID update is out of date. Refresh the page and submit it again.' })).toEqual({
            clearForm: false,
            token,
            message: 'This Civil ID update is out of date. Refresh the page and submit it again.',
            ignored: false,
        });
        expect(civilRemovalOutcome(token, {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 3,
        })).toEqual({
            clearForm: true,
            token: { update_request_id: 'cur-a', staging_revision: 3 },
            message: null,
            ignored: false,
        });
        expect(civilRemovalOutcome(token, { operation: 'success' })).toEqual({
            clearForm: true,
            token: null,
            message: null,
            ignored: false,
        });
        expect(civilRemovalOutcome(token, {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 1,
        })).toEqual({
            clearForm: false,
            token,
            message: null,
            ignored: true,
        });
    });

    it('keeps the form and submission payload on the newer upload and removal', () => {
        const empty: CivilDraft = {
            token: null,
            candidate_civil_id: '',
            candidate_civil_expiry_date: '',
            candidate_civil_photo_front: '',
            candidate_civil_photo_back: '',
            front_preview: '',
            back_preview: '',
        };
        const front = {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 1,
            staged_photo_front: 'front-v1.jpg',
            suggested_civil_id: '200000000009',
            suggested_civil_expiry_date: '2031-01-01',
        };
        const back = {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 2,
            staged_photo_front: 'front-v1.jpg',
            staged_photo_back: 'back-v1.jpg',
        };

        const frontThenBack = applyCivilUploadResponse(
            applyCivilUploadResponse(empty, front, { side: 'front', previewUrl: 'blob:front-v1' }).draft,
            back,
            { side: 'back', previewUrl: 'blob:back-v1' },
        );
        expect(frontThenBack.draft).toMatchObject({
            token: { update_request_id: 'cur-a', staging_revision: 2 },
            candidate_civil_photo_front: 'front-v1.jpg',
            candidate_civil_photo_back: 'back-v1.jpg',
            candidate_civil_id: '200000000009',
            candidate_civil_expiry_date: '2031-01-01',
            front_preview: 'blob:front-v1',
            back_preview: 'blob:back-v1',
        });
        expect(civilSubmissionPayload(frontThenBack.draft)).toEqual({
            civil_id: '200000000009',
            civil_expiry_date: '2031-01-01',
            update_request_id: 'cur-a',
            staging_revision: 2,
        });

        const backThenFront = applyCivilUploadResponse(
            applyCivilUploadResponse(empty, back, { side: 'back', previewUrl: 'blob:back-v1' }).draft,
            front,
            { side: 'front', previewUrl: 'blob:front-late' },
        );
        expect(backThenFront.accepted).toBe(false);
        expect(backThenFront.draft).toMatchObject({
            token: { update_request_id: 'cur-a', staging_revision: 2 },
            candidate_civil_photo_front: 'front-v1.jpg',
            candidate_civil_photo_back: 'back-v1.jpg',
            candidate_civil_id: '',
            candidate_civil_expiry_date: '',
            front_preview: '',
            back_preview: 'blob:back-v1',
        });
        expect(civilSubmissionPayload(backThenFront.draft)).toEqual({
            civil_id: '',
            civil_expiry_date: '',
            update_request_id: 'cur-a',
            staging_revision: 2,
        });

        const replaced = applyCivilUploadResponse(frontThenBack.draft, {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 3,
            staged_photo_front: 'front-v2.jpg',
            staged_photo_back: 'back-v1.jpg',
            suggested_civil_id: '200000000010',
            suggested_civil_expiry_date: '2032-02-02',
        }, { side: 'front', previewUrl: 'blob:front-v2' });
        const delayedFront = applyCivilUploadResponse(replaced.draft, front, {
            side: 'front',
            previewUrl: 'blob:front-late',
        });
        expect(delayedFront.accepted).toBe(false);
        expect(delayedFront.draft).toMatchObject({
            candidate_civil_photo_front: 'front-v2.jpg',
            candidate_civil_photo_back: 'back-v1.jpg',
            candidate_civil_id: '200000000010',
            candidate_civil_expiry_date: '2032-02-02',
            front_preview: 'blob:front-v2',
            back_preview: 'blob:back-v1',
        });

        const removed = applyCivilRemoval(delayedFront.draft, {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 4,
        }, 'front');
        const delayedRemoval = applyCivilRemoval(removed.draft, {
            operation: 'success',
            update_request_id: 'cur-a',
            staging_revision: 2,
        }, 'back');
        expect(removed.clearForm).toBe(true);
        expect(delayedRemoval.ignored).toBe(true);
        expect(delayedRemoval.clearForm).toBe(false);
        expect(delayedRemoval.draft).toMatchObject({
            token: { update_request_id: 'cur-a', staging_revision: 4 },
            candidate_civil_photo_front: '',
            candidate_civil_photo_back: 'back-v1.jpg',
            front_preview: '',
            back_preview: 'blob:back-v1',
            candidate_civil_id: '200000000010',
            candidate_civil_expiry_date: '2032-02-02',
        });
        expect(civilSubmissionPayload(delayedRemoval.draft)).toEqual({
            civil_id: '200000000010',
            civil_expiry_date: '2032-02-02',
            update_request_id: 'cur-a',
            staging_revision: 4,
        });
    });

    it('revokes only the blob preview that is being replaced', () => {
        const revoked: string[] = [];
        const original = URL.revokeObjectURL;
        URL.revokeObjectURL = (value: string) => {
            revoked.push(value);
        };
        expect(replacePreviewUrl('https://uploads.example/photos/old.jpg', 'blob:next')).toBe('blob:next');
        expect(replacePreviewUrl('blob:old', 'blob:next')).toBe('blob:next');
        expect(revoked).toEqual(['blob:old']);
        URL.revokeObjectURL = original;
    });

    it('describes a missing document request differently from a submitted one', () => {
        expect(documentRequestActivityNote('submitted')).toBe('submitted');
        expect(documentRequestActivityNote('missing')).toBe('unavailable');
        expect(documentRequestActivityNote(null)).toBe('unavailable');
        expect(documentRequestActivityNote(undefined)).toBe('unavailable');
    });

    it('uses the refetched profile after a civil save and falls back to the save response', () => {
        const user = {
            candidate_civil_id: '200000000001',
            candidate_civil_expiry_date: '2030-01-01',
            candidate_civil_photo_front: 'old-front.jpg',
            candidate_civil_photo_back: 'old-back.jpg',
        };
        const response = {
            candidate_civil_id: '200000000009',
            candidate_civil_expiry_date: '2031-06-01',
            candidate_civil_photo_front: 'new-front.jpg',
            candidate_civil_photo_back: 'new-back.jpg',
            is_incomplete_profile: 0,
            candidate_pending_profile: '',
        };
        expect(applyCommittedCivilId(user, response, {
            ...user,
            ...response,
            candidate_name: 'Synthetic',
        })).toMatchObject({
            candidate_civil_photo_front: 'new-front.jpg',
            candidate_name: 'Synthetic',
        });
        expect(applyCommittedCivilId(user, response, null)).toMatchObject({
            candidate_civil_id: '200000000009',
            candidate_civil_photo_back: 'new-back.jpg',
            is_incomplete_profile: 0,
        });
    });

    it('writes the saved Civil ID only when a non-staged upload knows no request is pending', () => {
        expect(shouldWriteCanonicalCivilUser(false, false)).toBe(true);
        expect(shouldWriteCanonicalCivilUser(false, null)).toBe(false);
        expect(shouldWriteCanonicalCivilUser(false, true)).toBe(false);
        expect(shouldWriteCanonicalCivilUser(true, false)).toBe(false);
    });

    it('treats a broken civil preview as presentation only', () => {
        expect(civilPreviewOnError()).toEqual({ requestRemoval: false, showPlaceholder: true });
    });

    it('clears the request token only after a confirmed save', () => {
        const token = { update_request_id: 'cur-a', staging_revision: 2 };
        expect(tokenAfterCivilSave(token, { operation: 'success' })).toBeNull();
        expect(tokenAfterCivilSave(token, { operation: 'error' })).toEqual(token);
        expect(tokenAfterCivilSave(token, null)).toEqual(token);
    });

    it('fills the form from the canonical saved profile', () => {
        expect(canonicalCivilFormValues({
            candidate_civil_id: '200000000009',
            candidate_civil_expiry_date: '2030-01-01',
            candidate_civil_photo_front: 'civil-id-front.png',
            candidate_civil_photo_back: 'civil-id-back.png',
        }, 'https://uploads.example/')).toEqual({
            candidate_civil_id: '200000000009',
            candidate_civil_expiry_date: '2030-01-01',
            candidate_civil_photo_front: 'civil-id-front.png',
            candidate_civil_photo_back: 'civil-id-back.png',
            candidate_civil_photo_front_url: 'https://uploads.example/photos/civil-id-front.png',
            candidate_civil_photo_back_url: 'https://uploads.example/photos/civil-id-back.png',
        });
    });
});
