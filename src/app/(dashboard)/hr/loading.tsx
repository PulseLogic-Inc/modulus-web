export default function HRLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card shadow-sm p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2 mt-3" />
              <div className="h-3 bg-muted rounded w-2/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
