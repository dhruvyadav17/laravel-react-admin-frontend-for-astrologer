// PATH: src/admin/features/astrologers/AstrologersPage.tsx
// REFACTOR:
//   Avatar component    → avatar/initials block replace kiya (10 lines → 1 line)
//   OnlineBadge         → inline badge replace kiya
//   VerifiedBadge       → inline badge replace kiya
//   StarRating          → inline ★ replace kiya
//   TableSearch         → already debounced, reuse kiya (search box simplify)

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
import Avatar                          from "../../../components/ui/Avatar";
import StarRating                      from "../../../components/ui/StarRating";
import { OnlineBadge, VerifiedBadge, TableSearch } from "../../../components/table/table.helpers";
import { PERMISSIONS }                 from "../../../constants/rbac";
import type { Astrologer, FieldConfig } from "../../../types/models";
import { toast }                       from "react-toastify";

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
    name: "consultation_type", label: "Consultation Type", type: "select",
    options: [
      { label: "All — Chat, Call & Video", value: "all"   },
      { label: "Chat Only",                value: "chat"  },
      { label: "Call Only",                value: "call"  },
      { label: "Video Only",               value: "video" },
    ],
  },
];

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

  const handleVerify = async (id: number, isVerified: boolean) => {
    try {
      await verify(id).unwrap();
      toast.success(isVerified ? "Verification revoked" : "Astrologer verified successfully");
      refetch();
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const columns = (
    <tr>
      <th>#</th><th>Astrologer</th><th>Expertise</th>
      <th>Exp</th><th>Price/Min</th><th>Rating</th>
      <th>Online</th><th>Status</th>
      <th className="text-end pe-3">Actions</th>
    </tr>
  );

  const renderRow = (a: Astrologer, actions: any[]) => {
    const verifyAction = {
      key:     "verify",
      icon:    a.is_verified ? "fas fa-check-circle" : "fas fa-circle",
      title:   a.is_verified ? "Revoke verification" : "Verify astrologer",
      variant: (a.is_verified ? "success" : "secondary") as any,
      show:    !a.deleted_at,
      onClick: () => handleVerify(a.id, a.is_verified),
    };

    return (
      <tr key={a.id} className={a.deleted_at ? "table-secondary opacity-75" : ""}>
        <td className="text-muted small">{a.id}</td>

        {/* BEFORE: 10-line image/initials block | AFTER: Avatar + 2 lines */}
        <td>
          <div className="d-flex align-items-center gap-2">
            <Avatar name={a.name} src={a.profile_image} size={34} />
            <div>
              <div className="fw-semibold small">{a.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>{a.email}</div>
            </div>
          </div>
        </td>

        <td><span className="badge bg-primary-subtle text-primary border">{a.expertise}</span></td>
        <td className="small">{a.experience} yrs</td>
        <td className="small">₹{a.price_per_minute}/min</td>

        {/* BEFORE: inline ★ string | AFTER: StarRating */}
        <td>
          <div className="d-flex align-items-center gap-1">
            <StarRating rating={a.rating ?? 0} size={12} />
            <span className="small fw-semibold">{a.rating?.toFixed(1)}</span>
            <span className="text-muted" style={{ fontSize: 10 }}>({a.total_reviews})</span>
          </div>
        </td>

        {/* BEFORE: inline badge | AFTER: OnlineBadge */}
        <td><OnlineBadge online={a.is_online} /></td>

        {/* BEFORE: inline badge | AFTER: VerifiedBadge */}
        <td><VerifiedBadge verified={a.is_verified} /></td>

        <td className="text-end pe-3">
          <RowActions actions={[verifyAction, ...actions]} />
        </td>
      </tr>
    );
  };

  /* ── Filter bar — TableSearch replace kiya (already debounced) ── */
  const topContent = (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <TableSearch
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Search by name, email or expertise..."
            />
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm" value={verified}
              onChange={(e) => setVerified(e.target.value)}>
              <option value="">All Astrologers</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
          <div className="col-md-4 text-muted small">
            {astrologers.length} astrologer{astrologers.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );

  return (
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
  );
}
