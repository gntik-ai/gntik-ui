import { createCommandPaletteStore } from './commandPaletteStore';

describe('createCommandPaletteStore', () => {
  it('starts closed and opens, closes and toggles', () => {
    const store = createCommandPaletteStore();
    expect(store.isOpen()).toBe(false);
    store.open();
    expect(store.isOpen()).toBe(true);
    store.toggle();
    expect(store.isOpen()).toBe(false);
    store.toggle();
    expect(store.isOpen()).toBe(true);
    store.close();
    expect(store.isOpen()).toBe(false);
  });

  it('notifies subscribers once per real change and stops after unsubscribe', () => {
    const store = createCommandPaletteStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.open();
    store.open();
    expect(listener).toHaveBeenCalledTimes(1);
    store.close();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.open();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
