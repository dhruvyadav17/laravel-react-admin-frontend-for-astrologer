//   RTK adminUpdateAstrologer expects { id, data: {...} }
//   useCrud calls update({ id, ...values }) -- wrong shape
// FIX: Direct RTK mutations pass do AdminCrudPage ko

import { useState }  from 'react';
import {
  useAdminGetAstrologersQuery,
  useAdminCreateAstrologerMutation,
  useAdminUpdateAstrologerMutation,
  useAdminDeleteAstrologerMutation,
  useAdminRestoreAstrologerMutation,
  useAdminVerifyAstrologerMutation,
} from '../../../store/api/astrologer.api';

import AdminCrudPage from '../../../admin/components/crud/AdminCrudPage';
import RowActions    from '../../../components/table/RowActions';
import Avatar        from '../../../components/ui/Avatar';
import StarRating    from '../../../components/ui/StarRating';
import { OnlineBadge, VerifiedBadge, TableSearch } from '../../../components/table/table.helpers';

import { PERMISSIONS } from '../../../constants/rbac';
import { useAuth }     from '../../../auth/hooks/useAuth';
import { toast }       from 'react-toastify';
import type { Astrologer, FieldConfig } from '../../../types/models';

const FIELDS: FieldConfig<Partial<Astrologer>>[] = [
  { name: 'name',             label: 'Full Name',        type: 'text',     required: true },
  { name: 'email',            label: 'Email Address',    type: 'email',    required: true },
  { name: 'expertise',        label: 'Main Expertise',   type: 'text',     required: true },
  { name: 'bio',              label: 'Bio',              type: 'textarea', required: true, rows: 3 },
  { name: 'experience',       label: 'Experience (yrs)', type: 'number',   min: 0, max: 50 },
  { name: 'price_per_minute', label: 'Price/Min (₹)',    type: 'number',   min: 1 },
  {
    name: 'consultation_type', label: 'Consultation Type', type: 'select',
    options: [
      { label: 'All', value: 'all' }, { label: 'Chat', value: 'chat' },
      { label: 'Call', value: 'call' }, { label: 'Video', value: 'video' },
    ],
  },
];

const INITIAL: Partial<Astrologer> = {
  name: '', email: '', bio: '', expertise: '',
  experience: 1, price_per_minute: 10,
  languages: [], skills: [], consultation_type: 'all',
};

export default function AstrologersPage() {
  const { can }                 = useAuth();
  const [search, setSearch]     = useState('');
  const [verified, setVerified] = useState('');

  const query = useAdminGetAstrologersQuery({
    search:      search   || undefined,
    is_verified: verified === '' ? undefined : verified === 'true',
  });

  const [createAstrologer]  = useAdminCreateAstrologerMutation();
  const [updateAstrologer]  = useAdminUpdateAstrologerMutation();
  const [deleteAstrologer]  = useAdminDeleteAstrologerMutation();
  const [restoreAstrologer] = useAdminRestoreAstrologerMutation();
  const [verifyAstrologer]  = useAdminVerifyAstrologerMutation();

  const handleVerify = async (a: Astrologer) => {
    try {
      await verifyAstrologer(a.id).unwrap();
      toast.success(a.is_verified ? 'Verification revoked' : 'Astrologer verified');
      query.refetch();
    } catch {
      toast.error('Verify action failed');
    }
  };

  const renderRow = (a: Astrologer, actions: any[]) => (
    <tr key={a.id} className={a.deleted_at ? 'table-danger opacity-75' : ''}>
      <td className="text-muted small">{a.id}</td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <Avatar name={a.name} src={a.profile_image} size={34} />
          <div>
            <div className="fw-semibold small">{a.name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{a.email}</div>
          </div>
        </div>
      </td>
      <td className="small">{a.expertise || '--'}</td>
      <td className="small">{a.experience} yrs</td>
      <td className="small">₹{a.price_per_minute}/min</td>
      <td><StarRating rating={a.rating ?? 0} size={12} /></td>
      <td><OnlineBadge online={a.is_online} /></td>
      <td><VerifiedBadge verified={a.is_verified} /></td>
      <td className="text-end pe-2">
        <RowActions
          actions={[
            {
              key: 'verify',
              icon: a.is_verified ? 'fas fa-check-circle' : 'fas fa-times-circle',
              variant: a.is_verified ? 'success' : 'secondary',
              title: a.is_verified ? 'Revoke Verification' : 'Verify Astrologer',
              show: can(PERMISSIONS.ASTROLOGER.VERIFY),
              onClick: () => handleVerify(a),
            },
            ...actions,
          ]}
        />
      </td>
    </tr>
  );

  return (
    <AdminCrudPage<Astrologer>
      entity="Astrologer"
      query={query}
      mutations={{
        create:  createAstrologer  as any,
        update:  updateAstrologer  as any,
        delete:  deleteAstrologer  as any,
        restore: restoreAstrologer as any,
      }}
      permissions={{
        create:  can(PERMISSIONS.ASTROLOGER.CREATE),
        update:  can(PERMISSIONS.ASTROLOGER.UPDATE),
        delete:  can(PERMISSIONS.ASTROLOGER.DELETE),
        restore: can(PERMISSIONS.ASTROLOGER.RESTORE),
      }}
      columns={
        <tr>
          <th>#</th><th>Astrologer</th><th>Expertise</th><th>Exp</th>
          <th>Price</th><th>Rating</th><th>Online</th><th>Status</th>
          <th className="text-end">Actions</th>
        </tr>
      }
      fields={FIELDS}
      initialValues={INITIAL}
      renderRow={renderRow}
      topContent={
        <div className="d-flex gap-2 mb-3">
          <TableSearch value={search} onChange={setSearch} placeholder="Search astrologer..." />
          <select className="form-select w-auto" value={verified}
            onChange={(e) => setVerified(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      }
    />
  );
}
