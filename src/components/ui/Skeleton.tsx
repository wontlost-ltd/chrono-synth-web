interface SkeletonProps {
  variant?: 'card' | 'chart' | 'table';
  className?: string;
}

export function Skeleton({ variant = 'card', className = '' }: SkeletonProps) {
  const heights: Record<string, string> = {
    card: 'h-24',
    chart: 'h-64',
    table: 'h-40',
  };

  return (
    <div
      className={`animate-pulse rounded-xl bg-border/50 ${heights[variant]} ${className}`}
      role="status"
      aria-label="加载中"
    >
      <span className="sr-only">加载中...</span>
    </div>
  );
}
