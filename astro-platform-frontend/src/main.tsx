import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import { setStore } from "./store/storeAccessor";
import { listenAuthEvents } from "./utils/authEvents";
import { logoutThunk } from "./store/authSlice";
import ErrorBoundary from "./components/feedback/ErrorBoundary";

/* ── CSS order — DO NOT CHANGE ─── */
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin/styles/adminlte-sidebar-fix.css";

setStore(store);

listenAuthEvents(() => {
  store.dispatch(logoutThunk());
  window.location.replace("/login");
});

// ❌ NO <BrowserRouter> here
// ✅ AppRoutes already uses createBrowserRouter + RouterProvider internally
// Wrapping with BrowserRouter causes: "You cannot render a <Router> inside another <Router>"

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