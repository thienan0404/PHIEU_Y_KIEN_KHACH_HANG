import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';
import { users } from '@/data/users';
import { roleLabel } from '@/lib/utils';
import { UserCircle, LogOut } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();

  const { currentUser, switchUser, logout } = useAuthStore();
  const { branches, selectedBranchId, setSelectedBranch } = useBranchStore();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
  <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 sticky top-0 z-10">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:w-auto">
        <select
          value={selectedBranchId ?? ''}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="w-full md:w-auto text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tất cả chi nhánh</option>

          {branches
            .filter((b) => b.isActive !== false)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-accent-50 px-3 py-2 rounded-lg border border-accent-200 w-full md:w-auto">
          <span className="text-xs text-accent-700 font-medium shrink-0">
            Demo:
          </span>

          <select
            value={currentUser.id}
            onChange={(e) => switchUser(e.target.value)}
            className="w-full md:w-auto text-sm bg-transparent border-none focus:outline-none text-accent-800 font-medium cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({roleLabel(u.role)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2">
            <UserCircle size={28} className="text-primary-600 shrink-0" />

            <div className="text-left md:text-right">
              <p className="text-sm font-medium text-gray-800">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500">
                {roleLabel(currentUser.role)}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition shrink-0"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
);
}