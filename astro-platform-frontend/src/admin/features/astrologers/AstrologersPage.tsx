// PATH: src/admin/features/astrologers/AstrologersPage.tsx
// FIX: Pagination nahi tha — sare astrologers ek hi page pe load hote the
//      Ab page state add kiya, Pagination component use kiya
// FIX: Search debounce — TableSearch already debounced hai ab

import { useState }                    from "react";
import {
  useAdminGetAstrologersQuery,
  useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation,
  useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation,
  useAdminVerifyAstrologerMutation,
} from "../../../store/api/astrologer.api";
import AdminCrudPage                   from "../../components/crud/AdminCrudPage";
import RowActions                      from "../../../components/table/RowActions";
import Pagination                      from "../../../components/table/Pagination";
import { TableSearch }                 from "../../../components/table/table.helpers";
import { PERMISSIONS }                 from "../../../constants/rbac";
import type { Astrologer, FieldConfig } from "../../../types/models";
import { toast }                       from "react-toastify";

/* ─── Form config ──────────────────────────────────── */
const INITIAL_VALUES: Partial<Astrologer> = {
  name: "", email: "", bio: "", expertise: "",
  experience: 1, price_per_minute: 10,
  languages: [], skills: [], consultation_type: "all",
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

/* ─── Main page ────────────────────────────────────── */
export default function AstrologersPage() {
  const [search,   setSearch]   = useState("");
  const [verified, setVerified] = useState("");
  const [page,     setPage]     = useState(1);   // FIX: pagination state

  const { data, isLoading, isError, refetch } = useAdminGetAstrologersQuery({
    search:      search   || undefined,
    is_verified: verified === "" ? undefined : verified === "true",
    page,                                           // FIX: pass page to API
  });

  const [create]  = useAdminCreateAstrologerMutation();
  const [update]  = useAdminUpdateAstrologerMutation();
  const [remove]  = useAdminDeleteAstrologerMutation();
  const [restore] = useAdminRestoreAstrologerMutation();
  const [verify]  = useAdminVerifyAstrologerMutation();

  const astrologers = data?.data ?? [];
  const meta        = data?.pagination ?? null;   // FIX: pagination meta

  const handleVerify = async (id: number, isVerified: boolean) => {
    try {
      await verify(id).unwrap();
      toast.success(isVerified ? "Verification revoked" : "Astrologer verified!");
      refetch();
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  // Reset to page 1 when filters change
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleVerifiedChange = (val: string) => { setVerified(val); setPage(1); };

  /* ─── Columns ───────────────────────────────────── */
  const columns = (
    <tr>
      <th>#</th>
      <th>Astrologer</th>
      <th>Expertise</th>
      <th>Exp</th>
      <th>Price/Min</th>
      <th>Rating</th>
      <th>Online</th>
      <th>Status</th>
      <th className="text-end pe-3">Actions</th>
    </tr>
  );

  /* ─── renderRow ─────────────────────────────────── */
  const renderRow = (a: Astrologer, actions: any[]) => {
    const verifyAction = {
      key:     "verify",
      icon:    a.is_verified ? "fas fa-check-circle" : "fas fa-circle",
      title:   a.is_verified ? "Click to revoke verification" : "Click to verify",
      variant: (a.is_verified ? "success" : "secondary") as any,
      show:    !a.deleted_at,
      onClick: () => handleVerify(a.id, a.is_verified),
    };

    const allActions = [verifyAction, ...actions];

    return (
      <tr key={a.id} className={a.deleted_at ? "table-secondary opacity-75" : ""}>
        <td className="text-muted small">{a.id}</td>

        <td>
          <div className="d-flex align-items-center gap-2">
            {a.profile_image ? (
              <img src={a.profile_image} alt={a.name} className="rounded-circle flex-shrink-0"
                style={{ width: 34, height: 34, objectFit: "cover" }} />
            ) : (
              <div className="rounded-circle bg-primary text-white d-flex align-items-center
                              justify-content-center fw-bold flex-shrink-0"
                style={{ width: 34, height: 34, fontSize: 13 }}>
                {a.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="fw-semibold small">{a.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>{a.email}</div>
            </div>
          </div>
        </td>

        <td><span className="badge bg-primary-subtle text-primary border">{a.expertise}</span></td>
        <td className="small">{a.experience} yrs</td>
        <td className="small">₹{a.price_per_minute}/min</td>

        <td>
          <span className="text-warning small">★ </span>
          <span className="fw-semibold small">{a.rating?.toFixed(1)}</span>
          <span className="text-muted" style={{ fontSize: 11 }}> ({a.total_reviews})</span>
        </td>

        <td>
          <span className={`badge ${a.is_online ? "bg-success" : "bg-secondary"}`}>
            {a.is_online ? "Online" : "Offline"}
          </span>
        </td>

        <td>
          <span className={`badge ${a.is_verified ? "bg-success" : "bg-warning text-dark"}`}>
            {a.is_verified ? "✓ Verified" : "Unverified"}
          </span>
        </td>

        <td className="text-end pe-3">
          <RowActions actions={allActions} />
        </td>
      </tr>
    );
  };

  /* ─── Filter bar ────────────────────────────────── */
  const topContent = (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            {/* FIX: TableSearch now debounced internally */}
            <TableSearch
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, email or expertise..."
            />
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={verified}
              onChange={(e) => handleVerifiedChange(e.target.value)}>
              <option value="">All Astrologers</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
          <div className="col-md-4 text-muted small">
            {meta
              ? `${meta.total} astrologer${meta.total !== 1 ? "s" : ""} total`
              : `${astrologers.length} shown`}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Render ────────────────────────────────────── */
  return (
    <>
      <AdminCrudPage<Astrologer>
        entity="Astrologer"
        query={{ data: astrologers, isLoading, isError, refetch }}
        mutations={{
          create:  [async (d: Partial<Astrologer>) => { await create(d).unwrap(); }],
          update:  [async (d: Partial<Astrologer> & { id: number }) => { await update({ id: d.id, data: d }).unwrap(); }],
          delete:  [async (id: number) => { await remove(id).unwrap(); }],
          restore: [async (id: number) => { await restore(id).unwrap(); }],
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

      {/* FIX: Pagination add kiya */}
      {meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}
    </>
  );
}
