export interface User {
  id: string;
  email: string;
  username: string;
  subscription_data: SubscriptionData;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionData {
  plan?: 'free' | 'premium';
  status?: 'active' | 'inactive' | 'past_due';
  current_period_end?: string;
  [key: string]: any;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  weight_unit: 'kg' | 'lbs';
  distance_unit: 'km' | 'mi';
  sound_enabled: boolean;
  rest_timer_default: number;
}

export interface UserStats {
  total_workouts: number;
  total_duration_minutes: number;
  streak_days: number;
  last_workout_date?: string;
}