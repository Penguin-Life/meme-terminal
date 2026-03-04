export function SkeletonLine({ width = '100%', height = '16px', className = '' }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ width, height, background: 'rgba(255,255,255,0.06)' }}
    />
  )
}

export function TokenCardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: '#12131a', borderColor: '#1e2030' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex-shrink-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="14px" />
          <SkeletonLine width="40%" height="11px" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SkeletonLine height="12px" />
        <SkeletonLine height="12px" />
        <SkeletonLine height="12px" />
        <SkeletonLine height="12px" />
      </div>
    </div>
  )
}

export function WalletCardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: '#12131a', borderColor: '#1e2030' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="50%" height="14px" />
          <SkeletonLine width="70%" height="11px" />
        </div>
      </div>
      <SkeletonLine height="12px" />
    </div>
  )
}

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TokenCardSkeleton key={i} />
      ))}
    </div>
  )
}
