export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Modulus wordmark */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-1">
            Modulus ERP
          </p>
          <p className="text-xs text-muted-foreground">Business Suite</p>
        </div>
        {children}
      </div>
    </div>
  )
}
