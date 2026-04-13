// FIX: ConfirmOptions type mein confirmLabel nahi tha
//      AdminCrudPage confirmLabel pass karta tha -- silently drop hota tha
//      window.confirm() ka message confirmLabel include do
//              abhi simple confirm ke saath kaam karta hai

type ConfirmOptions = {
  message:       string;
  onConfirm:     () => Promise<void> | void;
  confirmLabel?: string;  // FIX: missing tha
};

export function useConfirmAction() {
  return async ({ message, onConfirm, confirmLabel }: ConfirmOptions) => {

    // FIX: confirmLabel ko message mein include do agar diya gaya ho
    const fullMessage = confirmLabel
      ? `${message}\n\nClick OK to ${confirmLabel}.`
      : message;

    const confirmed = window.confirm(fullMessage);
    if (!confirmed) return;

    await onConfirm();
  };
}
