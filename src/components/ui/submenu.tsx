'use client';
import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/modules/submenu.module.scss';

type SubmenuOption = {
  text: string;
  icon: string;
  onClick?: () => void;
};

type SubmenuProps = {
  open: boolean;
  onClose: () => void;
  options: SubmenuOption[];
  triggerEl?: HTMLElement | null;
};

export default function Submenu({ open, onClose, options, triggerEl }: SubmenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const triggerNode: HTMLElement | null | undefined = triggerEl;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        (!triggerNode || !triggerNode.contains(target))
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerEl, open]);

  // compute anchor position for portal placement whenever open changes or triggerEl changes
  useLayoutEffect(() => {
    if (open && triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      setAnchor({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    } else {
      setAnchor(null);
    }
  }, [open, triggerEl]);

  // Render menu into body to avoid stacking context issues
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`${styles.container}`}
      style={
        anchor
          ? {
              position: 'absolute',
              top: `${anchor.top}px`,
              left: `${anchor.left}px`,
              zIndex: 1105,
              pointerEvents: open ? 'auto' : 'none',
            }
          : { position: 'absolute', zIndex: 1105, pointerEvents: open ? 'auto' : 'none' }
      }
    >
      <div className={`${styles.menu} ${open ? styles.active : ''} flex-col`}>
        {options.map(option => {
          return (
            <button
              key={option.text.replace(' ', '-').toLowerCase()}
              className={`${styles.menuBtn} btn has-icon d-flex flex-center gap-05`}
              type="button"
              onClick={() => {
                option.onClick?.();
                onClose();
              }}
            >
              <span>{option.text}</span>
              <span className="material-icon inline-icon">{option.icon}</span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
