import { useMemo } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";
import { useGetDashboardStatsQuery } from "../../../store/api";

import AdminPage from "../../components/page/AdminPage";
import AdminCard from "../../components/ui/AdminCard";
import InfoBox from "../../components/ui/InfoBox";

import { ICONS } from "../../../constants/ui";

export default function DashboardPage() {
  const { user, permissions } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  const widgets = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats?.total_users ?? 0,
        icon: ICONS.USER,
        color: "primary",
      },
      {
        title: "Permissions",
        value: permissions.length,
        icon: ICONS.PERMISSION,
        color: "success",
      },
      {
        title: "Roles",
        value: user?.roles?.length ?? 0,
        icon: ICONS.ROLE,
        color: "warning",
      },
    ],
    [
      stats?.total_users,
      permissions.length,
      user?.roles?.length,
    ]
  );

  return (
    <AdminPage title="Admin Dashboard">
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
