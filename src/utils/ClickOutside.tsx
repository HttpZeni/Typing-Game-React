import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  setIsOpen: (open: boolean) => void;
  target: React.RefObject<HTMLElement | null>;
  ignore?: React.RefObject<HTMLElement | null>[];
};

export default function ClickOutside({ children, setIsOpen, target, ignore = [] }: Props) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = target.current;
      if (!el) return;

      const isInsideTarget = el.contains(e.target as Node);
      const isInsideIgnore = ignore.some((r) => r.current?.contains(e.target as Node));

      if (!isInsideTarget && !isInsideIgnore) setIsOpen(false);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [setIsOpen, target, ignore]);

  return <>{children}</>;
}
