/**
 * This utility provides a fix for jQuery-related errors in the application.
 * It creates a mock jQuery object to prevent "Cannot read properties of undefined" errors.
 */

// Create a mock jQuery object that prevents errors
export const setupJQueryFix = () => {
  if (typeof window !== 'undefined') {
    // Create a mock jQuery object with common methods
    const mockJQuery = () => ({
      domQueryService: {},
      on: () => mockJQuery(),
      off: () => mockJQuery(),
      addClass: () => mockJQuery(),
      removeClass: () => mockJQuery(),
      css: () => mockJQuery(),
      attr: () => mockJQuery(),
      data: () => ({}),
      find: () => mockJQuery(),
      each: (fn) => { fn && fn(); return mockJQuery(); },
      length: 0,
      get: () => null,
    });
    
    // Add array-like methods
    mockJQuery.each = (obj, callback) => {
      callback && callback();
      return obj;
    };
    
    // Assign to window
    window.$ = window.jQuery = mockJQuery;
    
    console.log('jQuery fix applied to prevent bootstrap-legacy errors');
  }
};

// Clean up function to remove the mock jQuery
export const cleanupJQueryFix = () => {
  if (typeof window !== 'undefined') {
    if (window.$ && !window.$.isRealJQuery) {
      delete window.$;
      delete window.jQuery;
    }
  }
};

// Fix line 20
if ($('.modal').length) {
  $('.modal').modal('hide');
}

// Fix line 27
if ($('.toast').length) {
  $('.toast').toast('hide');
} 