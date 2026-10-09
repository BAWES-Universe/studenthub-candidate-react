import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import { store } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';

const deleteVideo = vi.fn();
const checkVideoStatus = vi.fn();
const updateVideo = vi.fn();
const uploadFileToTempS3 = vi.fn();

vi.mock('@/providers/logged-in/account.service', () => ({
    deleteVideo: (...args: unknown[]) => deleteVideo(...args),
    checkVideoStatus: (...args: unknown[]) => checkVideoStatus(...args),
    updateVideo: (...args: unknown[]) => updateVideo(...args),
    profile: vi.fn(),
    deleteResume: vi.fn(),
    updateResume: vi.fn(),
}));

vi.mock('@/providers/logged-in/aws.service', () => ({
    uploadFileToTempS3: (...args: unknown[]) => uploadFileToTempS3(...args),
    getFileMetadata: vi.fn(),
}));

vi.mock('@/providers/analytics.service', () => ({
    page: vi.fn(),
    track: vi.fn(),
}));

vi.mock('@ionic/react', () => ({
    useIonRouter: () => ({ push: vi.fn() }),
}));

import VideoPage from '../src/pages/(auth)/video/page';

const pendingUser = {
    candidate_id: '17',
    candidate_name: 'Noura',
    candidate_email: 'noura@example.test',
    candidate_video: 'stuck-output_1',
    candidate_video_processed: 0,
};

function AlertProbe() {
    const { alertDialogs } = useAlertDialog();
    return (
        <div>
            {alertDialogs.map((dialog) => (
                <p key={dialog.id}>{dialog.description}</p>
            ))}
        </div>
    );
}

function renderVideoPage() {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <AlertProbe />
                <VideoPage />
            </MemoryRouter>
        </Provider>
    );
}

function pendingStatus() {
    return Promise.resolve({
        candidate_video: 'stuck-output_1',
        candidate_video_processed: 0,
    });
}

beforeEach(() => {
    localStorage.clear();
    deleteVideo.mockReset();
    checkVideoStatus.mockReset();
    updateVideo.mockReset();
    uploadFileToTempS3.mockReset();
    checkVideoStatus.mockImplementation(pendingStatus);
    store.dispatch(setUser({ user: { ...pendingUser } }));
});

describe('rendered stuck video recovery', () => {
    it('removes a processing video, restores upload controls, then saves an MP4 replacement', async () => {
        const user = userEvent.setup();
        deleteVideo.mockResolvedValue({ operation: 'success' });
        uploadFileToTempS3.mockReturnValue({
            on: () => undefined,
            done: () => Promise.resolve({ Key: 'temp/intro.mp4' }),
        });
        updateVideo.mockResolvedValue({
            operation: 'success',
            candidate_video: 'ready_1',
            candidate_video_processed: 1,
        });
        const originalSrc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
        Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            configurable: true,
            get() {
                return originalSrc?.get ? originalSrc.get.call(this) : '';
            },
            set(value: string) {
                if (originalSrc?.set) {
                    originalSrc.set.call(this, value);
                }
                Object.defineProperty(this, 'duration', { configurable: true, value: 10 });
                queueMicrotask(() => {
                    if (typeof this.onloadedmetadata === 'function') {
                        this.onloadedmetadata(new Event('loadedmetadata'));
                    }
                });
            },
        });
        if (!URL.createObjectURL) {
            URL.createObjectURL = () => 'blob:video';
        }

        renderVideoPage();

        expect(screen.getByText('Making your video ready')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Remove Intro/i }));

        expect(await screen.findByText('Upload video')).toBeInTheDocument();
        expect(screen.getByText('Record yourself')).toBeInTheDocument();
        expect(screen.queryByText('Making your video ready')).not.toBeInTheDocument();
        expect(store.getState().user.user?.candidate_video).toBeNull();
        expect(store.getState().user.user?.candidate_name).toBe('Noura');
        expect(deleteVideo).toHaveBeenCalledTimes(1);

        const input = document.getElementById('videoUpload') as HTMLInputElement;
        const file = new File(['video-bytes'], 'intro.mp4', { type: 'video/mp4' });
        await user.upload(input, file);

        await waitFor(() => {
            expect(store.getState().user.user?.candidate_video).toBe('ready_1');
        });
        expect(store.getState().user.user?.candidate_video_processed).toBe(1);
        expect(store.getState().user.user?.candidate_name).toBe('Noura');
        expect(store.getState().user.user?.candidate_email).toBe('noura@example.test');
        expect(document.querySelector('source[src*="ready_1.mp4"]')).not.toBeNull();
        expect(screen.queryByText('Upload video')).not.toBeInTheDocument();
        expect(updateVideo).toHaveBeenCalledWith('temp/intro.mp4');

        if (originalSrc) {
            Object.defineProperty(HTMLMediaElement.prototype, 'src', originalSrc);
        }
    });

    it('keeps the processing video when removal fails and ignores a second click', async () => {
        let resolveRemoval: (value: { operation: string; message?: string }) => void = () => {};
        deleteVideo.mockImplementation(() => new Promise((resolve) => {
            resolveRemoval = resolve;
        }));

        renderVideoPage();
        const button = screen.getByRole('button', { name: /Remove Intro/i });
        await act(async () => {
            button.click();
            button.click();
        });
        expect(deleteVideo).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: /Removing/i })).toBeDisabled();

        await act(async () => {
            resolveRemoval({ operation: 'error', message: 'Could not remove video.' });
        });

        expect(await screen.findByText('Could not remove video.')).toBeInTheDocument();
        expect(screen.getByText('Making your video ready')).toBeInTheDocument();
        expect(store.getState().user.user?.candidate_video).toBe('stuck-output_1');
        expect(store.getState().user.user?.candidate_name).toBe('Noura');
        expect(store.getState().user.user?.candidate_email).toBe('noura@example.test');
        expect(deleteVideo).toHaveBeenCalledTimes(1);
    });

    it('clears the form when the current job fails', async () => {
        checkVideoStatus.mockResolvedValue({
            candidate_video: null,
            candidate_video_processed: 1,
        });

        renderVideoPage();
        expect(screen.getByText('Making your video ready')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Upload video')).toBeInTheDocument();
        }, { timeout: 4000 });

        expect(screen.queryByText('Making your video ready')).not.toBeInTheDocument();
        expect(store.getState().user.user?.candidate_video).toBeNull();
        expect(store.getState().user.user?.candidate_name).toBe('Noura');
        expect(store.getState().user.user?.candidate_email).toBe('noura@example.test');
    }, 10000);
});
