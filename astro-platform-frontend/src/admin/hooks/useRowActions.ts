import { ICONS } from "../../constants/ui";

type BaseAction<T> = {
  enabled?: boolean;
  onClick: (row: T) => void;
};

type ExtraAction<T> = {
  key: string;
  icon: string;
  title: string;
  variant?: "danger" | "warning" | "primary" | "success";
  show?: boolean;
  onClick: (row: T) => void;
};

type Options<T> = {
  row: T;
  isDeleted?: boolean;

  edit?: BaseAction<T>;
  delete?: BaseAction<T>;
  restore?: BaseAction<T>;

  extra?: ExtraAction<T>[];
};

export function useRowActions<T>({
  row,
  isDeleted = false,
  edit,
  delete: deleteAction,
  restore,
  extra = [],
}: Options<T>) {
  const actions: any[] = [];

  /* ================= ACTIVE STATE ================= */

  if (!isDeleted) {
    if (edit?.enabled) {
      actions.push({
        key: "edit",
        icon: ICONS.EDIT,
        title: "Edit",
        onClick: () => edit.onClick(row),
      });
    }

    if (deleteAction?.enabled) {
      actions.push({
        key: "delete",
        icon: ICONS.DELETE,
        title: "Delete",
        variant: "danger",
        onClick: () => deleteAction.onClick(row),
      });
    }
  }

  /* ================= DELETED STATE ================= */

  if (isDeleted && restore?.enabled) {
    actions.push({
      key: "restore",
      icon: ICONS.RESTORE,
      title: "Restore",
      variant: "success",
      onClick: () => restore.onClick(row),
    });
  }

  /* ================= EXTRA ACTIONS ================= */

  extra.forEach((item) => {
    if (item.show !== false) {
      actions.push({
        ...item,
        onClick: () => item.onClick(row),
      });
    }
  });

  return actions;
}
