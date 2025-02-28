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
                // Basic domQueryService setup to prevent initial errors
                if (typeof window !== 'undefined') {
                  // Define window.domQueryService directly to avoid "cannot read properties of undefined"
                  window.domQueryService = {
                    checkPageContainsShadowDom: function() { return false; },
                    getDocument: function() { return document; },
                    querySelector: function(selector) { return document.querySelector(selector); },
                    querySelectorAll: function(selector) { return document.querySelectorAll(selector); }
                  };
                  
                  // Create a function to handle browser extensions
                  function handleExtensionScripts() {
                    // Remove any extension scripts that might cause hydration issues
                    const extensionScripts = document.querySelectorAll('script[id="xverse-wallet-provider"], script[data-is-priority="true"]');
                    extensionScripts.forEach(script => {
                      if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                      }
                    });
                  }
                  
                  // Run immediately
                  handleExtensionScripts();
                  
                  // Also run after a short delay to catch any scripts injected after initial load
                  setTimeout(handleExtensionScripts, 100);
                  
                  // Set up a MutationObserver to catch future injections
                  const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                      if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                          if (node.nodeName === 'SCRIPT' && 
                              ((node.id === 'xverse-wallet-provider') || 
                               (node.getAttribute && node.getAttribute('data-is-priority') === 'true'))) {
                            if (node.parentNode) {
                              node.parentNode.removeChild(node);
                            }
                          }
                        });
                      }
                    });
                  });
                  
                  // Start observing the document
                  observer.observe(document, { childList: true, subtree: true });
                  
                  console.log('Extension script handler initialized');
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
                      return function(selector) { return document.querySelector(selector); };
                    } else if (prop === 'querySelectorAll') {
                      return function(selector) { return document.querySelectorAll(selector); };
                    }
                    
                    // Return a safe default function for any undefined method
                    return function() { 
                      console.warn('Called undefined method domQueryService.' + String(prop));
                      return false; 
                    };
                  }
                });
                
                // Fix for bootstrap-legacy-aut-overlay.js
                // This specifically targets the error in the console
                if (typeof window.checkPageContainsShadowDom === 'undefined') {
                  window.checkPageContainsShadowDom = function() { return false; };
                }
                
                console.log('Bootstrap compatibility fixes initialized');
              }
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  )
}