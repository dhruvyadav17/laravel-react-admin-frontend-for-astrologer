import React    from 'react';
import ReactDOM from 'react-dom/client';
import { Provider }       from 'react-redux';
import { ToastContainer } from 'react-toastify';
import App                from './App';
import { store }          from './store';
import { setStore }       from './store/storeAccessor';
import { listenAuthEvents } from './utils/authEvents';
import { logoutThunk }    from './store/authSlice';
import ErrorBoundary      from './components/feedback/ErrorBoundary';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-toastify/dist/ReactToastify.css';
import './styles/admin-sidebar.css';
import './styles/global.css';
import './styles/user-theme.css';

setStore(store);
(window as any).__REDUX_STORE__ = store;

listenAuthEvents(() => {
  store.dispatch(logoutThunk());
  const path = window.location.pathname;
  window.location.replace(path.startsWith('/admin') ? '/admin/login' : '/login');
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
      <ToastContainer position="top-right" autoClose={3000} closeOnClick pauseOnHover />
    </Provider>
  </ErrorBoundary>
);
