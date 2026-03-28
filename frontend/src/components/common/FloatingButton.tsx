"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface FloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  hidden?: boolean;
}

export function FloatingButton({ onClick, children, className = "", hidden = false }: FloatingButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hidden) return null;

  return createPortal(
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-4 z-[9999] md:hidden flex h-12 w-12 items-center justify-center rounded-full shadow-lg active:scale-95 transition-all duration-200 cursor-pointer ${className}`}
    >
      {children}
    </button>,
    document.body
  );
}
