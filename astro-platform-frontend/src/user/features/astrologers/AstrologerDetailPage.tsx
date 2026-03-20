import { useParams } from "react-router-dom";
import { useGetAstrologersQuery } from "../../../store/api/user.api";

export default function AstrologerDetailPage() {
  const { id } = useParams();

  const { data } = useGetAstrologersQuery();

  const astrologer = data?.find(
    (a: any) => a.id === Number(id)
  );

  if (!astrologer) return <p>Loading...</p>;

  return (
    <div>
      <h3>{astrologer.name}</h3>
      <p>{astrologer.email}</p>

      <hr />

      <p>Experience: {astrologer.experience ?? "-"}</p>
      <p>Price: ₹{astrologer.price_per_minute ?? "-"}</p>
      <p>Bio: {astrologer.bio ?? "-"}</p>
    </div>
  );
}