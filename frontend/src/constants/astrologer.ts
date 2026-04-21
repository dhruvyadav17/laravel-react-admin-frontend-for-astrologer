// NEW FILE -- Shared constants (duplicate arrays hata diye)
// SOLUTION: Ek jagah define do, sab import karein

export const EXPERTISE_OPTIONS = [
  "Vedic Astrology",
  "KP Astrology",
  "Numerology",
  "Tarot Reading",
  "Vastu Shastra",
  "Palmistry",
  "Lal Kitab",
  "Nadi Astrology",
] as const;

export const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Kannada",
] as const;

export const SKILL_OPTIONS = [
  "Kundli",
  "Match Making",
  "Career",
  "Finance",
  "Health",
  "Love",
  "Marriage",
  "Education",
  "Business",
] as const;

export const SORT_OPTIONS = [
  { value: "top_rated",  label: "⭐ Top Rated"          },
  { value: "price_low",  label: "₹ Price: Low to High"  },
  { value: "price_high", label: "₹ Price: High to Low"  },
  { value: "experience", label: "🏆 Most Experienced"   },
  { value: "newest",     label: "🆕 Newest First"       },
] as const;

export const CONSULTATION_TYPE_OPTIONS = [
  { label: "All -- Chat, Call & Video", value: "all"   },
  { label: "Chat Only",                value: "chat"  },
  { label: "Call Only",                value: "call"  },
  { label: "Video Only",               value: "video" },
] as const;

export const CONSULTATION_LABELS: Record<string, string> = {
  chat:  "Chat",
  call:  "Call",
  video: "Video",
  all:   "Chat, Call & Video",
};

// Day names for schedule (0 = Sunday)
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
