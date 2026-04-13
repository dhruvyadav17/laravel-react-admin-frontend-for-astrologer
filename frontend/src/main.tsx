import React           from "react";
import ReactDOM        from "react-dom/client";
import App             from "./App";
import { Provider }    from "react-redux";
import { store }       from "./store";
import { setStore }    from "./store/storeAccessor";
import { listenAuthEvents } from "./utils/authEvents";
import { logoutThunk } from "./store/authSlice";
import ErrorBoundary   from "./components/feedback/ErrorBoundary";

/* -- CSS import order -- CRITICAL, DO NOT CHANGE --
   1. Bootstrap base
   2. FontAwesome icons
   3. Bootstrap JS (popper, dropdowns, modals)
   4. Toast notifications
   5. Admin sidebar custom styles
   6. Global resets (our index.css -- NO button overrides)
   7. User portal theme (last -- highest priority)
------------------------------------------------- */
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin/styles/adminlte-sidebar-fix.css";
import "./index.css";
import "./user/styles/index.css";

setStore(store);
(window as any).__REDUX_STORE__ = store; // Used by WebRTC recording upload

listenAuthEvents(() => {
  store.dispatch(logoutThunk());
  const currentPath = window.location.pathname;
  const redirectTo  = currentPath.startsWith("/admin") ? "/admin/login" : "/login";
  window.location.replace(redirectTo);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </Provider>
  </ErrorBoundary>
);
