// Simple confirm-then-execute hook.
// Wraps window.confirm so pages don't need to handle the confirm/cancel logic themselves.

type ConfirmOptions = {
  message:       string;
  onConfirm:     () => Promise<void> | void;
  confirmLabel?: string; // appended to the dialog message e.g. "Delete user"
};

export function useConfirmAction() {
  return async ({ message, onConfirm, confirmLabel }: ConfirmOptions) => {
    const dialog = confirmLabel ? `${message}\n\nClick OK to ${confirmLabel}.` : message;
    if (!window.confirm(dialog)) return;
    await onConfirm();
  };
}
