// PATH: src/admin/features/astrologers/AstrologersPage.tsx
// FIX: Old hook names replace kiye:
//   useGetAdminAstrologersQuery     → useAdminGetAstrologersQuery
//   useCreateAstrologerMutation     → useAdminCreateAstrologerMutation
//   useUpdateAstrologerMutation     → useAdminUpdateAstrologerMutation
//   useDeleteAstrologerMutation     → useAdminDeleteAstrologerMutation
//   + restore, verify mutations add kiye
//   + search, filter bar add kiya
//   + correct permissions (astrologer-* not user-*)

import { useState } from "react";
import {
  useAdminGetAstrologersQuery,
  useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation,
  useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation,
  useAdminVerifyAstrologerMutation,
} from "../../../store/api/astrologer.api";
import AdminCrudPage from "../../components/crud/AdminCrudPage";
import Can from "../../../components/auth/Can";
import { PERMISSIONS } from "../../../constants/rbac";
import type { Astrologer, FieldConfig } from "../../../types/models";
import { toast } from "react-toastify";

/* =====================================================
 | FORM FIELDS
 ===================================================== */
const INITIAL_VALUES: Partial<Astrologer> = {
  name:              "",
  email:             "",
  bio:               "",
  expertise:         "",
  experience:        1,
  price_per_minute:  10,
  languages:         [],
  skills:            [],
  consultation_type: "all",
};

const FIELDS: FieldConfig<Partial<Astrologer>>[] = [
  { name: "name",             label: "Full Name",            type: "text",     required: true },
  { name: "email",            label: "Email Address",        type: "email",    required: true },
  { name: "expertise",        label: "Main Expertise",       type: "text",     required: true, placeholder: "e.g. Vedic Astrology" },
  { name: "bio",              label: "Bio / Description",    type: "textarea", required: true, rows: 3 },
  { name: "experience",       label: "Experience (years)",   type: "number",   required: true, min: 0, max: 50 },
  { name: "price_per_minute", label: "Price per Minute (₹)", type: "number",   required: true, min: 1 },
  {
    name: "consultation_type",
    label: "Consultation Type",
    type: "select",
    options: [
      { label: "All — Chat, Call & Video", value: "all"   },
      { label: "Chat Only",                value: "chat"  },
      { label: "Call Only",                value: "call"  },
      { label: "Video Only",               value: "video" },
    ],
  },
];

/* =====================================================
 | MAIN PAGE
 ===================================================== */
export default function AstrologersPage() {
  const [search,   setSearch]   = useState("");
  const [verified, setVerified] = useState("");

  const { data, isLoading, isError, refetch } = useAdminGetAstrologersQuery({
    search:      search   || undefined,
    is_verified: verified === "" ? undefined : verified === "true",
  });

  const [create]  = useAdminCreateAstrologerMutation();
  const [update]  = useAdminUpdateAstrologerMutation();
  const [remove]  = useAdminDeleteAstrologerMutation();
  const [restore] = useAdminRestoreAstrologerMutation();
  const [verify]  = useAdminVerifyAstrologerMutation();

  const astrologers = data?.data ?? [];

  const handleVerify = async (id: number, currentState: boolean) => {
    try {
      await verify(id).unwrap();
      toast.success(currentState ? "Verification revoked" : "Astrologer verified!");
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  /* ── COLUMNS ─────────────────────────────────────── */
  const columns = (
    <tr>
      <th>#</th>
      <th>Astrologer</th>
      <th>Expertise</th>
      <th>Exp</th>
      <th>Price/Min</th>
      <th>Rating</th>
      <th>Online</th>
      <th>Verified</th>
      <th className="text-end pe-3">Actions</th>
    </tr>
  );

  /* ── ROW ─────────────────────────────────────────── */
  const renderRow = (
    a: Astrologer,
    onEdit:    (item: Astrologer) => void,
    onDelete:  (item: Astrologer) => void,
    onRestore: (item: Astrologer) => void
  ) => (
    <tr key={a.id} className={a.deleted_at ? "table-secondary opacity-75" : ""}>
      <td className="text-muted small">{a.id}</td>

      <td>
        <div className="d-flex align-items-center gap-2">
          {a.profile_image ? (
            <img
              src={a.profile_image}
              alt={a.name}
              className="rounded-circle flex-shrink-0"
              style={{ width: 34, height: 34, objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{ width: 34, height: 34, fontSize: 13 }}
            >
              {a.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="fw-semibold small">{a.name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{a.email}</div>
          </div>
        </div>
      </td>

      <td>
        <span className="badge bg-primary-subtle text-primary border">
          {a.expertise}
        </span>
      </td>
      <td className="small">{a.experience} yrs</td>
      <td className="small">₹{a.price_per_minute}</td>

      <td>
        <div className="d-flex align-items-center gap-1">
          <span className="text-warning small">★</span>
          <span className="fw-semibold small">{a.rating?.toFixed(1)}</span>
          <span className="text-muted" style={{ fontSize: 11 }}>
            ({a.total_reviews})
          </span>
        </div>
      </td>

      <td>
        <span className={`badge ${a.is_online ? "bg-success" : "bg-secondary"}`}>
          {a.is_online ? "Online" : "Offline"}
        </span>
      </td>

      <td>
        <Can permission={PERMISSIONS.ASTROLOGER.VERIFY}>
          <button
            className={`btn btn-sm ${a.is_verified ? "btn-success" : "btn-outline-secondary"}`}
            style={{ fontSize: 11, padding: "2px 10px" }}
            onClick={() => handleVerify(a.id, a.is_verified)}
            title={a.is_verified ? "Click to revoke" : "Click to verify"}
          >
            {a.is_verified ? (
              <><i className="fas fa-check me-1" />Verified</>
            ) : (
              "Unverified"
            )}
          </button>
        </Can>
      </td>

      <td className="text-end pe-3">
        <div className="d-flex gap-1 justify-content-end">
          {a.deleted_at ? (
            <Can permission={PERMISSIONS.ASTROLOGER.RESTORE}>
              <button
                className="btn btn-sm btn-outline-success"
                title="Restore"
                onClick={() => onRestore(a)}
              >
                <i className="fas fa-undo" />
              </button>
            </Can>
          ) : (
            <>
              <Can permission={PERMISSIONS.ASTROLOGER.UPDATE}>
                <button
                  className="btn btn-sm btn-outline-primary"
                  title="Edit"
                  onClick={() => onEdit(a)}
                >
                  <i className="fas fa-edit" />
                </button>
              </Can>
              <Can permission={PERMISSIONS.ASTROLOGER.DELETE}>
                <button
                  className="btn btn-sm btn-outline-danger"
                  title="Delete"
                  onClick={() => onDelete(a)}
                >
                  <i className="fas fa-trash" />
                </button>
              </Can>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  /* ── SEARCH + FILTER BAR ─────────────────────────── */
  const topContent = (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white">
                <i className="fas fa-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email or expertise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch("")}
                >
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={verified}
              onChange={(e) => setVerified(e.target.value)}
            >
              <option value="">All (Verified &amp; Unverified)</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
          <div className="col-md-4 text-muted small">
            Showing {astrologers.length} astrologer{astrologers.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── RENDER ──────────────────────────────────────── */
  return (
    <AdminCrudPage<Astrologer>
      entity="Astrologer"
      query={{ data: astrologers, isLoading, isError, refetch }}
      mutations={{
        create: [
          async (d: Partial<Astrologer>) => {
            await create(d).unwrap();
          },
        ],
        update: [
          async (d: Partial<Astrologer> & { id: number }) => {
            await update({ id: d.id, data: d }).unwrap();
          },
        ],
        delete: [
          async (id: number) => {
            await remove(id).unwrap();
          },
        ],
        restore: [
          async (id: number) => {
            await restore(id).unwrap();
          },
        ],
      }}
      columns={columns}
      fields={FIELDS}
      initialValues={INITIAL_VALUES}
      permissions={{
        create:  PERMISSIONS.ASTROLOGER.CREATE,
        update:  PERMISSIONS.ASTROLOGER.UPDATE,
        delete:  PERMISSIONS.ASTROLOGER.DELETE,
        restore: PERMISSIONS.ASTROLOGER.RESTORE,
      }}
      renderRow={renderRow}
      topContent={topContent}
    />
  );
}