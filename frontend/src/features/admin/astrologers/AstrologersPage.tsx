import { useState } from "react";
import {
  useAdminGetAstrologersQuery,
  useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation,
  useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation,
  useAdminVerifyAstrologerMutation,
} from "../../../store/api/astrologer.api";

import AdminCrudPage from "../../../admin/components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";
import Avatar from "../../../components/ui/Avatar";
import StarRating from "../../../components/ui/StarRating";
import {
  OnlineBadge,
  VerifiedBadge,
  TableSearch,
} from "../../../components/table/table.helpers";

import { PERMISSIONS } from "../../../constants/rbac";
import type { Astrologer, FieldConfig } from "../../../types/models";
import { toast } from "react-toastify";
import { useCrud } from "../../../core/crud/useCrud";

/* ───────────────── INITIAL VALUES ───────────────── */

const INITIAL_VALUES: Partial<Astrologer> = {
  name: "",
  email: "",
  bio: "",
  expertise: "",
  experience: 1,
  price_per_minute: 10,
  languages: [],
  skills: [],
  consultation_type: "all",
};

/* ───────────────── FORM FIELDS ───────────────── */

const FIELDS: FieldConfig<Partial<Astrologer>>[] = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "expertise", label: "Main Expertise", type: "text", required: true },
  { name: "bio", label: "Bio", type: "textarea", required: true },
  { name: "experience", label: "Experience", type: "number", min: 0 },
  { name: "price_per_minute", label: "Price/Min", type: "number", min: 1 },
  {
    name: "consultation_type",
    label: "Consultation Type",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Chat", value: "chat" },
      { label: "Call", value: "call" },
      { label: "Video", value: "video" },
    ],
  },
];

/* ───────────────── COMPONENT ───────────────── */

export default function AstrologersPage() {
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");

  const { data, isLoading, isError, refetch } = useAdminGetAstrologersQuery({
    search: search || undefined,
    is_verified: verified === "" ? undefined : verified === "true",
  });

  const [create] = useAdminCreateAstrologerMutation();
  const [update] = useAdminUpdateAstrologerMutation();
  const [remove] = useAdminDeleteAstrologerMutation();
  const [restore] = useAdminRestoreAstrologerMutation();
  const [verify] = useAdminVerifyAstrologerMutation();

  /* ✅ CLEAN CRUD */
  const crud = useCrud<Astrologer>({
    create,
    update: ({ id, ...data }: any) => update({ id, data }),
    remove,
    onSuccess: refetch,
  });

  /* ───────────────── VERIFY ───────────────── */

  const handleVerify = async (id: number, isVerified: boolean) => {
    try {
      await verify(id).unwrap();
      toast.success(
        isVerified
          ? "Verification revoked"
          : "Astrologer verified successfully"
      );
      refetch();
    } catch {
      toast.error("Action failed");
    }
  };

  /* ───────────────── TABLE ───────────────── */

  const columns = (
    <tr>
      <th>#</th>
      <th>Astrologer</th>
      <th>Expertise</th>
      <th>Exp</th>
      <th>Price</th>
      <th>Rating</th>
      <th>Online</th>
      <th>Status</th>
      <th className="text-end">Actions</th>
    </tr>
  );

  const renderRow = (a: Astrologer, actions: any[]) => {
    const verifyAction = {
      key: "verify",
      icon: a.is_verified ? "fas fa-check-circle" : "fas fa-circle",
      variant: a.is_verified ? "success" : "secondary",
      onClick: () => handleVerify(a.id, a.is_verified),
    };

    return (
      <tr
        key={a.id}
        className={a.deleted_at ? "table-danger opacity-75" : ""}
      >
        <td>{a.id}</td>

        <td className="d-flex align-items-center gap-2">
          <Avatar name={a.name} src={a.profile_image} size={34} />
          <div>
            <div>{a.name}</div>
            <small className="text-muted">{a.email}</small>
          </div>
        </td>

        <td>{a.expertise}</td>
        <td>{a.experience} yrs</td>
        <td>₹{a.price_per_minute}</td>

        <td>
          <StarRating rating={a.rating ?? 0} size={12} />
        </td>

        <td>
          <OnlineBadge online={a.is_online} />
        </td>

        <td>
          <VerifiedBadge verified={a.is_verified} />
        </td>

        <td className="text-end">
          <RowActions actions={[verifyAction, ...actions]} />
        </td>
      </tr>
    );
  };

  /* ───────────────── UI ───────────────── */

  const topContent = (
    <div className="card mb-3">
      <div className="card-body d-flex gap-2">
        <TableSearch
          value={search}
          onChange={setSearch}
          placeholder="Search astrologer..."
        />

        <select
          className="form-select"
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>
    </div>
  );

  /* ───────────────── RENDER ───────────────── */

  return (
    <AdminCrudPage<Astrologer>
      entity="Astrologer"
      query={{ data, isLoading, isError, refetch }}
      mutations={{
        create: [crud.create],
        update: [crud.update],
        delete: [crud.remove],
        restore: [
          async (id: number) => {
            try {
              await restore(id).unwrap();
              // toast.success("Restored successfully");
              refetch();
            } catch {
              toast.error("Restore failed");
            }
          },
        ],
      }}
      columns={columns}
      fields={FIELDS}
      initialValues={INITIAL_VALUES}
      permissions={{
        create: PERMISSIONS.ASTROLOGER.CREATE,
        update: PERMISSIONS.ASTROLOGER.UPDATE,
        delete: PERMISSIONS.ASTROLOGER.DELETE,
        restore: PERMISSIONS.ASTROLOGER.RESTORE,
      }}
      renderRow={renderRow}
      topContent={topContent}
    />
  );
}