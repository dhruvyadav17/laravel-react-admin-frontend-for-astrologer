import type { Store } from "@reduxjs/toolkit";

let store: Store | undefined;

export const setStore = (_store: Store) => {
  store = _store;
};

export const getStore = (): Store => {
  if (!store) {
    throw new Error("Redux store not initialized");
  }
  return store;
};
