import SettingHeader from '@/components/ui/settingHeader';
import styles from '@/styles/modules/settingCategory.module.scss';
import { useState, ReactNode } from 'react';

interface SettingsCategoryProps {
  title: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
  storageKey?: string | null;
  containerClasses?: string[];
}

export default function SettingsCategory({
  title,
  defaultCollapsed = false,
  children,
  storageKey = null,
  containerClasses,
}: SettingsCategoryProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && storageKey == null) {
      const saved = localStorage.getItem(`collapsed-${storageKey}`);
      return saved !== null ? JSON.parse(saved) : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  const [maxHeight, setMaxHeight] = useState('0px');

  const setRef = (el: HTMLDivElement | null) => {
    if (el && maxHeight === '0px') {
      // 10px buffer
      setMaxHeight(`${el.scrollHeight + 10}px`);
    }
  };

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      if (storageKey !== null)
        localStorage.setItem(`collapsed-${storageKey}`, JSON.stringify(next));
      return next;
    });
  };

  return (
    <section>
      <SettingHeader onClick={toggleCollapse} title={title} />
      <div
        ref={setRef}
        className={`${styles.container} ${containerClasses !== undefined && containerClasses.length > 0 ? containerClasses.join(' ') : ''}`}
        style={{ maxHeight: collapsed ? '0' : maxHeight }}
      >
        {children}
      </div>
    </section>
  );
}
