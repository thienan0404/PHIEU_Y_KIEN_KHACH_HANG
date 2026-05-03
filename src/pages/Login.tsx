import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Hotel } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('duc.tran@a25hotel.vn');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const success = login(email, password);

    if (!success) {
      setError('Email hoặc mật khẩu không đúng.');
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-900 flex items-center justify-center mb-3">
            <Hotel className="text-accent-400" size={28} />
          </div>

          <h1 className="text-2xl font-bold text-primary-900">
            A25 Hotel Hub
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Đăng nhập hệ thống quản lý đánh giá
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="email@a25hotel.vn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123456"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 transition"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Demo password: 123456
        </p>
      </div>
    </div>
  );
}