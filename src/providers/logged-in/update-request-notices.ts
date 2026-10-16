export type ActivityNotice = {
    type?: number;
    is_new?: boolean;
};

export function visibleDocumentReminders(notifications: ActivityNotice[] | null | undefined) {
    const list = Array.isArray(notifications) ? notifications : [];

    return {
        photo: list.some((notification) => notification.type === 12 && notification.is_new === true),
        civil: list.some((notification) => notification.type === 13 && notification.is_new === true),
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
