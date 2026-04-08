import { toast } from "react-toastify";

/* ===================================================== */
/* ================= TOAST HELPERS ===================== */
/* ===================================================== */

export function showSuccess(
  message: string,
  variant: "success" | "danger" = "success"
) {
  if (variant === "danger") {
    toast.error(message);
  } else {
    toast.success(message);
  }
}

export function showError(error: any) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";

  toast.error(message);
}

/* ===================================================== */
/* ================= EXECUTE WRAPPER =================== */
/* ===================================================== */

type ExecuteOptions = {
  defaultMessage?: string;
  variant?: "success" | "danger";
  silent?: boolean;
};

export async function execute<T>(
  fn: () => Promise<T>,
  options: ExecuteOptions = {}
): Promise<T> {
  const {
    defaultMessage = "Action completed successfully",
    variant = "success",
    silent = false,
  } = options;

  try {
    const result = await fn();

    if (!silent) {
      const message =
        typeof (result as any)?.message === "string" &&
        (result as any).message.trim().length > 0
          ? (result as any).message
          : defaultMessage;

      showSuccess(message, variant);
    }

    return result;
  } catch (error) {
    showError(error);
    throw error;
  }
}

/* ===================================================== */
/* ================= MODAL TITLE HELPER ================= */
/* ===================================================== */

export function getModalTitle(
  entity: string,
  hasId?: boolean
) {
  return hasId
    ? `Edit ${entity}`
    : `Add ${entity}`;
}
