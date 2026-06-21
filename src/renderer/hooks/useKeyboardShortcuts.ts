import { useEffect, useCallback } from 'react';

interface KeyboardShortcutActions {
  onFocusSearch: () => void;
  onEscape: () => void;
  onEnter: () => void;
  onCategorySelect: (index: number) => void;
  onQuantitySelect: (qty: number) => void;
  onNewSale: () => void;
  onPrint: () => void;
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl combinations work regardless of focus
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            actions.onNewSale();
            return;
          case 'p':
            event.preventDefault();
            actions.onPrint();
            return;
        }
      }

      // Escape always works
      if (event.key === 'Escape') {
        event.preventDefault();
        actions.onEscape();
        return;
      }

      // Enter for payment confirmation
      if (event.key === 'Enter' && !isInputFocused) {
        event.preventDefault();
        actions.onEnter();
        return;
      }

      // Skip shortcuts when typing in inputs
      if (isInputFocused) return;

      // / to focus search
      if (event.key === '/') {
        event.preventDefault();
        actions.onFocusSearch();
        return;
      }

      // F1-F8 for categories
      if (event.key.startsWith('F') && event.key.length <= 3) {
        const fNum = parseInt(event.key.substring(1), 10);
        if (fNum >= 1 && fNum <= 8) {
          event.preventDefault();
          actions.onCategorySelect(fNum - 1);
          return;
        }
      }

      // 1-9 for quantity
      const numKey = parseInt(event.key, 10);
      if (numKey >= 1 && numKey <= 9) {
        actions.onQuantitySelect(numKey);
      }
    },
    [actions]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
