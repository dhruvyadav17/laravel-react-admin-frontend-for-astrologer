type ConfirmOptions = {
  message: string;
  onConfirm: () => Promise<void> | void;
};

export function useConfirmAction() {
  return async ({ message, onConfirm }: ConfirmOptions) => {
    const confirmed = window.confirm(message);

    if (!confirmed) return;

    await onConfirm();
  };
}
