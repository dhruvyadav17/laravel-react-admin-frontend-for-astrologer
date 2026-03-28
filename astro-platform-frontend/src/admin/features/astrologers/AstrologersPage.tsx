import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";

import {
  useGetAdminAstrologersQuery,
  useCreateAstrologerMutation,
  useUpdateAstrologerMutation,
  useDeleteAstrologerMutation,
} from "../../../store/api/astrologer.api";

export default function AstrologersPage() {

  /* ================= QUERY ================= */
  const query = useGetAdminAstrologersQuery();

  /* ================= MUTATIONS ================= */
  const createMutation = useCreateAstrologerMutation();
  const updateMutation = useUpdateAstrologerMutation();
  const deleteMutation = useDeleteAstrologerMutation();

  return (
    <AdminCrudPage
      entity="Astrologer"
      query={query}
      mutations={{
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
      }}

      /* ================= TABLE ================= */
      columns={
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Experience</th>
          <th>Price</th>
          <th>Rating</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
        </tr>
      }

      /* ================= FORM ================= */
      initialValues={{
        experience: "",
        price_per_minute: "",
        bio: "",
      }}

      fields={[
        { name: "experience", label: "Experience", required: true },
        { name: "price_per_minute", label: "Price/Min", required: true },
        { name: "bio", label: "Bio" },
      ]}

      /* ================= ROW ================= */
      renderRow={(item: any, actions) => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.experience}</td>
          <td>₹{item.price_per_minute}</td>
          <td>{item.rating}</td>
          <td>
            {item.is_online ? "🟢 Online" : "🔴 Offline"}
          </td>
          <td className="text-end">
            <RowActions actions={actions} />
          </td>
        </tr>
      )}
    />
  );
}