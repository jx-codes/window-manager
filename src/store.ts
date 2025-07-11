import { observable } from "@legendapp/state";
import {
  AppWindowManagerStore,
  AppWindowManagerActions,
  AppWindowManager,
  AppWindow,
  generateWindowId,
  getHighestZIndex,
} from "./types";

// === Store Creator Function ===
export const createWindowManagerStore = <
  WindowTypes extends string,
>(): AppWindowManager<WindowTypes> => {
  // Create the observable state
  const state$: AppWindowManagerStore<WindowTypes> = observable({
    windows: [] as AppWindow<WindowTypes>[],
    containerSize: { width: 0, height: 0 },
    nextZIndex: 1,
  });

  // Create the actions that manipulate the observable state
  const actions: AppWindowManagerActions<WindowTypes> = {
    setContainerSize: (size: { width: number; height: number }) => {
      state$.containerSize.set(size);
    },

    open: (type: WindowTypes, props: any, options = {}) => {
      const currentState = state$.get();
      const id = options.id || generateWindowId();

      // Check if window with this ID already exists
      if (currentState.windows.find((w) => w.id === id)) {
        console.warn(`Window with ID ${id} already exists`);
        return;
      }

      const newWindow: AppWindow<WindowTypes> = {
        id,
        type,
        props,
        position: options.position || { x: 100, y: 100 },
        size: options.size || { width: 400, height: 300 },
        state: "normal",
        zIndex: currentState.nextZIndex,
        isFocused: true,
        isPinned: false,
      };

      // Update all windows to be unfocused, then add the new focused window
      state$.windows.set([
        ...currentState.windows.map((w) => ({ ...w, isFocused: false })),
        newWindow,
      ]);

      // Increment the next z-index
      state$.nextZIndex.set(currentState.nextZIndex + 1);
    },

    close: (id: string) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.filter((window) => window.id !== id)
      );
    },

    focus: (id: string) => {
      const currentState = state$.get();
      const targetWindow = currentState.windows.find((w) => w.id === id);

      if (!targetWindow) return;

      // Only increment zIndex if the window isn't already focused
      if (!targetWindow.isFocused) {
        const highestZIndex = getHighestZIndex(currentState.windows);
        const newZIndex = highestZIndex + 1;

        state$.windows.set(
          currentState.windows.map((window) => ({
            ...window,
            isFocused: window.id === id,
            zIndex: window.id === id ? newZIndex : window.zIndex,
          }))
        );

        state$.nextZIndex.set(newZIndex + 1);
      }
    },

    move: (id: string, position: { x: number; y: number }) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id ? { ...window, position } : window
        )
      );
    },

    resize: (id: string, size: { width: number; height: number }) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id ? { ...window, size } : window
        )
      );
    },

    maximize: (id: string) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id ? { ...window, state: "maximized" as const } : window
        )
      );
    },

    minimize: (id: string) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id ? { ...window, state: "minimized" as const } : window
        )
      );
    },

    fullscreen: (id: string) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id
            ? { ...window, state: "fullscreen" as const }
            : window
        )
      );
    },

    unfullscreen: (id: string) => {
      const currentState = state$.get();
      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id ? { ...window, state: "normal" as const } : window
        )
      );
    },

    pin: (id: string) => {
      const currentState = state$.get();
      const targetWindow = currentState.windows.find((w) => w.id === id);

      if (!targetWindow || targetWindow.isPinned) return;

      // Get the highest z-index among all windows
      const highestZIndex = getHighestZIndex(currentState.windows);
      const newZIndex = highestZIndex + 1000; // Add a large offset to ensure pinned windows stay on top

      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id
            ? { ...window, isPinned: true, zIndex: newZIndex }
            : window
        )
      );

      state$.nextZIndex.set(newZIndex + 1);
    },

    unpin: (id: string) => {
      const currentState = state$.get();
      const targetWindow = currentState.windows.find((w) => w.id === id);

      if (!targetWindow || !targetWindow.isPinned) return;

      // Get the highest z-index among non-pinned windows
      const nonPinnedWindows = currentState.windows.filter(
        (w) => w.id !== id && !w.isPinned
      );
      const highestNonPinnedZIndex =
        nonPinnedWindows.length > 0 ? getHighestZIndex(nonPinnedWindows) : 0;
      const newZIndex = highestNonPinnedZIndex + 1;

      state$.windows.set(
        currentState.windows.map((window) =>
          window.id === id
            ? { ...window, isPinned: false, zIndex: newZIndex }
            : window
        )
      );

      state$.nextZIndex.set(newZIndex + 1);
    },

    // === Utility Methods ===
    getWindow: (id: string) => {
      const currentState = state$.get();
      return currentState.windows.find((w) => w.id === id);
    },

    getWindowsByType: (type: WindowTypes) => {
      const currentState = state$.get();
      return currentState.windows.filter((w) => w.type === type);
    },

    getFocusedWindow: () => {
      const currentState = state$.get();
      return currentState.windows.find((w) => w.isFocused);
    },

    closeAll: () => {
      state$.windows.set([]);
    },

    closeByType: (type: WindowTypes) => {
      const currentState = state$.get();
      state$.windows.set(currentState.windows.filter((w) => w.type !== type));
    },
  };

  return {
    state$,
    actions,
  };
};

// === Convenience function for creating a window manager ===
export const createWindowManager = <WindowTypes extends string>() => {
  return createWindowManagerStore<WindowTypes>();
};
