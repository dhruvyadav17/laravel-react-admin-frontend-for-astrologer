import AdminCrudPage from "../../components/crud/AdminCrudPage";
import RowActions from "../../../components/table/RowActions";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../store/api";

export default function AstrologersPage() {
  return (
    <AdminCrudPage
      entity="Astrologer"
      api={{
        list: () =>
          useGetUsersQuery({
            page: 1,
            search: "",
            type: "astrologer",
          }),
        create: useCreateUserMutation,
        update: useUpdateUserMutation,
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
      renderRow={(item, actions) => (
        <tr key={item.id}>
          <td>{(item as any).name}</td>
          <td>{(item as any).email}</td>
          <td>{(item as any).experience}</td>
          <td>{(item as any).price_per_minute}</td>
          <td className="text-end">
            <RowActions actions={actions} />
          </td>
        </tr>
      )}
    />
  );
}