let i = 0;
let toastTimeout;
let toastInterval;
let toasting = [];
let messages = [];
let waitFor;
let toastEvery;
let toastDuration;

const fetchFont = async () => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Gabarito:wght@400..900&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

function ensureToastContainer() {
  if (!document.querySelector("#poopup-toast-container")) {
    const container = document.createElement("div");
    container.id = "poopup-toast-container";
    container.className = "poopup-toast-container";
    document.body.appendChild(container);
  }
}

function showToast(content, options = {}) {
  ensureToastContainer();

  const id = `toast-${Date.now()}`;
  const toast = document.createElement("div");
  toast.id = id;
  toast.className = "poopup-toast";

  // Check if content is a string of HTML or just text
  if (options.isHTML) {
    toast.innerHTML = content; // Set inner HTML directly
  } else {
    toast.textContent = content; // Safer way to insert text
  }

  // if user is on mobile, remove all other toasts
  if (window.innerWidth < 640) {
    toasting.forEach((id) => removeToast(id, true));
  }

  // add the toast at the top  of the container (poopup-toast-container) — it should be the first element
  document.querySelector("#poopup-toast-container").prepend(toast);
  // document.querySelector("#poopup-toast-container").appendChild(toast);

  toasting.push(id);

  // Set auto-dismissal
  if (!options.stay || options.duration) {
    setTimeout(() => removeToast(id), options.duration || 10000);
  }
}

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

function cleanup() {
  console.log("cleaning up toaster");
  toastTimeout && clearTimeout(toastTimeout);
  toastInterval && clearInterval(toastInterval);
  toasting.forEach((id) => removeToast(id));
}

const toast = {
  custom: (htmlContent, options = {}) => {
    options.isHTML = true; // Mark content as HTML
    showToast(htmlContent, options);
  },
};

const main = async () => {
  fetchFont();

  // add the styles to the head

  // fetch the data from the API
  const data = fetchData();

  messages = data.messages;
  waitFor = data.waitFor;
  toastEvery = data.toastEvery;
  toastDuration = data.toastDuration;

  // preload images
  messages.forEach((message) => {
    const img = new Image();
    img.src = message.img;
  });

  // if the page unmounts, call cleanup
  window.addEventListener("beforeunload", cleanup);

  // if route changes, or user navigates away, call cleanup
  window?.navigation?.addEventListener("navigate", cleanup);

  // wait for waitFor before starting the toast
  toastTimeout = setTimeout(() => {
    toastInterval = setInterval(() => {
      const message = messages[i];

      // stop if there are no more messages
      if (!message) {
        clearInterval(toastInterval);
        return;
      }

      let html = `
              <img src="${message.img}" style="width: 48px; height: 48px; object-fit: cover; object-position: center; flex-shrink: 0; border-radius: 8px;" width="48" height="48" alt="" />
              <div style="width: 100%;">
                <div style="font-size: 1rem; font-weight: 600; color: rgb(3 7 18);">${message.title}</div>
                <div style="font-size: 1rem; font-weight: 400; line-height: 1.25; color: rgb(55 65 81);">${message.body}</div>
              </div>
              <div style="color: #616d80;">${message.timeAgo}</div>
          `;

      // add <a target="_blank"> wrapper if there's a link, and add a little animation to the toast when hover
      if (message?.link && message?.link?.includes("http")) {
        html = `
            <a class="poopup-toast-content" href="${message.link}" target="_blank" style="pointer-events: auto; width: 100%; cursor: pointer; transition: transform 0.2s ease-in-out;" onmouseover="this.style.transform = 'scale(1.01)';" onmouseout="this.style.transform = 'scale(1)';">
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

      toast.custom(html, { duration: toastDuration });

      i++;
    }, toastEvery);
  }, waitFor);
};

main();
