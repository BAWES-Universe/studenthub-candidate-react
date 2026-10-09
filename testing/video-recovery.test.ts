import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    applyRemovalResult,
    applySavedVideo,
    applyWatchedVideoStatus,
    sanitizedVideoRemovalError,
    showsExistingUploadControls,
} from '../src/pages/(auth)/video/video-recovery';

const pending = {
    candidate_name: 'Noura',
    candidate_email: 'noura@example.test',
    candidate_video: 'stuck-output_1',
    candidate_video_processed: 0,
};

describe('stuck candidate video recovery', () => {
    it('removes a pending video, restores upload controls, then accepts an MP4 replacement', () => {
        const failed = applyRemovalResult(pending, { operation: 'error', message: 'Could not remove video.' });
        expect(failed.cleared).toBe(false);
        expect(failed.user).toBe(pending);
        expect(showsExistingUploadControls(failed.user.candidate_video)).toBe(false);

        const removed = applyRemovalResult(pending, { operation: 'success' });
        expect(removed.cleared).toBe(true);
        expect(removed.user.candidate_video).toBeNull();
        expect(removed.user.candidate_video_processed).toBe(true);
        expect(removed.user.candidate_name).toBe('Noura');
        expect(removed.user.candidate_email).toBe('noura@example.test');
        expect(showsExistingUploadControls(removed.user.candidate_video)).toBe(true);

        const saved = applySavedVideo(removed.user, {
            operation: 'success',
            candidate_video: 'ready_1',
            candidate_video_processed: 1,
        });
        expect(saved.candidate_video).toBe('ready_1');
        expect(saved.candidate_video_processed).toBe(1);
        expect(saved.candidate_name).toBe('Noura');
        expect(showsExistingUploadControls(saved.candidate_video)).toBe(false);
    });

    it('ignores a failed save and an old status after removal or replacement', () => {
        const removed = applyRemovalResult(pending, { operation: 'success' }).user;
        const staleAfterRemoval = applyWatchedVideoStatus(removed, {
            candidate_video: 'stuck-output_1',
            candidate_video_processed: 1,
        }, {
            epoch: 0,
            currentEpoch: 1,
            watchedVideo: 'stuck-output_1',
        });
        expect(staleAfterRemoval).toBe(removed);

        const rejectedSave = applySavedVideo(removed, { operation: 'error', candidate_video: 'ready_1' });
        expect(rejectedSave).toBe(removed);

        const replaced = applySavedVideo(removed, {
            operation: 'success',
            candidate_video: 'ready_1',
            candidate_video_processed: 1,
        });
        const staleAfterReplacement = applyWatchedVideoStatus(replaced, {
            candidate_video: 'stuck-output_1',
            candidate_video_processed: 1,
        }, {
            epoch: 1,
            currentEpoch: 2,
            watchedVideo: 'stuck-output_1',
        });
        expect(staleAfterReplacement.candidate_video).toBe('ready_1');
        expect(staleAfterReplacement.candidate_name).toBe('Noura');
    });

    it('accepts a current-job failure that clears the video and rejects a stale clear', () => {
        const cleared = applyWatchedVideoStatus(pending, {
            candidate_video: null,
            candidate_video_processed: 1,
        }, {
            epoch: 0,
            currentEpoch: 0,
            watchedVideo: 'stuck-output_1',
        });
        expect(cleared.candidate_video).toBeNull();
        expect(cleared.candidate_video_processed).toBe(1);
        expect(cleared.candidate_name).toBe('Noura');
        expect(cleared.candidate_email).toBe('noura@example.test');
        expect(showsExistingUploadControls(cleared.candidate_video)).toBe(true);

        const duringRemoval = applyWatchedVideoStatus(pending, {
            candidate_video: null,
            candidate_video_processed: 1,
        }, {
            epoch: 0,
            currentEpoch: 1,
            watchedVideo: 'stuck-output_1',
        });
        expect(duringRemoval).toBe(pending);

        const replaced = applySavedVideo(pending, {
            operation: 'success',
            candidate_video: 'ready_1',
            candidate_video_processed: 1,
        });
        const staleClear = applyWatchedVideoStatus(replaced, {
            candidate_video: null,
            candidate_video_processed: 1,
        }, {
            epoch: 2,
            currentEpoch: 2,
            watchedVideo: 'stuck-output_1',
        });
        expect(staleClear.candidate_video).toBe('ready_1');
        expect(staleClear.candidate_name).toBe('Noura');
    });

    it('still applies the current video completion and ignores progress', () => {
        const ready = applyWatchedVideoStatus(pending, {
            candidate_video: 'stuck-output_1',
            candidate_video_processed: 1,
        }, {
            epoch: 0,
            currentEpoch: 0,
            watchedVideo: 'stuck-output_1',
        });
        expect(ready.candidate_video).toBe('stuck-output_1');
        expect(ready.candidate_video_processed).toBe(1);
        expect(ready.candidate_name).toBe('Noura');

        const progress = applyWatchedVideoStatus(pending, {
            candidate_video: 'stuck-output_1',
            candidate_video_processed: 0,
        }, {
            epoch: 0,
            currentEpoch: 0,
            watchedVideo: 'stuck-output_1',
        });
        expect(progress).toBe(pending);
    });

    it('shows a short sanitized removal error', () => {
        const fallback = 'Could not remove the video. Please try again.';
        expect(sanitizedVideoRemovalError('Could not remove video.', fallback)).toBe('Could not remove video.');
        expect(sanitizedVideoRemovalError({ candidate_video: ['SQLSTATE leak'] }, fallback)).toBe(fallback);
        expect(sanitizedVideoRemovalError('noura@example.test failed', fallback)).toBe(fallback);
    });

    it('keeps Remove Intro available while the page shows a processing video', () => {
        const page = readFileSync('src/pages/(auth)/video/page.tsx', 'utf8');
        const processingStart = page.indexOf('!user?.candidate_video_processed &&');
        const processedStart = page.indexOf('!!user?.candidate_video_processed &&');
        expect(processingStart).toBeGreaterThan(-1);
        expect(processedStart).toBeGreaterThan(processingStart);
        expect(page.slice(processingStart, processedStart)).toContain('removeIntroButton()');
        expect(page).toContain('applyRemovalResult');
        expect(page).toContain('applyWatchedVideoStatus');
        expect(page).toContain('showsExistingUploadControls');
        expect(page).toContain('removalInFlight.current');
        expect(page).toContain('disabled={removingVideo}');
    });
});
