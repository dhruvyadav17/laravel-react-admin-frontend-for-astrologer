// PATH: src/types/models.ts
// FIX: Consultation + ChatMessage types yahan consolidated
//   Was duplicated in consultation.api.ts → drift risk
// FIX: ConsultationStatus type add kiya
// FIX: Strict readonly for options arrays

export type ID = number;

export type ConsultationStatus =
  | 'pending' | 'accepted' | 'in_progress'
  | 'completed' | 'rejected' | 'cancelled';

export type ConsultationType = 'chat' | 'call' | 'video' | 'all';

/* ── User ──────────────────────────────────── */
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

/* ── Astrologer ────────────────────────────── */
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
  consultation_type:    ConsultationType;
  rating:               number;
  total_reviews:        number;
  total_consultations:  number;
  is_online:            boolean;
  is_available:         boolean;
  is_verified:          boolean;
  gallery:              string[];
  schedules?:           AstrologerSchedule[];
  created_at:           string;
  deleted_at:           string | null;
  user_is_active?:      boolean;
}

export interface AstrologerFilters {
  search?:            string;
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

/* ── Schedule ──────────────────────────────── */
export interface AstrologerSchedule {
  id:          ID;
  day_of_week: number;
  start_time:  string;
  end_time:    string;
  is_active:   boolean;
}

/* ── Review ────────────────────────────────── */
export interface Review {
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

/* ── Consultation (single source of truth) ── */
export interface Consultation {
  id:                ID;
  type:              Exclude<ConsultationType, 'all'>;
  status:            ConsultationStatus;
  user_note?:        string;
  rejection_reason?: string;
  rate_per_minute:   number;
  total_amount?:     number;
  duration_minutes?: number;
  started_at?:       string;
  ended_at?:         string;
  created_at:        string;
  user?:             Pick<User, 'id' | 'name' | 'profile_image'>;
  astrologer?:       Pick<Astrologer, 'id' | 'name' | 'profile_image' | 'expertise' | 'price_per_minute'>;
}

/* ── Chat Message ──────────────────────────── */
export interface ChatMessage {
  id:         ID;
  message:    string;
  is_read:    boolean;
  read_at?:   string | null;
  created_at: string;
  sender:     Pick<User, 'id' | 'name' | 'profile_image'>;
}

/* ── Role / Permission ─────────────────────── */
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

/* ── API Responses ─────────────────────────── */
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
  pagination: Pagination | null;
}

/* ── Form ──────────────────────────────────── */
export type FieldType =
  | 'text' | 'email' | 'password' | 'number'
  | 'textarea' | 'select' | 'toggle';

export interface FieldConfig<T = Record<string, unknown>> {
  name:         keyof T;
  label:        string;
  type?:        FieldType;
  required?:    boolean;
  placeholder?: string;
  disabled?:    boolean;
  options?:     ReadonlyArray<{ label: string; value: string | number }>;
  min?:         number;
  max?:         number;
  rows?:        number;
}

/* ── Sidebar ───────────────────────────────── */
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
