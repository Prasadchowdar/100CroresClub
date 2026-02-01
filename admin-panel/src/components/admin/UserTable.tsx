import { useState } from 'react';
import {
  Search,
  Download,
  Coins,
  Users
} from 'lucide-react';
import { Profile } from '@/hooks/useAdminData';
import { API_BASE_URL } from '@/config/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserTableProps {
  users: Profile[];
  onFilterChange: (filters: { status?: string; role?: string; search?: string }) => void;
  filters: { status?: string; role?: string; search?: string };
}

export function UserTable({ users, onFilterChange, filters }: UserTableProps) {
  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/export`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export downloaded successfully');
    } catch (error) {
      toast.error('Failed to download export');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or phone..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Place</th>
                <th className="text-left p-4 font-medium">Referral Code</th>
                <th className="text-left p-4 font-medium">Points</th>
                <th className="text-left p-4 font-medium">Referrals</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {user.place || '-'}
                    </td>
                    <td className="p-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {user.referral_code}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-warning" />
                        <span className="font-medium">{user.points?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{user.referral_count || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
