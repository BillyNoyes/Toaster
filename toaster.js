const styles = `.poopup-toast-container {
  position: fixed;
  z-index: 2147483647;
  top: 3rem;
  left: 3rem;
  right: 3rem;
  bottom: 16px;
  user-select: none;
  pointer-events: none;
}
@media (max-width: 640px) {
  .poopup-toast-container {
    left: 1.5rem;
    right: 1.5rem;
  }
}

.poopup-toast {
  background: transparent;
  padding: 0 0 16px 0;
  display: flex;
  justify-content: flex-end;
  animation: slideIn 0.3s ease-in-out;
}

.poopup-toast-content {
  width: 100%;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 12px;
  background-color: rgb(229 231 235 / 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);

  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.5rem;
  z-index: 50;
  color: rgb(47, 48, 60);
  box-sizing: border-box;
  font-family: "Gabarito", ui-sans-serif, system-ui, sans-serif,
    Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  text-align: left;
}

/* poopup-toast-content max-width is 350px on tablet and larger devices */
@media (min-width: 640px) {
  .poopup-toast-content {
    max-width: 350px;
  }
}

.toast-hide {
  animation: fadeOut 0.4s forwards;
}

@keyframes slideIn {
  from {
    opacity: 0.8;
    transform: translateX(5%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}`;

export const createToastComponent = ({
  notifications,
  waitFor,
  toastEvery,
  toastDuration
}) => {
  let toastTimeout;
  let toastInterval;
  let toasting = [];
  let i = 0;

  /**
   * Initialise component.
   */
  function init() {
    generateStyles();
    fetchFont();
    preloadImages();
    setupToasts();
  }

  /**
   * Creates a style tag in the pages head and adds the styles.
   */
  function generateStyles() {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * Fetch the required font and append to the document head.
   */
  function fetchFont() {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Gabarito:wght@400..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  /**
   * Preload images to ensure they are cached by the time toasts are displayed.
   */
  function preloadImages() {
    notifications.forEach((notification) => {
      const img = new Image();
      img.src = notification.img;
    });
  }

  /**
   * Ensure the toast container exists in the DOM.
   */
  function ensureToastContainer() {
    if (document.querySelector("#poopup-toast-container")) {
      return;
    }

    const container = document.createElement("div");
    container.id = "poopup-toast-container";
    container.className = "poopup-toast-container";
    document.body.appendChild(container);
  }

  /**
   * Show a toast notification.
   */
  function showToast(content, options = {}) {
    ensureToastContainer();

    const id = `toast-${Date.now()}`;
    const toast = document.createElement("div");
    toast.id = id;
    toast.className = "poopup-toast";

    // Insert the HTML content
    toast.innerHTML = `
      <div class="poopup-toast-content" style="pointer-events: none;">
        <img src="${options.image || ''}" style="width: 48px; height: 48px; object-fit: cover; object-position: center; flex-shrink: 0; border-radius: 8px;" width="48" height="48" alt="" />
        <div style="width: 100%;">
          <div style="font-size: 1rem; font-weight: 600; color: rgb(3 7 18);">${options.title || ''}</div>
          <div style="font-size: 1rem; font-weight: 400; line-height: 1.25; color: rgb(55 65 81);">${content}</div>
        </div>
        <div style="color: #616d80;">${options.time || '1m'}</div>
      </div>
    `;

    // if user is on mobile, remove all other toasts
    if (window.innerWidth < 640) {
      toasting.forEach((id) => removeToast(id, true));
    }

    // add the toast at the top  of the container (poopup-toast-container) — it should be the first element
    document.querySelector("#poopup-toast-container").appendChild(toast);

    toasting.push(id);

    // Set auto-dismissal
    if (!options.stay || options.duration) {
      setTimeout(() => removeToast(id), options.duration || 10000);
    }
  }

  /**
   * Remove a toast notification.
   */
  function removeToast(id, force = false) {
    const toast = document.getElementById(id);

    if (!toast) {
      return;
    }

    if (force) {
      toast.remove();
      toasting = toasting.filter((t) => t !== id);
    } else {
      toast.className += " toast-hide";
      setTimeout(() => {
        // Delay to allow for hide animation
        if (toast) {
          toast.remove();
          toasting = toasting.filter((t) => t !== id);
        }
      }, 400); // Match this delay with the CSS animation duration
    }
  }

  /**
   * Setup the toast notifications to display at intervals.
   */
  function setupToasts() {
    // wait for waitFor before starting the toast
    toastTimeout = setTimeout(() => {
      toastInterval = setInterval(() => {
        const notification = notifications[i];

        // stop if there are no more notifications
        if (!notification) {
          clearInterval(toastInterval);
          return;
        }

        let html = `
          <img src="${notification.img}" style="width: 48px; height: 48px; object-fit: cover; object-position: center; flex-shrink: 0; border-radius: 8px;" width="48" height="48" alt="" />
          <div style="width: 100%;">
            <div style="font-size: 1rem; font-weight: 600; color: rgb(3 7 18);">${notification.title}</div>
            <div style="font-size: 1rem; font-weight: 400; line-height: 1.25; color: rgb(55 65 81);">${notification.body}</div>
          </div>
          <div style="color: #616d80;">${notification.timeAgo}</div>
        `;

        // add <a target="_blank"> wrapper if there's a link, and add a little animation to the toast when hover
        if (notification?.link && notification?.link?.includes("http")) {
          html = `
            <a class="poopup-toast-content" href="${notification.link}" target="_blank" style="pointer-events: auto; width: 100%; cursor: pointer; transition: transform 0.2s ease-in-out;" onmouseover="this.style.transform = 'scale(1.01)';" onmouseout="this.style.transform = 'scale(1)';">
              ${html}
            </a>
          `;
        } else {
          // add pointer-events: none; to the toast if there's no link
          html = `
            <div class="poopup-toast-content" style="pointer-events: none;">
              ${html}
            </div>
          `;
        }

        showToast(html, { duration: toastDuration });

        i++;
      }, toastEvery);
    }, waitFor);
  }

  /**
   * Clean up all active toasts and timers.
   */
  function cleanup() {
    toastTimeout && clearTimeout(toastTimeout);
    toastInterval && clearInterval(toastInterval);
    toasting.forEach((id) => removeToast(id));
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    init,
    cleanup
  });
}