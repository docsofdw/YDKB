/**
 * This utility provides fixes for Bootstrap-related issues in Next.js
 * It mocks the domQueryService that Bootstrap's legacy code expects
 */

/**
 * Initializes fixes for Bootstrap in a Next.js environment
 * Call this function in your app's entry point or layout
 */
export function initBootstrapFixes(): void {
  if (typeof window !== 'undefined') {
    // Create a mock domQueryService if it doesn't exist
    if (!window.domQueryService) {
      window.domQueryService = {} as any;
    }
    
    // Define all potentially used methods
    const methods = [
      'checkPageContainsShadowDom',
      'getDocument',
      'querySelector',
      'querySelectorAll'
    ];
    
    // Create safe versions of all methods
    methods.forEach(method => {
      window.domQueryService![method] = window.domQueryService![method] || function(...args: any[]) {
        try {
          if (method === 'checkPageContainsShadowDom') {
            return false;
          } else if (method === 'getDocument') {
            return document;
          } else if (method === 'querySelector') {
            return document.querySelector(args[0]);
          } else if (method === 'querySelectorAll') {
            return document.querySelectorAll(args[0]);
          }
          return method.includes('query') ? [] : false;
        } catch (e) {
          console.warn(`Error in domQueryService.${method}, returning safe value`, e);
          return method.includes('query') ? [] : false;
        }
      };
    });
    
    // Create a proxy to safely handle any unexpected property access
    const originalService = window.domQueryService;
    
    // Ensure we have a valid target for the Proxy
    if (originalService) {
      window.domQueryService = new Proxy(originalService as object, {
        get: function(target: any, prop: string | symbol) {
          if (typeof target[prop] === 'function') {
            return target[prop];
          }
          // Return a safe default function for any undefined method
          return function() { 
            console.warn(`Called undefined method domQueryService.${String(prop)}`);
            return false; 
          };
        }
      });
    }
    
    // Fix for bootstrap-legacy-aut-overlay.js
    if (typeof window.checkPageContainsShadowDom === 'undefined') {
      window.checkPageContainsShadowDom = () => false;
    }
    
    console.log('Bootstrap compatibility fixes initialized');
  }
} 