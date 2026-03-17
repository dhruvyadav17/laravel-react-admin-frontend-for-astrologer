// src/types/sidebar.ts

export type SidebarItem = {
  label: string;
  path?: string;
  permission?: string;
  action?: "logout";
};

export type SidebarGroup = {
  label: string;
  icon: string;
  showInMenu?: boolean;
  children: SidebarItem[];
};
