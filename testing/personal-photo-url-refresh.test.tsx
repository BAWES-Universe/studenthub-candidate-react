import { useState } from 'react';
import { act, render, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    useMissingPersonalPhotoUrlRefresh,
    type PersonalPhotoRefreshUser,
} from '../src/providers/logged-in/personal-photo-url-refresh';

const storedKey = 'candidate-profile-photos/existing.jpg';
const resolvedUrl = 'https://cdn.example.test/candidate-profile-photos/existing.jpg';

function deferred<T>() {
    let resolve: (value: T) => void = () => {};
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

function PhotoRefreshHarness(props: {
    initialUser: PersonalPhotoRefreshUser | null;
    loadProfile: () => Promise<PersonalPhotoRefreshUser>;
    formKey: { current: string };
    onApply?: (photo: PersonalPhotoRefreshUser) => void;
}) {
    const [user, setUser] = useState(props.initialUser);
    const [form, setForm] = useState({
        key: props.initialUser?.candidate_personal_photo || '',
        url: props.initialUser?.candidate_personal_photo_url || '',
    });
    const formKey = props.formKey;
    const onApply = props.onApply;
    const loadProfile = props.loadProfile;

    useMissingPersonalPhotoUrlRefresh({
        user,
        formPhotoKey: () => formKey.current,
        loadProfile,
        apply: (photo) => {
            setUser((current) => current ? {
                ...current,
                candidate_personal_photo: photo.candidate_personal_photo,
                candidate_personal_photo_url: photo.candidate_personal_photo_url,
            } : current);
            setForm({
                key: photo.candidate_personal_photo,
                url: photo.candidate_personal_photo_url,
            });
            if (onApply) {
                onApply(photo);
            }
        },
    });

    return (
        <div>
            <span data-testid="form-key">{form.key}</span>
            <span data-testid="form-url">{form.url}</span>
            <span data-testid="store-url">{user?.candidate_personal_photo_url || ''}</span>
        </div>
    );
}

describe('missing personal photo URL refresh', () => {
    it('loads the resolved URL once into the store and the form', async () => {
        let calls = 0;
        const view = render(
            <PhotoRefreshHarness
                initialUser={{ candidate_personal_photo: storedKey, candidate_personal_photo_url: '' }}
                formKey={{ current: storedKey }}
                loadProfile={async () => {
                    calls += 1;
                    return {
                        candidate_personal_photo: storedKey,
                        candidate_personal_photo_url: resolvedUrl,
                    };
                }}
            />
        );

        await waitFor(() => {
            expect(view.getByTestId('form-url').textContent).toBe(resolvedUrl);
        });
        expect(view.getByTestId('store-url').textContent).toBe(resolvedUrl);
        expect(view.getByTestId('form-key').textContent).toBe(storedKey);
        expect(calls).toBe(1);

        view.rerender(
            <PhotoRefreshHarness
                initialUser={{ candidate_personal_photo: storedKey, candidate_personal_photo_url: '' }}
                formKey={{ current: storedKey }}
                loadProfile={async () => {
                    calls += 1;
                    return {
                        candidate_personal_photo: storedKey,
                        candidate_personal_photo_url: resolvedUrl,
                    };
                }}
            />
        );
        expect(calls).toBe(1);
    });

    it('does not ask again when the profile response has no URL', async () => {
        let calls = 0;
        const view = render(
            <PhotoRefreshHarness
                initialUser={{ candidate_personal_photo: storedKey }}
                formKey={{ current: storedKey }}
                loadProfile={async () => {
                    calls += 1;
                    return { candidate_personal_photo: 'candidate-profile-photos/other.jpg', candidate_personal_photo_url: null };
                }}
            />
        );

        await waitFor(() => {
            expect(view.getByTestId('form-key').textContent).toBe('candidate-profile-photos/other.jpg');
        });
        expect(view.getByTestId('form-url').textContent).toBe('');
        expect(view.getByTestId('store-url').textContent).toBe('');
        expect(calls).toBe(1);
    });

    it('leaves a newly selected photo in place when the refresh finishes', async () => {
        const pending = deferred<PersonalPhotoRefreshUser>();
        const applied: PersonalPhotoRefreshUser[] = [];
        const formKey = { current: storedKey };
        let started = false;
        render(
            <PhotoRefreshHarness
                initialUser={{ candidate_personal_photo: storedKey, candidate_personal_photo_url: '' }}
                formKey={formKey}
                loadProfile={() => {
                    started = true;
                    return pending.promise;
                }}
                onApply={(photo) => applied.push(photo)}
            />
        );

        await waitFor(() => {
            expect(started).toBe(true);
        });
        formKey.current = 'temp-new-photo.jpg';
        await act(async () => {
            pending.resolve({
                candidate_personal_photo: storedKey,
                candidate_personal_photo_url: resolvedUrl,
            });
            await pending.promise;
        });
        expect(applied).toEqual([]);
        expect(formKey.current).toBe('temp-new-photo.jpg');
    });

    it('does not load when the URL is already present or the photo key is missing', async () => {
        let calls = 0;
        const loadProfile = async () => {
            calls += 1;
            return { candidate_personal_photo_url: resolvedUrl };
        };

        const withUrl = render(
            <PhotoRefreshHarness
                initialUser={{
                    candidate_personal_photo: storedKey,
                    candidate_personal_photo_url: resolvedUrl,
                }}
                formKey={{ current: storedKey }}
                loadProfile={loadProfile}
            />
        );
        const withoutKey = render(
            <PhotoRefreshHarness
                initialUser={{ candidate_personal_photo: '', candidate_personal_photo_url: '' }}
                formKey={{ current: '' }}
                loadProfile={loadProfile}
            />
        );

        await waitFor(() => {
            expect(within(withUrl.container).getByTestId('form-url').textContent).toBe(resolvedUrl);
            expect(within(withoutKey.container).getByTestId('form-key').textContent).toBe('');
        });
        expect(calls).toBe(0);
    });
});
