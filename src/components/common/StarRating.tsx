import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-accent-400 fill-accent-400' : 'text-gray-300'}
          onClick={interactive && onChange ? () => onChange(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : undefined}
        />
      ))}
    </div>
  );
}
