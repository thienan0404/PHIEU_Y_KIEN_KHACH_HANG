import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';
import { users } from '@/data/users';
import { roleLabel } from '@/lib/utils';
import Badge from '@/components/common/Badge';

export default function SettingsPage() {
  const { currentUser } = useAuthStore();
  const { getBranch } = useBranchStore();

  if (currentUser.role !== 'admin') {
    return (
      <div className="text-center py-20 text-gray-500">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Cài đặt</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Chi nhánh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-primary-100 text-primary-800">{roleLabel(u.role)}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {u.branch_id ? getBranch(u.branch_id)?.name ?? '-' : 'Tất cả'}
                </td>
                <td className="px-4 py-3">
                  <Badge className={u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                    {u.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
