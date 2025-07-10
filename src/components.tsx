"use client";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { use$ } from "@legendapp/state/react";
import {
  WindowManagerContextValue,
  WindowManagerProviderProps,
  WindowProps,
  WindowTypesRegistry,
  WindowRendererProps,
} from "./types";

export const WindowManagerContext =
  createContext<WindowManagerContextValue<any> | null>(null);

export const WindowManagerProvider = <WindowTypes extends string>({
  windowTypes: initialWindowTypes = {} as WindowTypesRegistry<WindowTypes>,
  windowManager,
  children,
}: WindowManagerProviderProps<WindowTypes>) => {
  const [windowTypes, setWindowTypes] = useState(initialWindowTypes);

  const registerWindowType = useCallback(
    (
      type: WindowTypes,
      component: React.ComponentType<WindowProps<WindowTypes>>
    ) => {
      setWindowTypes((prev: WindowTypesRegistry<WindowTypes>) => ({
        ...prev,
        [type]: component,
      }));
    },
    []
  );

  const unregisterWindowType = useCallback((type: WindowTypes) => {
    setWindowTypes((prev: WindowTypesRegistry<WindowTypes>) => {
      const newTypes = { ...prev };
      delete newTypes[type];
      return newTypes;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      windowManager,
      windowTypes,
      registerWindowType,
      unregisterWindowType,
    }),
    [windowManager, windowTypes, registerWindowType, unregisterWindowType]
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
    </WindowManagerContext.Provider>
  );
};

export const useWindowManagerContext = <WindowTypes extends string>() => {
  const context = useContext(
    WindowManagerContext
  ) as WindowManagerContextValue<WindowTypes> | null;
  if (!context) {
    throw new Error(
      "useWindowManagerContext must be used within a WindowManagerProvider"
    );
  }
  return context;
};

export const useWindows = <WindowTypes extends string>() => {
  const { windowManager } = useWindowManagerContext<WindowTypes>();
  return use$(windowManager.state$.windows);
};

export const useWindowActions = <WindowTypes extends string>() => {
  const { windowManager } = useWindowManagerContext<WindowTypes>();
  return windowManager.actions;
};

export const useFocusedWindow = <WindowTypes extends string>() => {
  const { windowManager } = useWindowManagerContext<WindowTypes>();
  return use$(() => {
    const windows = windowManager.state$.windows.get();
    return windows.find((w) => w.isFocused);
  });
};

export const useWindowCount = <WindowTypes extends string>() => {
  const { windowManager } = useWindowManagerContext<WindowTypes>();
  return use$(() => windowManager.state$.windows.get().length);
};

export const useWindowTypes = <WindowTypes extends string>() => {
  const context = useWindowManagerContext<WindowTypes>();
  return {
    windowTypes: context.windowTypes,
    registerWindowType: context.registerWindowType,
    unregisterWindowType: context.unregisterWindowType,
  };
};

export const useWindowManager = <WindowTypes extends string>() => {
  const { windowManager } = useWindowManagerContext<WindowTypes>();
  return windowManager;
};

export const WindowRenderer = <WindowTypes extends string>({
  className,
  style,
}: WindowRendererProps<WindowTypes> = {}) => {
  const windows = useWindows<WindowTypes>();
  const actions = useWindowActions<WindowTypes>();
  const { windowTypes } = useWindowTypes<WindowTypes>();

  return (
    <div className={className} style={style}>
      {windows.map((window) => {
        const WindowComponent = windowTypes[window.type];

        if (!WindowComponent) {
          console.warn(
            `No component registered for window type: ${window.type}`
          );
          return null;
        }

        const windowProps: WindowProps<WindowTypes> = {
          window,
          onClose: () => actions.close(window.id),
          onFocus: () => actions.focus(window.id),
          onMove: (position) => actions.move(window.id, position),
          onResize: (size) => actions.resize(window.id, size),
          onMinimize: () => actions.minimize(window.id),
          onMaximize: () => actions.maximize(window.id),
          onFullscreen: () => actions.fullscreen(window.id),
        };

        return React.createElement(WindowComponent, {
          key: window.id,
          ...windowProps,
        });
      })}
    </div>
  );
};
