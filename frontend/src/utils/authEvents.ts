const AUTH_EVENT_KEY = "__auth_event__";

export const emitLogoutEvent = () => {
  localStorage.setItem(
    AUTH_EVENT_KEY,
    JSON.stringify({
      type: "LOGOUT",
      at: Date.now(),
    })
  );
};

export const listenAuthEvents = (onLogout: () => void) => {
  window.addEventListener("storage", (e) => {
    if (e.key === AUTH_EVENT_KEY && e.newValue) {
      const payload = JSON.parse(e.newValue);
      if (payload.type === "LOGOUT") {
        onLogout();
      }
    }
  });
};
