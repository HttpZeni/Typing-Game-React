import { useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  disabled?: boolean;
  offset?: number;
};

const getPortalRoot = (): HTMLElement | null => {
  if (typeof document === "undefined") return null;
  return document.getElementById("portal-root") ?? document.body;
};

export default function Tooltip({ content, children, disabled = false, offset = 10 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;

    const anchorRect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();

    let top = anchorRect.top - tipRect.height - offset;
    let left = anchorRect.left + anchorRect.width / 2 - tipRect.width / 2;

    if (top < 8) {
      top = anchorRect.bottom + offset;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));

    setPos({ top, left });
    setReady(true);
  }, [open, offset]);

  const portalRoot = useMemo(getPortalRoot, []);

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && portalRoot &&
        createPortal(
          <div
            ref={tipRef}
            style={{ position: "fixed", top: pos.top, left: pos.left }}
            className={`z-[9999] px-4 py-2 bg-card-bg border-2 border-accent-primary rounded-lg shadow-glow-purple transition-[opacity,transform] duration-200 ease-out will-change-transform ${
              ready ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
            }`}
            aria-hidden="true"
          >
            <span className="text-accent-primary text-sm font-display font-bold tracking-wide">
              {content}
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
              <div className="border-8 border-transparent border-t-accent-primary"></div>
            </div>
          </div>,
          portalRoot
        )}
    </span>
  );
}
