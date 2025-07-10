import React from "react";
import { Observable } from "@legendapp/state";

// === Core Window Types ===
export type AppWindow<WindowTypes extends string> = {
  id: string;
  type: WindowTypes;
  props: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: "normal" | "maximized" | "minimized" | "fullscreen";
  zIndex: number;
  isFocused: boolean;
};

// === Window Component Props ===
export type WindowProps<WindowTypes extends string> = {
  window: AppWindow<WindowTypes>;
  onClose: () => void;
  onFocus: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onResize: (size: { width: number; height: number }) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFullscreen: () => void;
};

// === Window Types Registry ===
export type WindowTypesRegistry<T extends string> = Record<
  T,
  React.ComponentType<WindowProps<T>>
>;

// === State Management with Legend State ===
export type AppWindowManagerState<WindowTypes extends string> = {
  windows: AppWindow<WindowTypes>[];
  containerSize: { width: number; height: number };
  nextZIndex: number;
};

// === Window Manager Actions ===
export type AppWindowManagerActions<WindowTypes extends string> = {
  open: (
    type: WindowTypes,
    props: any,
    options?: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      id?: string;
    }
  ) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, position: { x: number; y: number }) => void;
  resize: (id: string, size: { width: number; height: number }) => void;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  fullscreen: (id: string) => void;
  unfullscreen: (id: string) => void;
  setContainerSize: (size: { width: number; height: number }) => void;
  // Window management utilities
  getWindow: (id: string) => AppWindow<WindowTypes> | undefined;
  getWindowsByType: (type: WindowTypes) => AppWindow<WindowTypes>[];
  getFocusedWindow: () => AppWindow<WindowTypes> | undefined;
  closeAll: () => void;
  closeByType: (type: WindowTypes) => void;
};

// === Observable Store Type ===
export type AppWindowManagerStore<WindowTypes extends string> = Observable<
  AppWindowManagerState<WindowTypes>
>;

// === Helper Functions ===
export const generateWindowId = (): string => {
  return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getHighestZIndex = (windows: AppWindow<any>[]): number => {
  return windows.reduce((max, window) => Math.max(max, window.zIndex), 0);
};

// === Window Manager with Actions ===
export type AppWindowManager<WindowTypes extends string> = {
  state$: AppWindowManagerStore<WindowTypes>;
  actions: AppWindowManagerActions<WindowTypes>;
};

// === Context Types ===
export type WindowManagerContextValue<WindowTypes extends string> = {
  windowManager: AppWindowManager<WindowTypes>;
  windowTypes: WindowTypesRegistry<WindowTypes>;
  registerWindowType: (
    type: WindowTypes,
    component: React.ComponentType<WindowProps<WindowTypes>>
  ) => void;
  unregisterWindowType: (type: WindowTypes) => void;
};

// === Provider Props ===
export type WindowManagerProviderProps<WindowTypes extends string> = {
  windowTypes?: WindowTypesRegistry<WindowTypes>;
  windowManager: AppWindowManager<WindowTypes>;
  children: React.ReactNode;
};

// === Window Renderer Props ===
export type WindowRendererProps<WindowTypes extends string> = {
  className?: string;
  style?: React.CSSProperties;
};

// === Window Container Props ===
export type WindowContainerProps<WindowTypes extends string> = {
  window: AppWindow<WindowTypes>;
  onClose?: () => void;
  onFocus?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFullscreen?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // Additional customization options
  showHeader?: boolean;
  headerHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
};
