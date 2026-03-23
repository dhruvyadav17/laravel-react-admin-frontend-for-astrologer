import AdminCrudPage from "../../components/crud/AdminCrudPage";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../store/api";

export default function AstrologersPage() {
  return (
    <AdminCrudPage
      entity="Astrologer"
      queryHook={() =>
        useGetUsersQuery({ page: 1, search: "", type: "astrologer" })
      }
      createHook={useCreateUserMutation}
      updateHook={useUpdateUserMutation}
      columns={
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Experience</th>
          <th>Price</th>
          <th className="text-end">Actions</th>
        </tr>
      }
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", required: true },
        { name: "experience", label: "Experience" },
        { name: "price_per_minute", label: "Price/Min" },
        { name: "bio", label: "Bio" },
      ]}
      initialValues={{
        name: "",
        email: "",
        experience: "",
        price_per_minute: "",
        bio: "",
      }}
    />
  );
}