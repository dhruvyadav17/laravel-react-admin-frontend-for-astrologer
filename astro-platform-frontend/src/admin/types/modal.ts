import type { User, Role } from "../../types/models";

/* ================= ASSIGN ================= */

export type AssignMode =
  | "user-role"
  | "user-permission"
  | "role-permission";

/* ================= MODAL MAP ================= */

export type ModalMap = {
  /* USER */
  "user-form": null;

  /* GENERIC ASSIGN */
  "assign": {
    mode: AssignMode;
    entity: User | Role;
  };

  /* ROLE */
  "role-add": null;
  "role-edit": Role;

  /* PERMISSION CRUD */
  "permission": {
    id?: number;
    name?: string;
  } | null;

  /* GLOBAL */
  "confirm-delete": {
    message: string;
    onConfirm: () => Promise<void>;
    confirmLabel?: string;
  };
};
