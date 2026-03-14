export const INTERVALS = [
  { value: "5min", label: "5 min" },
  { value: "15min", label: "15 min" },
  { value: "30min", label: "30 min" },
  { value: "hourly", label: "1 hour" },
  { value: "3hour", label: "3 hours" },
  { value: "6hour", label: "6 hours" },
  { value: "12hour", label: "12 hours" },
  { value: "daily", label: "Daily" },
  { value: "2day", label: "2 days" },
  { value: "weekly", label: "Weekly" },
  { value: "2week", label: "2 weeks" },
  { value: "monthly", label: "Monthly" },
] as const;

export const SENSITIVITY_PRESETS = [
  { value: 0, label: "Any", description: "Any change at all" },
  { value: 1, label: "Tiny", description: "1% pixel diff" },
  { value: 10, label: "Medium", description: "10% pixel diff" },
  { value: 25, label: "Major", description: "25% pixel diff" },
  { value: 50, label: "Gigantic", description: "50% pixel diff" },
] as const;

export const COMPARE_TYPES = [
  { value: "all", label: "All", description: "Visual + Text" },
  { value: "visual", label: "Visual", description: "Screenshots only" },
  { value: "text", label: "Text", description: "Text content only" },
] as const;

export const KEYWORD_MODES = [
  { value: "any", label: "Added or Removed" },
  { value: "added", label: "Added Only" },
  { value: "deleted", label: "Removed Only" },
] as const;

export const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

export const DELAY_OPTIONS = [
  { value: 0, label: "0s" },
  { value: 2, label: "2s" },
  { value: 3, label: "3s" },
  { value: 5, label: "5s" },
  { value: 7, label: "7s" },
] as const;
