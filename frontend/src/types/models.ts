// Central type definitions — mirror Laravel API Resources exactly.
// Add new types here when adding new backend models.

export type ID = number;

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ConsultationStatus =
  | 'pending' | 'accepted' | 'in_progress'
  | 'completed' | 'rejected' | 'cancelled';

export type ConsultationType = 'chat' | 'call' | 'video' | 'all';

export type CallStatus = 'idle' | 'ringing' | 'active' | 'ended';

// ─── Core models ──────────────────────────────────────────────────────────────

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

export interface Astrologer {
  id:                  ID;
  user_id:             ID;
  name:                string;
  email:               string;
  profile_image:       string | null;
  experience:          number;
  price_per_minute:    number;
  bio:                 string;
  expertise:           string;
  languages:           string[];
  skills:              string[];
  consultation_type:   ConsultationType;
  rating:              number;
  total_reviews:       number;
  total_consultations: number;
  is_online:           boolean;
  is_available:        boolean;
  is_verified:         boolean;
  gallery:             string[];
  schedules?:          AstrologerSchedule[];
  created_at:          string;
  deleted_at:          string | null;
  user_is_active?:     boolean; // admin-only field
}

export interface AstrologerSchedule {
  id:          ID;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time:  string; // "HH:MM"
  end_time:    string;
  is_active:   boolean;
}

export interface Review {
  id:         ID;
  rating:     number;
  comment:    string | null;
  created_at: string;
  user:       Pick<User, 'id' | 'name' | 'profile_image'>;
}

export interface Consultation {
  id:                ID;
  type:              Exclude<ConsultationType, 'all'>;
  status:            ConsultationStatus;
  user_note?:        string;
  rejection_reason?: string;
  rate_per_minute:   number; // frozen at booking — not the live astrologer price
  total_amount?:     number;
  duration_minutes?: number;
  started_at?:       string;
  ended_at?:         string;
  room_id?:          string | null;
  call_status?:      CallStatus | null;
  created_at:        string;
  user?:             Pick<User, 'id' | 'name' | 'profile_image'>;
  astrologer?:       Pick<Astrologer, 'id' | 'name' | 'profile_image' | 'expertise'>;
}

export interface ChatMessage {
  id:         ID;
  message:    string;
  is_read:    boolean;
  read_at?:   string | null;
  created_at: string;
  sender:     Pick<User, 'id' | 'name' | 'profile_image'>;
}

export interface ConsultationRecording {
  id:               ID;
  type:             'audio' | 'video';
  duration_seconds: number;
  size_bytes:       number;
  url:              string;
  created_at:       string;
}

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

// ─── Filter params ────────────────────────────────────────────────────────────

export interface AstrologerFilters {
  search?:            string;
  online?:            boolean;
  expertise?:         string;
  language?:          string;
  min_price?:         number;
  max_price?:         number;
  min_rating?:        number;
  consultation_type?: ConsultationType;
  sort?:              'top_rated' | 'price_low' | 'price_high' | 'experience' | 'newest';
  page?:              number;
}

// ─── API response wrappers ────────────────────────────────────────────────────

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

// ─── Shared form types (admin CRUD pages) ─────────────────────────────────────

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

// ─── Sidebar config (driven by backend /admin/sidebar) ────────────────────────

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
