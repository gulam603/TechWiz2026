import { useState } from 'react';

/**
 * "Table" or "Cards" view of a list, remembered in this browser. Phones start with cards,
 * bigger screens with the table (DataTables).
 */
export default function useViewMode(key) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(`marketlink_view_${key}`);
      if (saved === 'table' || saved === 'cards') return saved;
    } catch {
      /* storage blocked */
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });
  function change(next) {
    setMode(next);
    try {
      localStorage.setItem(`marketlink_view_${key}`, next);
    } catch {
      /* storage blocked */
    }
  }
  return [mode, change];
}
