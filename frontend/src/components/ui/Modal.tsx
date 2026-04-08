import { useEffect } from "react";
import Button from "./Button";
import { ICONS } from "../../constants/ui";

type Props = {
  title: string;
  children: React.ReactNode;

  onClose: () => void;

  /* primary action */
  onSave?: () => void | Promise<void>;
  saveText?: string;
  saveVariant?: "primary" | "success" | "danger";
  saveDisabled?: boolean;

  /* secondary */
  cancelText?: string;

  /* state */
  loading?: boolean;
  disableClose?: boolean;

  /* layout */
  size?: "sm" | "md" | "lg";

  /* advanced */
  footer?: React.ReactNode;
};

export default function Modal({
  title,
  children,
  onClose,

  onSave,
  saveText = "Save",
  saveVariant = "primary",
  saveDisabled = false,
  cancelText = "Cancel",

  loading = false,
  disableClose = false,

  size = "md",
  footer,
}: Props) {
  useEffect(() => {
    document.body.classList.add("modal-open");

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onEsc);
    };
  }, [disableClose, onClose]);

  const sizeClass =
    size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : "";

  return (
    <>
      {/* BACKDROP */}
      <div className="modal-backdrop fade show" />

      {/* MODAL */}
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        onClick={!disableClose ? onClose : undefined}
      >
        <div
          className={`modal-dialog modal-dialog-centered ${sizeClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>

              {!disableClose && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                />
              )}
            </div>

            {/* BODY */}
            <div className="modal-body">{children}</div>

            {/* FOOTER */}
            <div className="modal-footer justify-content-between">
              {footer ?? (
                <>
                  <Button
                    label={cancelText}
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading || disableClose}
                  />

                  {onSave && (
                    <Button
                      label={saveText}
                      icon={ICONS.SAVE}
                      variant={saveVariant}
                      loading={loading}
                      disabled={saveDisabled}
                      onClick={onSave}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
