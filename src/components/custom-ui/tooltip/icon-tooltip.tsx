import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface IconTooltipProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function IconTooltip({ icon, children }: IconTooltipProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // controls actual DOM presence with animation
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ top: 0, centerX: 0 });

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 2,
        centerX: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, []);

  const handleClick = useCallback(() => {
    updatePosition();
    if (open) {
      setOpen(false); // start fade out
    } else {
      setOpen(true);
      setVisible(true); // mount immediately for fade in
    }
  }, [open, updatePosition]);

  // When open becomes false, delay unmount for animation
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => setVisible(false), 200); // match duration below
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (open) updatePosition();
    };
    window.addEventListener("scroll", handleResizeOrScroll, true);
    window.addEventListener("resize", handleResizeOrScroll);
    return () => {
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      window.removeEventListener("resize", handleResizeOrScroll);
    };
  }, [open, updatePosition]);

  return (
    <div
      className="relative inline-block cursor-pointer"
      onClick={handleClick}
      ref={containerRef}
    >
      {icon}

      {(open || visible) &&
        createPortal(
          <div
            className="absolute z-50"
            style={{
              top: `${position.top}px`,
              left: `calc(${position.centerX}px - 100px)`,
              width: "200px",
              pointerEvents: open ? "auto" : "none", // disable interaction when hidden
              transition: "opacity 200ms ease, transform 200ms ease",
              opacity: open ? 1 : 0,
              transform: open ? "scale(1)" : "scale(0.95)",
              transformOrigin: "top center",
            }}
          >
            {/* Tooltip container */}
            <div className="bg-card border rounded-xl shadow-lg px-4 py-2 text-start">
              {children}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
