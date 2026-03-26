import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../store/api";

export default function AstrologersPage() {
  /* ================= QUERY ================= */

  const query = useGetUsersQuery({
    page: 1,
    search: "",
    type: "astrologer",
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  return (
    <AdminCrudPage
      entity="Astrologer"
      query={query}
      mutations={{
        create: createMutation,
        update: updateMutation,
      }}
      columns={
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Experience</th>
          <th>Price</th>
          <th className="text-end">Actions</th>
        </tr>
      }
      initialValues={{
        name: "",
        email: "",
        experience: "",
        price_per_minute: "",
        bio: "",
      }}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", required: true },
        { name: "experience", label: "Experience" },
        { name: "price_per_minute", label: "Price/Min" },
        { name: "bio", label: "Bio" },
      ]}
      renderRow={(item: any, actions) => (
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.experience}</td>
          <td>{item.price_per_minute}</td>
          <td className="text-end">
            <RowActions actions={actions} />
          </td>
        </tr>
      )}
    />
  );
}