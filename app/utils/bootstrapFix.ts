/**
 * This utility provides fixes for Bootstrap-related issues in Next.js
 * It mocks the domQueryService that Bootstrap's legacy code expects
 */

// Define the DomQueryService interface to match the expected structure
interface DomQueryService {
  checkPageContainsShadowDom: () => boolean;
  getDocument: () => Document;
  querySelector: (selector: string) => Element | null;
  querySelectorAll: (selector: string) => NodeListOf<Element>;
  [key: string]: unknown;
}

/**
 * Initializes fixes for Bootstrap in a Next.js environment
 * Call this function in your app's entry point or layout
 */
export function initBootstrapFixes(): void {
  if (typeof window !== 'undefined') {
    // Create a mock domQueryService if it doesn't exist
    if (!window.domQueryService) {
      window.domQueryService = {
        checkPageContainsShadowDom: () => false,
        getDocument: () => document,
        querySelector: (selector: string) => document.querySelector(selector),
        querySelectorAll: (selector: string) => document.querySelectorAll(selector)
      };
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
      if (!window.domQueryService![method]) {
        window.domQueryService![method] = function(...args: unknown[]) {
          try {
            if (method === 'checkPageContainsShadowDom') {
              return false;
            } else if (method === 'getDocument') {
              return document;
            } else if (method === 'querySelector') {
              return document.querySelector(args[0] as string);
            } else if (method === 'querySelectorAll') {
              return document.querySelectorAll(args[0] as string);
            }
            return method.includes('query') ? [] : false;
          } catch (e) {
            console.warn(`Error in domQueryService.${method}, returning safe value`, e);
            return method.includes('query') ? [] : false;
          }
        };
      }
    });
    
    // Create a proxy to safely handle any unexpected property access
    const originalService = window.domQueryService;
    
    // Ensure we have a valid target for the Proxy
    if (originalService) {
      // Use type assertion to ensure the target is treated as an object
      window.domQueryService = new Proxy(originalService as object, {
        get: function(target: any, prop: string | symbol) {
          const key = prop.toString();
          if (typeof target[key] === 'function') {
            return target[key];
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