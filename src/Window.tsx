"use client";
import React, { useState, useCallback, useMemo } from "react";
import { WindowContainerProps } from "./types";
import { useWindowManager } from "./components";
import { FocusScope } from "@radix-ui/react-focus-scope";

type ResizeDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export const Window: React.FC<WindowContainerProps<any>> = ({
  window,
  onClose,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  onFullscreen,
  onPin,
  onUnpin,
  children,
  className = "",
  style = {},
  headerHeight = 30,
  draggable = true,
  resizable = true,
  customHeader,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Use window manager context for default handlers
  const windowManager = useWindowManager();

  // Create default handlers that use the window manager
  const defaultHandlers = useMemo(
    () => ({
      onClose: () => windowManager.actions.close(window.id),
      onFocus: () => windowManager.actions.focus(window.id),
      onMove: (position: { x: number; y: number }) =>
        windowManager.actions.move(window.id, position),
      onResize: (size: { width: number; height: number }) =>
        windowManager.actions.resize(window.id, size),
      onMinimize: () => windowManager.actions.minimize(window.id),
      onMaximize: () => windowManager.actions.maximize(window.id),
      onFullscreen: () => windowManager.actions.fullscreen(window.id),
      onPin: () => windowManager.actions.pin(window.id),
      onUnpin: () => windowManager.actions.unpin(window.id),
    }),
    [windowManager, window.id]
  );

  // Use provided handlers or fall back to defaults
  const handlers = {
    onClose: onClose || defaultHandlers.onClose,
    onFocus: onFocus || defaultHandlers.onFocus,
    onMove: onMove || defaultHandlers.onMove,
    onResize: onResize || defaultHandlers.onResize,
    onMinimize: onMinimize || defaultHandlers.onMinimize,
    onMaximize: onMaximize || defaultHandlers.onMaximize,
    onFullscreen: onFullscreen || defaultHandlers.onFullscreen,
    onPin: onPin || defaultHandlers.onPin,
    onUnpin: onUnpin || defaultHandlers.onUnpin,
  };

  const isMaximized = window.state === "maximized";
  const isFullscreen = window.state === "fullscreen";

  // Calculate position and size based on window state
  const position =
    isMaximized || isFullscreen ? { x: 0, y: 0 } : window.position;
  const size =
    isMaximized || isFullscreen
      ? { width: "100vw", height: "100vh" }
      : { width: window.size.width, height: window.size.height };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || !draggable) return; // Only left click and if draggable

      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y,
      });
      handlers.onFocus();
    },
    [window.position, handlers.onFocus, draggable]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !draggable) return;

      handlers.onMove({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart, handlers.onMove, draggable]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      const initialPos = { x: e.clientX, y: e.clientY };
      const initialSize = { ...window.size };
      const initialPosition = { ...window.position };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - initialPos.x;
        const dy = moveEvent.clientY - initialPos.y;

        const newSize = { ...initialSize };
        const newPosition = { ...initialPosition };

        if (direction.includes("right")) {
          newSize.width = initialSize.width + dx;
        } else if (direction.includes("left")) {
          newSize.width = initialSize.width - dx;
          newPosition.x = initialPosition.x + dx;
        }

        if (direction.includes("bottom")) {
          newSize.height = initialSize.height + dy;
        } else if (direction.includes("top")) {
          newSize.height = initialSize.height - dy;
          newPosition.y = initialPosition.y + dy;
        }

        // Apply minimum size constraints
        if (newSize.width < 100) {
          newSize.width = 100;
          if (direction.includes("left")) {
            newPosition.x = initialPosition.x + initialSize.width - 100;
          }
        }

        if (newSize.height < 50) {
          newSize.height = 50;
          if (direction.includes("top")) {
            newPosition.y = initialPosition.y + initialSize.height - 50;
          }
        }

        handlers.onResize(newSize);
        handlers.onMove(newPosition);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [window.size, window.position, handlers.onResize, handlers.onMove]
  );

  React.useEffect(() => {
    if (isDragging && draggable) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, draggable]);

  const resizeHandles: {
    direction: ResizeDirection;
    style: React.CSSProperties;
  }[] = [
    {
      direction: "top",
      style: {
        position: "absolute",
        top: 0,
        left: 4,
        right: 4,
        height: 4,
        cursor: "n-resize",
      },
    },
    {
      direction: "bottom",
      style: {
        position: "absolute",
        bottom: 0,
        left: 4,
        right: 4,
        height: 4,
        cursor: "s-resize",
      },
    },
    {
      direction: "left",
      style: {
        position: "absolute",
        top: 4,
        bottom: 4,
        left: 0,
        width: 4,
        cursor: "w-resize",
      },
    },
    {
      direction: "right",
      style: {
        position: "absolute",
        top: 4,
        bottom: 4,
        right: 0,
        width: 4,
        cursor: "e-resize",
      },
    },
    {
      direction: "top-left",
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        cursor: "nw-resize",
      },
    },
    {
      direction: "top-right",
      style: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        cursor: "ne-resize",
      },
    },
    {
      direction: "bottom-left",
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: 8,
        height: 8,
        cursor: "sw-resize",
      },
    },
    {
      direction: "bottom-right",
      style: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 8,
        height: 8,
        cursor: "se-resize",
      },
    },
  ];

  const defaultStyle: React.CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    zIndex: window.isPinned ? window.zIndex + 10000 : window.zIndex,
    border: window.isPinned ? "2px solid #ffd700" : "none",
    boxShadow: window.isPinned
      ? "0 0 10px rgba(255, 215, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    cursor: isDragging ? "grabbing" : "default",
    display: "flex",
    flexDirection: "column",
    ...style,
  };

  return (
    <FocusScope
      asChild
      trapped={window.isFocused}
      onMountAutoFocus={(e: Event) => e.preventDefault()}
    >
      <div
        role="none"
        className={`window-container ${className}`}
        style={defaultStyle}
        onMouseDown={handlers.onFocus}
      >
        {/* Window Header */}
        {customHeader !== undefined ? (
          customHeader !== null && (
            <div
              style={{
                cursor: draggable ? "grab" : "default",
                userSelect: "none",
                flexShrink: 0,
              }}
              onMouseDown={handleMouseDown}
            >
              {typeof customHeader === "function"
                ? customHeader({
                    window,
                    onClose: handlers.onClose,
                    onFocus: handlers.onFocus,
                    onMove: handlers.onMove,
                    onResize: handlers.onResize,
                    onMinimize: handlers.onMinimize,
                    onMaximize: handlers.onMaximize,
                    onFullscreen: handlers.onFullscreen,
                    onPin: handlers.onPin,
                    onUnpin: handlers.onUnpin,
                    draggable,
                  })
                : customHeader}
            </div>
          )
        ) : (
          <div
            style={{
              height: headerHeight,
              backgroundColor: window.isPinned
                ? "#ffd700"
                : window.isFocused
                  ? "#007acc"
                  : "#f0f0f0",
              cursor: draggable ? "grab" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              color: window.isPinned
                ? "#000"
                : window.isFocused
                  ? "white"
                  : "black",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {window.isPinned && (
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>📌</span>
              )}
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                {window.type}
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {/* Pin/Unpin button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.isPinned) {
                    handlers.onUnpin();
                  } else {
                    handlers.onPin();
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "4px 6px",
                  borderRadius: "2px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={window.isPinned ? "Unpin from top" : "Pin to top"}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = window.isPinned
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {window.isPinned ? "📌" : "📍"}
              </button>

              {/* Minimize button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onMinimize();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "4px 6px",
                  borderRadius: "2px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Minimize"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = window.isPinned
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                −
              </button>

              {/* Maximize button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.state === "maximized") {
                    windowManager.actions.unfullscreen(window.id);
                  } else {
                    handlers.onMaximize();
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "4px 6px",
                  borderRadius: "2px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={window.state === "maximized" ? "Restore" : "Maximize"}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = window.isPinned
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {window.state === "maximized" ? "❐" : "□"}
              </button>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onClose();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px 6px",
                  borderRadius: "2px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Close"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff4444";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "inherit";
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Window Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "12px",
          }}
        >
          {children}
        </div>

        {/* Resize Handles */}
        {resizable &&
          !isMaximized &&
          !isFullscreen &&
          resizeHandles.map((handle) => (
            <div
              key={handle.direction}
              role="button"
              aria-label={`Resize window ${handle.direction}`}
              tabIndex={0}
              style={handle.style}
              onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  return;
                }

                // Handle arrow key resize
                if (
                  ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
                    e.key
                  ) !== -1
                ) {
                  e.preventDefault();

                  const step = e.shiftKey ? 10 : 1;
                  const currentSize = { ...window.size };
                  const currentPosition = { ...window.position };

                  const newSize = { ...currentSize };
                  const newPosition = { ...currentPosition };

                  // Apply resize based on direction and arrow key
                  if (
                    handle.direction.includes("right") &&
                    e.key === "ArrowRight"
                  ) {
                    newSize.width += step;
                  } else if (
                    handle.direction.includes("right") &&
                    e.key === "ArrowLeft"
                  ) {
                    newSize.width -= step;
                  } else if (
                    handle.direction.includes("left") &&
                    e.key === "ArrowLeft"
                  ) {
                    newSize.width += step;
                    newPosition.x -= step;
                  } else if (
                    handle.direction.includes("left") &&
                    e.key === "ArrowRight"
                  ) {
                    newSize.width -= step;
                    newPosition.x += step;
                  }

                  if (
                    handle.direction.includes("bottom") &&
                    e.key === "ArrowDown"
                  ) {
                    newSize.height += step;
                  } else if (
                    handle.direction.includes("bottom") &&
                    e.key === "ArrowUp"
                  ) {
                    newSize.height -= step;
                  } else if (
                    handle.direction.includes("top") &&
                    e.key === "ArrowUp"
                  ) {
                    newSize.height += step;
                    newPosition.y -= step;
                  } else if (
                    handle.direction.includes("top") &&
                    e.key === "ArrowDown"
                  ) {
                    newSize.height -= step;
                    newPosition.y += step;
                  }

                  // Apply minimum size constraints
                  if (newSize.width < 100) {
                    newSize.width = 100;
                    if (handle.direction.includes("left")) {
                      newPosition.x =
                        currentPosition.x + currentSize.width - 100;
                    }
                  }

                  if (newSize.height < 50) {
                    newSize.height = 50;
                    if (handle.direction.includes("top")) {
                      newPosition.y =
                        currentPosition.y + currentSize.height - 50;
                    }
                  }

                  handlers.onResize(newSize);
                  handlers.onMove(newPosition);
                }
              }}
            />
          ))}
      </div>
    </FocusScope>
  );
};

export default Window;
