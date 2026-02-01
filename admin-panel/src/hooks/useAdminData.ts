import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  place: string | null;
  referral_code: string;
  referred_by: string | null;
  points: number;
  referral_count: number;
  created_at: string;
  last_check_in_date: string | null;
}

export interface FeatureToggle {
  id: string;
  user_id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  todayRegistrations: number;
  totalPoints: number;
  referredUsers: number;
  topReferrers: Array<{
    full_name: string;
    referral_code: string;
    referral_count: number;
    points: number;
  }>;
}

const MOCK_TOGGLES: FeatureToggle[] = [];
const MOCK_LOGS: AuditLog[] = [];

export function useProfiles(filters?: { status?: string; role?: string; search?: string }) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async () => {
      let url = `${API_BASE_URL}/admin/users`;
      const params = new URLSearchParams();

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useFeatureToggles(userId?: string) {
  return useQuery({
    queryKey: ['feature-toggles', userId],
    queryFn: async () => {
      return MOCK_TOGGLES;
    },
    enabled: !!userId || userId === undefined,
  });
}

export function useAuditLogs(filters?: { action?: string; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      return MOCK_LOGS;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
      adminId
    }: {
      userId: string;
      updates: Partial<Profile>;
      adminId: string;
    }) => {
      // Mock update
      console.log('Updating profile', userId, updates);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useUpdateFeatureToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toggleId,
      isEnabled,
      userId,
      adminId,
    }: {
      toggleId: string;
      isEnabled: boolean;
      userId: string;
      adminId: string;
    }) => {
      console.log('Updating toggle', toggleId, isEnabled);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-toggles'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch(`${API_BASE_URL}/admin/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}
