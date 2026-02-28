import { create } from 'zustand';
import { User, SubscriptionData, UserPreferences, UserStats } from '@/types/user.types';

interface UserStore {
  user: User | null;
  subscription: SubscriptionData | null;
  preferences: UserPreferences;
  stats: UserStats;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSubscription: (subscription: SubscriptionData | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  weight_unit: 'kg',
  distance_unit: 'km',
  sound_enabled: true,
  rest_timer_default: 60,
};

const defaultStats: UserStats = {
  total_workouts: 0,
  total_duration_minutes: 0,
  streak_days: 0,
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  subscription: null,
  preferences: defaultPreferences,
  stats: defaultStats,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  
  updatePreferences: (newPreferences) => set((state) => ({
    preferences: { ...state.preferences, ...newPreferences }
  })),
  
  updateStats: (newStats) => set((state) => ({
    stats: { ...state.stats, ...newStats }
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: () => set({ 
    user: null, 
    subscription: null, 
    preferences: defaultPreferences, 
    stats: defaultStats 
  }),
}));