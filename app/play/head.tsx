export default function Head() {
  return (
    <>
      <title>YDKB | College Challenge</title>
      <meta name="description" content="Test your knowledge of NFL players' college careers in this sleek, minimal tech-inspired game" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#121620" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Handle Xverse wallet provider extension
            if (typeof window !== 'undefined') {
              // Function to remove Xverse wallet provider script
              function removeXverseScript() {
                const xverseScript = document.getElementById('xverse-wallet-provider');
                if (xverseScript) {
                  xverseScript.parentNode.removeChild(xverseScript);
                  console.log('Removed Xverse wallet provider script');
                }
                
                // Also look for scripts with data-is-priority attribute
                document.querySelectorAll('script[data-is-priority="true"]').forEach(script => {
                  script.parentNode.removeChild(script);
                  console.log('Removed script with data-is-priority attribute');
                });
              }
              
              // Remove immediately
              removeXverseScript();
              
              // Also set up a MutationObserver to catch any scripts added after initial load
              const observer = new MutationObserver((mutations) => {
                let shouldRemove = false;
                
                mutations.forEach(mutation => {
                  if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                      if (node.nodeName === 'SCRIPT' && 
                          (node.id === 'xverse-wallet-provider' || 
                           node.getAttribute('data-is-priority') === 'true')) {
                        shouldRemove = true;
                      }
                    });
                  }
                });
                
                if (shouldRemove) {
                  removeXverseScript();
                }
              });
              
              // Start observing
              observer.observe(document.documentElement, { 
                childList: true, 
                subtree: true 
              });
            }
          `,
        }}
      />
    </>
  );
} 