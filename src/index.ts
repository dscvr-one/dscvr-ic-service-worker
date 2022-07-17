function updateStatus(message: string) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.innerText = message;
  }
}

window.addEventListener('load', async () => {
  // Verify user's web browser has necessary support
  const unsupported = [
    ['serviceWorker', window.navigator.serviceWorker],
    ['BigInt', window.BigInt],
    ['WebAssembly', window.WebAssembly],
  ]
    .filter((tuple) => !tuple[1])
    .map((tuple) => tuple[0])
    .join(', ');
  if (unsupported) {
    updateStatus(
      `This web browser cannot interact with the Internet Computer securely.  (No: ${unsupported})
       Please try new web browser software.`
    );
  } else {
    console.log(
      'Installing a service worker to proxy and validate raw content into the browser...'
    );

    if (!navigator.serviceWorker.controller) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(r => r.unregister()))
    }
    // Ok, let's install the service worker...
    // note: if the service worker was already installed, when the browser requested <domain>/, it would have
    // proxied the response from <domain>/<canister-id>/, so this bootstrap file would have never been
    // retrieved from the boundary nodes
   const reg = await navigator.serviceWorker.register(location.protocol + '//' + location.host + '/sw.js');

    if (reg.installing) {
      const sw = reg.installing || reg.waiting;
      sw.onstatechange = () => {
        if (sw.state === 'installed') {
          window.location.reload();
        }
      };
    } else if (reg.active) {
      // Hmmm we're not sure what's happening here. If the service worker was running, usually it
      // would have obtained the underlying raw content from the canister, validated it, and proxied
      // it to the browser. This might be either a disabled SW or the user did a hard reload on the
      // page.
      setTimeout(function () {
        window.location.reload();
      }, 2000);
    }
  }
});
