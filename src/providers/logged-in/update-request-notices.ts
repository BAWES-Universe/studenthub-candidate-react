export type ActivityNotice = {
    type?: number;
    is_new?: boolean;
};

export const PHOTO_REMINDER_QUERY = '&is_new=1&types=12&per-page=1';
export const CIVIL_REMINDER_QUERY = '&is_new=1&types=13&per-page=1';

export function visibleDocumentReminders(notifications: ActivityNotice[] | null | undefined) {
    const list = Array.isArray(notifications) ? notifications : [];

    return {
        photo: list.some((notification) => notification.type === 12 && notification.is_new === true),
        civil: list.some((notification) => notification.type === 13 && notification.is_new === true),
    };
}

type NoticeList = (page: number, urlParams?: string) => Promise<{ data?: ActivityNotice[] | null } | null | undefined>;

export async function loadDocumentReminders(list: NoticeList) {
    const [photoResult, civilResult] = await Promise.allSettled([
        list(1, PHOTO_REMINDER_QUERY),
        list(1, CIVIL_REMINDER_QUERY),
    ]);

    return {
        photo: photoResult.status === 'fulfilled' && visibleDocumentReminders(photoResult.value?.data).photo,
        civil: civilResult.status === 'fulfilled' && visibleDocumentReminders(civilResult.value?.data).civil,
    };
}

export function activityActionHref(type: number | undefined): string | null {
    if (type === 12) {
        return '/personal-photo?fromProfile=1';
    }

    if (type === 13) {
        return '/civil-id?fromProfile=1';
    }

    return null;
}

export function isCustomStaffMessage(type: number | undefined) {
    return type === 14;
}
