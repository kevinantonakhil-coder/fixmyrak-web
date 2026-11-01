declare global {
  interface Window {
    google: any;
    __googleMapsLoadingPromise?: Promise<any>;
    gm_authFailure?: () => void;
  }
}

let authFailed = false;

export function isGoogleMapsAuthFailed(): boolean {
  return authFailed;
}

export function loadGoogleMaps(apiKey: string): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise;
  }

  // Set up global auth failure handler if Maps API fails authentication
  window.gm_authFailure = () => {
    authFailed = true;
    window.dispatchEvent(new Event('google-maps-auth-failure'));
    console.warn('Google Maps authentication notice: Key requires Maps JavaScript API to be enabled.');
  };

  window.__googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', (err) => reject(err));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.defer = true;

    const timeoutTimer = setTimeout(() => {
      reject(new Error('Google Maps script loading timed out.'));
    }, 10000);

    script.onload = () => {
      clearTimeout(timeoutTimer);
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps not found'));
      }
    };

    script.onerror = (err) => {
      clearTimeout(timeoutTimer);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}
