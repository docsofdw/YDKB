import type jQuery from 'jquery';

declare global {
  interface Window {
    $: typeof jQuery;
  }
}

/**
 * Utility functions for cleaning up jQuery-related elements
 */

/**
 * Hide all Bootstrap modals
 */
export function hideModals(): void {
  if (typeof window !== 'undefined' && window.$ && window.$('.modal').length) {
    window.$('.modal').modal('hide');
  }
}

/**
 * Hide all Bootstrap toasts
 */
export function hideToasts(): void {
  if (typeof window !== 'undefined' && window.$ && window.$('.toast').length) {
    window.$('.toast').toast('hide');
  }
}

// Run cleanup on module load
if (typeof window !== 'undefined') {
  hideModals();
  hideToasts();
}

const jqueryCleanup = {
  hideModals,
  hideToasts,
};

export default jqueryCleanup; 