"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placement: "above" | "below" }>({ top: 0, left: 0, placement: "above" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight || 40;
    const spaceAbove = rect.top;
    const placement = spaceAbove < tooltipHeight + 12 ? "below" : "above";

    setPosition({
      top: placement === "above" ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
      placement,
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  return (
    <div className="relative inline-flex items-center gap-1">
      {children}
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 text-xs cursor-help transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        ?
      </button>
      {isVisible && typeof window !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg max-w-xs whitespace-normal pointer-events-none"
            style={{
              top: position.placement === "above" ? position.top : position.top,
              left: position.left,
              transform: position.placement === "above"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
            }}
          >
            {content}
            <div
              className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                position.placement === "above"
                  ? "top-full border-t-slate-800"
                  : "bottom-full border-b-slate-800"
              }`}
            ></div>
          </div>,
          document.body
        )}
    </div>
  );
}
