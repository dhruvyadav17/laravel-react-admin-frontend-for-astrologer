// Visual config for each consultation status — used in list pages and detail views.
export interface StatusConfig {
  label: string;
  color: string;
  icon:  string;
}

export const CONSULTATION_STATUS: Record<string, StatusConfig> = {
  pending:     { label: 'Pending',     color: 'warning',   icon: 'fa-clock'        },
  accepted:    { label: 'Accepted',    color: 'info',      icon: 'fa-check-circle' },
  in_progress: { label: 'In Progress', color: 'success',   icon: 'fa-circle'       },
  completed:   { label: 'Completed',   color: 'secondary', icon: 'fa-check-double' },
  rejected:    { label: 'Rejected',    color: 'danger',    icon: 'fa-times-circle' },
  cancelled:   { label: 'Cancelled',   color: 'secondary', icon: 'fa-ban'          },
};

export const getStatusConfig = (status: string): StatusConfig =>
  CONSULTATION_STATUS[status] ?? CONSULTATION_STATUS.pending;
