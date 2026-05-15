import { describe, expect, test, vi } from 'vitest';
import { handleAxiosError } from './AxiosService';
import { error500$ } from './event.service';

describe('handleAxiosError', () => {
  test('does not emit global server error when request suppresses global error handling', async () => {
    const next = vi.fn();
    const subscription = error500$.subscribe(next);

    await expect(handleAxiosError({
      config: { suppressGlobalErrorHandler: true },
      response: { status: 500, statusText: 'Server Error' },
    })).rejects.toMatchObject({ response: { status: 500 } });

    expect(next).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
