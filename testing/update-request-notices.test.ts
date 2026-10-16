import {
    activityActionHref,
    CIVIL_REMINDER_QUERY,
    isCustomStaffMessage,
    loadDocumentReminders,
    PHOTO_REMINDER_QUERY,
    visibleDocumentReminders,
} from '../src/providers/logged-in/update-request-notices';

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

    it('keeps an older unread notice when the other type fills the first page', async () => {
        const photoHeavy = [
            ...Array.from({ length: 20 }, () => ({ type: 12, is_new: true })),
            { type: 13, is_new: true },
        ];
        const civilHeavy = [
            ...Array.from({ length: 20 }, () => ({ type: 13, is_new: true })),
            { type: 12, is_new: true },
        ];

        expect(await loadDocumentReminders(filteredList(photoHeavy))).toEqual({ photo: true, civil: true });
        expect(await loadDocumentReminders(filteredList(civilHeavy))).toEqual({ photo: true, civil: true });
        expect(visibleDocumentReminders(photoHeavy.slice(0, 20))).toEqual({ photo: true, civil: false });
        expect(visibleDocumentReminders(civilHeavy.slice(0, 20))).toEqual({ photo: false, civil: true });
    });

    it('keeps an Activity link after the reminder is read', () => {
        expect(activityActionHref(12)).toBe('/personal-photo?fromProfile=1');
        expect(activityActionHref(13)).toBe('/civil-id?fromProfile=1');
        expect(activityActionHref(14)).toBeNull();
    });
});

function filteredList(rows: { type: number; is_new: boolean }[]) {
    return async (_page: number, urlParams = '') => {
        if (urlParams !== PHOTO_REMINDER_QUERY && urlParams !== CIVIL_REMINDER_QUERY) {
            return { data: rows.slice(0, 20) };
        }
        const type = urlParams === PHOTO_REMINDER_QUERY ? 12 : 13;
        return { data: rows.filter((row) => row.type === type && row.is_new).slice(0, 1) };
    };
}
