import { useMemo } from "react";

import { useGetDashboardStatsQuery } from "../../../store/api";

import AdminPage from "../../components/page/AdminPage";
import AdminCard from "../../components/ui/AdminCard";
import InfoBox from "../../components/ui/InfoBox";
export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  const widgets = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats?.total_users ?? 0,
        icon: "fas fa-users",
        color: "primary",
      },
      {
        title: "Astrologers",
        value: stats?.total_astrologers ?? 0,
        icon: "fas fa-user-astronaut",
        color: "success",
      },
      {
        title: "Consultations",
        value: stats?.total_consultations ?? 0,
        icon: "fas fa-comments",
        color: "warning",
      },
      {
        title: "Revenue",
        value: "₹" + (stats?.revenue ?? 0),
        icon: "fas fa-rupee-sign",
        color: "danger",
      },
    ],
    [
      stats?.total_users,
      stats?.total_astrologers,
      stats?.total_consultations,
      stats?.revenue,
    ]
  );

  return (
    <AdminPage title="Astrology Dashboard">
      <AdminCard loading={isLoading}>
        <div className="row g-3">
          {widgets.map(({ title, ...rest }) => (
            <div key={title} className="col-lg-3 col-6">
              <InfoBox title={title} {...rest} />
            </div>
          ))}
        </div>
      </AdminCard>
    </AdminPage>
  );
}