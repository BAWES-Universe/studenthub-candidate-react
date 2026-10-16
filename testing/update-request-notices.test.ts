import { activityActionHref, isCustomStaffMessage, visibleDocumentReminders } from '../src/providers/logged-in/update-request-notices';

describe('document notification reminders', () => {
    it('shows unread photo and Civil ID reminders and hides read or custom messages', () => {
        expect(visibleDocumentReminders([
            { type: 12, is_new: true },
            { type: 13, is_new: true },
            { type: 14, is_new: true },
        ])).toEqual({ photo: true, civil: true });

        expect(visibleDocumentReminders([
            { type: 12, is_new: false },
            { type: 13, is_new: false },
            { type: 14, is_new: true },
        ])).toEqual({ photo: false, civil: false });

        expect(visibleDocumentReminders(null)).toEqual({ photo: false, civil: false });
        expect(isCustomStaffMessage(14)).toBe(true);
        expect(isCustomStaffMessage(12)).toBe(false);
    });

    it('keeps an Activity link after the reminder is read', () => {
        expect(activityActionHref(12)).toBe('/personal-photo?fromProfile=1');
        expect(activityActionHref(13)).toBe('/civil-id?fromProfile=1');
        expect(activityActionHref(14)).toBeNull();
    });
});
