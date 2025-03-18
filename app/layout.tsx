// app/layout.tsx
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "@/app/styles/globals.css"
import "@/app/styles/layout.css"
import Script from "next/script"
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/app/components/ui/Navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "YDKB | You Don't Know Ball",
  description: "Test your knowledge of NFL players' college careers",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ydkb.vercel.app'),
  keywords: ["NFL", "football", "trivia", "sports", "guessing game", "college football"],
  openGraph: {
    title: "You Don't Know Ball | NFL College Trivia",
    description: "Test your knowledge of NFL players' college careers in this daily trivia challenge",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'You Don\'t Know Ball | NFL College Trivia',
    description: 'Test your knowledge of NFL players\' college careers',
  },
  verification: {
    google: 'google-site-verification',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
        <head>
          <meta name="next-head-count" content="0" />
          <meta name="react-hydration-warning" content="suppress" />
          {/* This script must be the first script to run */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Comprehensive jQuery and domQueryService fix
                if (typeof window !== 'undefined') {
                  // Define a robust domQueryService to prevent errors
                  window.domQueryService = {
                    checkPageContainsShadowDom: function() { return false; },
                    getDocument: function() { return document; },
                    querySelector: function(selector) { 
                      try { return document.querySelector(selector); } catch(e) { return null; }
                    },
                    querySelectorAll: function(selector) { 
                      try { return document.querySelectorAll(selector); } catch(e) { return []; }
                    }
                  };
                  
                  // Make checkPageContainsShadowDom globally available
                  window.checkPageContainsShadowDom = function() { return false; };
                  
                  // Create a robust mock jQuery object with common methods
                  const mockJQuery = function(selector) {
                    // Create a base object that handles most jQuery methods
                    const baseObj = {
                      domQueryService: window.domQueryService,
                      on: function() { return baseObj; },
                      off: function() { return baseObj; },
                      addClass: function() { return baseObj; },
                      removeClass: function() { return baseObj; },
                      css: function() { return baseObj; },
                      attr: function() { return baseObj; },
                      data: function() { return {}; },
                      find: function() { return baseObj; },
                      each: function(fn) { fn && fn(); return baseObj; },
                      length: 0,
                      get: function() { return null; },
                      hide: function() { return baseObj; },
                      show: function() { return baseObj; },
                      toggle: function() { return baseObj; },
                      parent: function() { return baseObj; },
                      children: function() { return baseObj; },
                      append: function() { return baseObj; },
                      prepend: function() { return baseObj; },
                      remove: function() { return baseObj; },
                      trigger: function() { return baseObj; },
                      is: function() { return false; },
                      hasClass: function() { return false; }
                    };
                    
                    return baseObj;
                  };
                  
                  // Add array-like methods
                  mockJQuery.each = function(obj, callback) {
                    callback && callback();
                    return obj;
                  };
                  
                  // Add other common jQuery methods
                  mockJQuery.fn = { jquery: '3.6.0' };
                  mockJQuery.Deferred = function() { 
                    return { 
                      promise: function() { return {}; },
                      resolve: function() {},
                      reject: function() {}
                    }; 
                  };
                  
                  // Assign to window
                  window.$ = window.jQuery = mockJQuery;
                  
                  // Prevent console errors by defining these properties
                  window.bootstrap = window.bootstrap || {};
                  window.AJS = window.AJS || {
                    params: {},
                    trigger: function() {},
                    bind: function() {},
                    unbind: function() {},
                    toInit: function(fn) { fn && fn(); }
                  };
                }
              `,
            }}
          />
        </head>
        <body
          className="min-h-screen bg-deep-slate font-inter antialiased"
          suppressHydrationWarning
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          
          {/* Load bootstrap fix after the body to avoid hydration issues */}
          <Script id="bootstrap-fix" strategy="afterInteractive">
            {`
              // Bootstrap compatibility fixes
              if (typeof window !== 'undefined') {
                // Create a proxy to safely handle any unexpected property access
                window.domQueryService = new Proxy(window.domQueryService || {}, {
                  get: function(target, prop) {
                    if (typeof target[prop] === 'function') {
                      return target[prop];
                    }
                    
                    // Define standard methods if they don't exist
                    if (prop === 'checkPageContainsShadowDom') {
                      return function() { return false; };
                    } else if (prop === 'getDocument') {
                      return function() { return document; };
                    } else if (prop === 'querySelector') {
                      return function(selector) { 
                        try { return document.querySelector(selector); } catch(e) { return null; }
                      };
                    } else if (prop === 'querySelectorAll') {
                      return function(selector) { 
                        try { return document.querySelectorAll(selector); } catch(e) { return []; }
                      };
                    }
                    
                    // Return a safe default function for any undefined method
                    return function() { return null; };
                  }
                });
                
                // Fix for bootstrap-legacy-aui-ill-overlay.js
                if (typeof window.checkPageContainsShadowDom === 'undefined') {
                  window.checkPageContainsShadowDom = function() { return false; };
                }
                
                // Suppress console errors
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  // Filter out bootstrap and jQuery related errors
                  if (args[0] && typeof args[0] === 'string' && 
                     (args[0].includes('bootstrap') || 
                      args[0].includes('jQuery') || 
                      args[0].includes('domQueryService'))) {
                    return;
                  }
                  originalConsoleError.apply(console, args);
                };
                
                console.log('Bootstrap compatibility fixes initialized');
              }
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  )
}