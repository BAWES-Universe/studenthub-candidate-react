export type VideoProfile = {
    candidate_video?: string | null;
    candidate_video_processed?: boolean | number | null;
};

export type VideoStatus = {
    candidate_video?: string | null;
    candidate_video_processed?: boolean | number | null;
};

export type VideoWatch = {
    epoch: number;
    currentEpoch: number;
    watchedVideo: string | null;
};

export function showsExistingUploadControls(video: string | null | undefined): boolean {
    return !video;
}

export function applyRemovalResult<T extends VideoProfile>(
    user: T,
    response: { operation?: string } | null | undefined,
): { user: T; cleared: boolean } {
    if (!response || response.operation !== 'success') {
        return { user, cleared: false };
    }

    return {
        cleared: true,
        user: {
            ...user,
            candidate_video: null,
            candidate_video_processed: true,
        },
    };
}

export function applySavedVideo<T extends VideoProfile>(
    user: T,
    response: { operation?: string; candidate_video?: string | null; candidate_video_processed?: boolean | number | null } | null | undefined,
): T {
    if (!response || response.operation !== 'success' || !response.candidate_video) {
        return user;
    }

    return {
        ...user,
        candidate_video: response.candidate_video,
        candidate_video_processed: response.candidate_video_processed,
    };
}

/**
 * A status poll or stored subscription may update the video only for the job
 * that is still on screen. Removal and replacement move the epoch forward.
 */
export function applyWatchedVideoStatus<T extends VideoProfile>(
    user: T,
    status: VideoStatus | null | undefined,
    watch: VideoWatch,
): T {
    if (!status || watch.epoch !== watch.currentEpoch) {
        return user;
    }

    if (!watch.watchedVideo || user.candidate_video !== watch.watchedVideo) {
        return user;
    }

    if (!status.candidate_video_processed || status.candidate_video !== watch.watchedVideo) {
        return user;
    }

    return {
        ...user,
        candidate_video: status.candidate_video,
        candidate_video_processed: status.candidate_video_processed,
    };
}

export function sanitizedVideoRemovalError(message: unknown, fallback: string): string {
    if (typeof message !== 'string') {
        return fallback;
    }

    const text = message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text || text.length > 180 || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
        return fallback;
    }

    return text;
}
