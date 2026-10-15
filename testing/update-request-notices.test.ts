import { describe, expect, it } from 'vitest';
import { activityActionHref, isCustomStaffMessage, visibleUpdateNotices } from '../src/providers/logged-in/update-request-notices';
import { applyCommittedCivilId, canonicalCivilFormValues, civilPreviewOnError, rememberCivilStaging, tokenAfterCivilSave } from '../src/providers/logged-in/civil-id-submission';

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
