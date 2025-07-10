# React Window Manager

A powerful, type-safe React library for building desktop-style window management interfaces. Built with TypeScript and reactive state management for smooth, performant window interactions.

## Features

- **🖥️ Full Window Management**: Create, close, focus, move, resize, minimize, maximize, and fullscreen windows
- **🎯 Type-Safe**: Built with TypeScript generics for complete type safety across window types
- **⚡ Reactive State**: Powered by `@legendapp/state` for optimal performance and reactivity
- **🎨 Customizable**: Fully customizable window components with flexible styling options
- **🖱️ Interactive**: Built-in dragging, resizing, and focus management
- **📱 Responsive**: Automatic container size management and window constraints
- **🔧 Extensible**: Plugin-style window type registration system

## Installation

```bash
npm install @jx/react-window-manager
```

## Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React from "react";
import {
  createWindowManager,
  WindowManagerProvider,
  WindowRenderer,
  Window,
  useWindowActions,
} from "@jx/react-window-manager";

// Define your window types
type AppWindowTypes = "text-editor" | "file-browser" | "calculator";

// Create a window manager instance
const windowManager = createWindowManager<AppWindowTypes>();

// Create window components
const TextEditor = ({ window, onClose }) => (
  <Window window={window} onClose={onClose}>
    <div style={{ padding: "20px" }}>
      <h3>Text Editor</h3>
      <textarea style={{ width: "100%", height: "200px" }} />
    </div>
  </Window>
);

const Calculator = ({ window, onClose }) => (
  <Window window={window} onClose={onClose}>
    <div style={{ padding: "20px" }}>
      <h3>Calculator</h3>
      <div>Calculator UI goes here...</div>
    </div>
  </Window>
);

// Register window types
const windowTypes = {
  "text-editor": TextEditor,
  calculator: Calculator,
};

// App component
function App() {
  return (
    <WindowManagerProvider
      windowManager={windowManager}
      windowTypes={windowTypes}
    >
      <AppContent />
    </WindowManagerProvider>
  );
}

// Component that can open windows
function AppContent() {
  const actions = useWindowActions<AppWindowTypes>();

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div style={{ padding: "20px" }}>
        <button onClick={() => actions.open("text-editor", {})}>
          Open Text Editor
        </button>
        <button onClick={() => actions.open("calculator", {})}>
          Open Calculator
        </button>
      </div>

      <WindowRenderer />
    </div>
  );
}
```

## Core Concepts

### Window Manager

The window manager is the central state container that manages all windows:

```tsx
import { createWindowManager } from "@jx/react-window-manager";

const windowManager = createWindowManager<"myWindowType">();
```

### Window Types

Define your application's window types using TypeScript string literals:

```tsx
type MyWindowTypes = "dashboard" | "settings" | "chat" | "notifications";
```

### Window States

Windows can be in different states:

- `normal`: Standard windowed state
- `maximized`: Fills the entire container
- `minimized`: Hidden but still in memory
- `fullscreen`: Covers the entire viewport

## API Reference

### Hooks

#### `useWindowActions()`

Access window management actions:

```tsx
const actions = useWindowActions<WindowTypes>();

// Open a new window
actions.open(
  "myWindowType",
  { title: "Hello" },
  {
    position: { x: 100, y: 100 },
    size: { width: 400, height: 300 },
  }
);

// Close a window
actions.close("window-id");

// Focus a window
actions.focus("window-id");

// Move a window
actions.move("window-id", { x: 200, y: 150 });

// Resize a window
actions.resize("window-id", { width: 500, height: 400 });
```

#### `useWindows()`

Get all currently open windows:

```tsx
const windows = useWindows<WindowTypes>();
```

#### `useFocusedWindow()`

Get the currently focused window:

```tsx
const focusedWindow = useFocusedWindow<WindowTypes>();
```

#### `useWindowCount()`

Get the total number of open windows:

```tsx
const windowCount = useWindowCount<WindowTypes>();
```

### Components

#### `<WindowManagerProvider>`

Context provider for the window manager:

```tsx
<WindowManagerProvider windowManager={windowManager} windowTypes={windowTypes}>
  {children}
</WindowManagerProvider>
```

#### `<WindowRenderer>`

Renders all open windows:

```tsx
<WindowRenderer className="window-container" />
```

#### `<Window>`

Container component for individual windows with built-in dragging and resizing:

```tsx
<Window
  window={window}
  onClose={onClose}
  showHeader={true}
  draggable={true}
  resizable={true}
>
  {windowContent}
</Window>
```

### Window Actions

All window actions are available through the `useWindowActions` hook:

- `open(type, props, options)` - Create a new window
- `close(id)` - Close a window
- `focus(id)` - Bring a window to front
- `move(id, position)` - Move a window
- `resize(id, size)` - Resize a window
- `minimize(id)` - Minimize a window
- `maximize(id)` - Maximize a window
- `fullscreen(id)` - Make a window fullscreen
- `closeAll()` - Close all windows
- `closeByType(type)` - Close all windows of a specific type

## Advanced Usage

### Custom Window Components

Create sophisticated window components with custom behavior:

```tsx
const CustomWindow = ({ window, onClose, onMinimize, onMaximize }) => (
  <Window
    window={window}
    onClose={onClose}
    className="custom-window"
    headerHeight={40}
  >
    <div className="window-header">
      <h3>{window.props.title}</h3>
      <div className="window-controls">
        <button onClick={onMinimize}>−</button>
        <button onClick={onMaximize}>□</button>
        <button onClick={onClose}>×</button>
      </div>
    </div>
    <div className="window-content">{/* Your window content */}</div>
  </Window>
);
```

### Dynamic Window Registration

Register window types dynamically:

```tsx
const { registerWindowType, unregisterWindowType } = useWindowTypes();

// Register a new window type
registerWindowType("new-type", NewWindowComponent);

// Unregister a window type
unregisterWindowType("old-type");
```

## Styling

The library provides minimal default styling. You can customize the appearance using CSS:

```css
.window-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.window {
  position: absolute;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 30px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  cursor: move;
}
```

## Requirements

- React 17.0.0 or higher
- TypeScript 4.5+ (for full type safety)
