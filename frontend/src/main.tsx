// PATH: src/main.tsx
// FIX BUG-16: listenAuthEvents → hamesha /login redirect karta tha
//              Admin user dusre tab mein logout kare → /admin/login chahiye
//              Ab currentPath check karke context-aware redirect

import React           from "react";
import ReactDOM        from "react-dom/client";
import App             from "./App";
import { Provider }    from "react-redux";
import { store }       from "./store";
import { setStore }    from "./store/storeAccessor";
import { listenAuthEvents } from "./utils/authEvents";
import { logoutThunk } from "./store/authSlice";
import ErrorBoundary   from "./components/feedback/ErrorBoundary";

/* ── CSS order — DO NOT CHANGE ──────────────────── */
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin/styles/adminlte-sidebar-fix.css";

setStore(store);

/* FIX BUG-16: context-aware redirect on cross-tab logout
   Before: always → /login (wrong for admin tabs)
   After:  admin path → /admin/login
           user path  → /login                         */
listenAuthEvents(() => {
  store.dispatch(logoutThunk());

  const currentPath   = window.location.pathname;
  const redirectTo    = currentPath.startsWith("/admin")
    ? "/admin/login"
    : "/login";

  window.location.replace(redirectTo);
});

// ❌ NO <BrowserRouter> here
// ✅ AppRoutes uses createBrowserRouter + RouterProvider internally
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);
