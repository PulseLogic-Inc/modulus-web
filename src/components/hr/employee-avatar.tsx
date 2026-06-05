import { cn } from '@/lib/utils'

interface EmployeeAvatarProps {
  firstName:  string
  lastName:   string
  avatarUrl?: string | null
  size?:      'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

export function EmployeeAvatar({
  firstName,
  lastName,
  avatarUrl,
  size = 'md',
  className,
}: EmployeeAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground flex-shrink-0',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  )
}
