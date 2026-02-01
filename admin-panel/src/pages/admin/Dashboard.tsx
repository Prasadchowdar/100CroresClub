import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { useDashboardStats, useProfiles } from '@/hooks/useAdminData';
import {
  Users,
  UserPlus,
  Coins,
  UserCheck,
  Trophy
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentUsers } = useProfiles({});

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your real estate platform"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              variant="primary"
              href="/admin/users"
              description="All registered users"
            />
            <StatsCard
              title="Today's Registrations"
              value={stats?.todayRegistrations ?? 0}
              icon={UserPlus}
              href="/admin/users"
              description="New users today"
            />
            <StatsCard
              title="Total Points"
              value={stats?.totalPoints?.toLocaleString() ?? 0}
              icon={Coins}
              variant="accent"
              description="Points in system"
            />
            <StatsCard
              title="Referred Users"
              value={stats?.referredUsers ?? 0}
              icon={UserCheck}
              description="Users with referral"
            />
          </>
        )}
      </div>

      {/* Top Referrers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Referrers</h2>
            <Trophy className="h-5 w-5 text-warning" />
          </div>

          <div className="space-y-3">
            {stats?.topReferrers?.map((referrer, index) => (
              <div
                key={referrer.referral_code}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{referrer.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{referrer.referral_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{referrer.referral_count} referrals</p>
                  <p className="text-xs text-muted-foreground">{referrer.points.toLocaleString()} pts</p>
                </div>
              </div>
            ))}

            {(!stats?.topReferrers || stats.topReferrers.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No referrals yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {recentUsers?.slice(0, 5).map((user: any) => (
              <div
                key={user.id}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.phone_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.points?.toLocaleString()} pts</p>
                  <p className="text-xs text-muted-foreground">{user.referral_count} refs</p>
                </div>
              </div>
            ))}

            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users yet
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
