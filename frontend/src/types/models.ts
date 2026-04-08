// PATH: src/types/models.ts  MAJOR UPDATE
// CHANGES: Review, AstrologerSchedule, AstrologerFilters, ConsultationType types add kiye
//          Astrologer: is_available, consultation_type, total_consultations add kiye
//          FieldConfig: textarea + select + toggle support add kiya
// REASON: New features ke liye types missing the. `any` types remove karne ke liye.

export type ID = number;

// ── User ──────────────────────────────────────────────────────
export interface User {
  id:                ID;
  name:              string;
  email:             string;
  profile_image:     string | null;
  is_active:         boolean;
  is_verified:       boolean;
  is_online:         boolean;
  email_verified_at: string | null;
  roles:             string[];
  last_login_at:     string | null;
  created_at:        string;
  deleted_at:        string | null;
}

// ── Astrologer ────────────────────────────────────────────────
export type ConsultationType = 'chat' | 'call' | 'video' | 'all';

export interface Astrologer {
  id:                   ID;
  user_id:              ID;
  name:                 string;
  email:                string;
  profile_image:        string | null;
  experience:           number;
  price_per_minute:     number;
  bio:                  string;
  expertise:            string;
  languages:            string[];
  skills:               string[];
  consultation_type:    ConsultationType;   // NEW
  rating:               number;
  total_reviews:        number;
  total_consultations:  number;             // NEW
  is_online:            boolean;
  is_available:         boolean;            // NEW
  is_verified:          boolean;
  gallery:              string[];
  schedules?:           AstrologerSchedule[];
  created_at:           string;
  deleted_at:           string | null;
  user_is_active?:      boolean;
}

export interface AstrologerFilters {
  online?:            boolean;
  expertise?:         string;
  language?:          string;
  min_price?:         number;
  max_price?:         number;
  min_rating?:        number;
  consultation_type?: ConsultationType | 'all';
  sort?:              'top_rated' | 'price_low' | 'price_high' | 'experience' | 'newest';
  page?:              number;
}

// ── Schedule ──────────────────────────────────────────────────
export interface AstrologerSchedule {  // NEW
  id:          ID;
  day_of_week: number;
  start_time:  string;
  end_time:    string;
  is_active:   boolean;
}

// ── Review ────────────────────────────────────────────────────
export interface Review {  // NEW
  id:         ID;
  rating:     number;
  comment:    string | null;
  created_at: string;
  user: {
    id:            ID;
    name:          string;
    profile_image: string | null;
  };
}

// ── Role / Permission ─────────────────────────────────────────
export interface Role {
  id:         ID;
  name:       string;
  guard_name: string;
  deleted_at: string | null;
}

export interface Permission {
  id:   ID;
  name: string;
}

// ── Auth ──────────────────────────────────────────────────────
export interface AuthUser {
  id:            ID;
  name:          string;
  email:         string;
  profile_image: string | null;
  roles:         string[];
}

export interface AuthState {
  user:        AuthUser | null;
  token:       string | null;
  permissions: string[];
  loading:     boolean;
}

// ── API Responses ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:     boolean;
  message:     string;
  data?:       T;
  errors?:     Record<string, string[]>;
  pagination?: Pagination;
}

export interface Pagination {
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
  from:         number | null;
  to:           number | null;
}

export interface PaginatedResponse<T> {
  data:       T[];
  pagination: Pagination;
}

// ── Form ──────────────────────────────────────────────────────
// UPDATE: textarea, select, toggle type add kiye
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'toggle';

export interface FieldConfig<T = Record<string, unknown>> {
  name:         keyof T;
  label:        string;
  type?:        FieldType;
  required?:    boolean;
  placeholder?: string;
  disabled?:    boolean;
  options?:     { label: string; value: string | number }[];
  min?:         number;
  max?:         number;
  rows?:        number;
}

// ── Sidebar ───────────────────────────────────────────────────
export interface SidebarItem {
  label:       string;
  path?:       string;
  icon?:       string;
  action?:     'logout';
  permission?: string;
}

export interface SidebarGroup {
  label:    string;
  icon:     string;
  children: SidebarItem[];
}