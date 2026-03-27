import { useState } from "react";
import UserPage from "../components/ui/UserPage";

export default function PanchangPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  return (
    <UserPage title="📅 Panchang">

      <div className="text-center mb-4">
        <input
          type="date"
          className="form-control w-auto mx-auto shadow-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="app-card text-center">
        <h5>Today Panchang</h5>
        <p className="text-muted">Coming from API soon...</p>
      </div>

    </UserPage>
  );
}