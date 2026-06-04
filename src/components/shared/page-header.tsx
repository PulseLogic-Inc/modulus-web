import { cn } from '@/lib/utils'

interface PageHeaderProps {
  label?: string
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function PageHeader({ label, title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn('max-w-3xl mb-12', className)}>
      {label && (
        <p className="text-sm font-semibold tracking-wider uppercase text-primary mb-2">
          {label}
        </p>
      )}
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
}
