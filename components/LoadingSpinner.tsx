interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div
      className={`animate-spin rounded-full border-slate-200 border-t-slate-900 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Lädt"
    >
      <span className="sr-only">Lädt...</span>
    </div>
  )
}

