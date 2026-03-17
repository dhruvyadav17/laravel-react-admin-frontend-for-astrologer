import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store";
import { setStore } from "./store/storeAccessor";

import ErrorBoundary from "./components/common/ErrorBoundary";

import { listenAuthEvents } from "./utils/authEvents";
import { logoutThunk } from "./store/authSlice";

/* ===== CSS ORDER (DON'T CHANGE) ===== */
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

/* ===== JS ===== */
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/* ===== TOAST ===== */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin/styles/adminlte-sidebar-fix.css";

setStore(store);

listenAuthEvents(() => {
  store.dispatch(logoutThunk());
  window.location.replace("/login");
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
          />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
