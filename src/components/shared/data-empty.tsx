import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/lib/utils'

interface DataEmptyProps {
  icon:        IconDefinition
  title:       string
  description?: string
  action?:     React.ReactNode
  className?:  string
}

export function DataEmpty({ icon, title, description, action, className }: DataEmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={icon} className="text-muted-foreground fa-lg" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
