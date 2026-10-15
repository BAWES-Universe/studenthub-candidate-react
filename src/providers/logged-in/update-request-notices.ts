export type UpdateRequestNotice = {
    type?: string;
    requested_at?: string;
};

export function visibleUpdateNotices(requests: UpdateRequestNotice[] | null | undefined) {
    const list = Array.isArray(requests) ? requests : [];

    return {
        photo: list.some((request) => request.type === 'profile_photo'),
        civil: list.some((request) => request.type === 'civil_id'),
    };
}

export function activityActionHref(type: number | undefined, status: string | null | undefined): string | null {
    if (status !== 'pending') {
        return null;
    }

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
