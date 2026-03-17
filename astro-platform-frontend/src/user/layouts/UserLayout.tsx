import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="container-fluid mt-3">
      <Outlet />
    </div>
  );
}
