import { useEffect, useMemo, useState } from "react";
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetUserPermissionsQuery,
  useGetRolePermissionsQuery,
  useAssignUserRolesMutation,
  useAssignUserPermissionsMutation,
  useAssignRolePermissionsMutation,
} from "../../../store/admin.api";

/* ================= TYPES ================= */
type Mode =
  | "user-role"
  | "user-permission"
  | "role-permission";

type Entity = {
  id: number;
  roles?: string[];
};

type AssignItem = {
  name: string;
  assigned: boolean;
};

type Role = { name: string };
type Permission = { name: string };

/* ================= HOOK ================= */
export function useAssignLogic(mode: Mode, entity: Entity) {
  const isUserRole = mode === "user-role";
  const isUserPermission = mode === "user-permission";
  const isRolePermission = mode === "role-permission";

  const [selected, setSelected] = useState<string[]>([]);

  /* ================= FETCH ALL ================= */
  const { data: roles = [] } = useGetRolesQuery(undefined, {
    skip: !isUserRole,
    refetchOnMountOrArgChange: true,
  });

  const { data: permissions = [] } = useGetPermissionsQuery(undefined, {
    skip: isUserRole,
    refetchOnMountOrArgChange: true,
  });

  /* ================= FETCH ASSIGNED ================= */
  const { data: userPermData } =
    useGetUserPermissionsQuery(entity.id, {
      skip: !isUserPermission,
    });

  const { data: rolePermData } =
    useGetRolePermissionsQuery(entity.id, {
      skip: !isRolePermission,
    });

  /* ================= MUTATIONS ================= */
  const [assignUserRoles] = useAssignUserRolesMutation();
  const [assignUserPermissions] = useAssignUserPermissionsMutation();
  const [assignRolePermissions] = useAssignRolePermissionsMutation();

  /* ================= INIT SELECTED ================= */
  useEffect(() => {
    if (isUserRole) {
      setSelected(entity.roles ?? []);
      return;
    }

    if (isUserPermission) {
      setSelected(userPermData?.assigned ?? []);
      return;
    }

    if (isRolePermission) {
      setSelected(rolePermData?.assigned ?? []);
    }
  }, [mode, entity.id, entity.roles, userPermData, rolePermData]);

  /* ================= ITEMS ================= */
  const items: AssignItem[] = useMemo(() => {
    const selectedSet = new Set(selected);

    if (isUserRole) {
      return (roles as Role[]).map((r) => ({
        name: r.name,
        assigned: selectedSet.has(r.name),
      }));
    }

    return (permissions as Permission[]).map((p) => ({
      name: p.name,
      assigned: selectedSet.has(p.name),
    }));
  }, [isUserRole, roles, permissions, selected]);

  /* ================= TOGGLE ================= */
  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (isUserRole) {
      return assignUserRoles({
        id: entity.id,
        roles: selected,
      }).unwrap();
    }

    if (isUserPermission) {
      return assignUserPermissions({
        id: entity.id,
        permissions: selected,
      }).unwrap();
    }

    if (isRolePermission) {
      return assignRolePermissions({
        id: entity.id,
        permissions: selected,
      }).unwrap();
    }
  };

  /* ================= TITLE ================= */
  const title = isUserRole
    ? "Assign Roles"
    : "Assign Permissions";

  return {
    items,
    selected,
    toggle,
    submit,
    title,
  };
}