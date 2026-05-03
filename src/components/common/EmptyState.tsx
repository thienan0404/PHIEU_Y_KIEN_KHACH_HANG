import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = 'Không có dữ liệu', description = 'Chưa có dữ liệu để hiển thị.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Inbox size={48} className="mb-3" />
      <p className="text-lg font-medium text-gray-500">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
