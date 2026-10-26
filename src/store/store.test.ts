import { afterEach, describe, expect, it, vi } from 'vitest';
import { store } from './store';

describe('store persistence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('persists state to localStorage on dispatch', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    store.dispatch({ type: '@@test/noop' });

    expect(setItem).toHaveBeenCalledWith('state', expect.any(String));
  });

  it('does not throw when localStorage rejects writes (e.g. Safari SecurityError)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => store.dispatch({ type: '@@test/noop' })).not.toThrow();
    expect(() => store.dispatch({ type: '@@test/noop' })).not.toThrow();

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
