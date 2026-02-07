import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  /** 是否激活状态 */
  active?: boolean
  /** 图标 */
  icon?: ReactNode
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size = 'md',
      variant = 'default',
      active = false,
      icon,
      iconPosition = 'left',
      className = '',
      ...props
    },
    ref,
  ) => {
    // 尺寸样式
    const sizeStyles = {
      sm: children ? 'h-7 px-2 rounded-md text-xs gap-1' : 'w-7 h-7 rounded-md',
      md: children ? 'h-8 px-2.5 rounded-lg text-sm gap-1.5' : 'w-8 h-8 rounded-lg',
      lg: 'h-9 px-3 rounded-lg text-xs gap-1.5',
    }

    // 变体样式
    const variantStyles = {
      default: active
        ? 'bg-slate-700 text-slate-200'
        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300',
      primary: active
        ? 'bg-cyan-500/30 text-cyan-300'
        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
      danger: active
        ? 'bg-rose-500/30 text-rose-300'
        : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30',
      ghost: active
        ? 'bg-cyan-500/20 text-cyan-400'
        : 'text-slate-500 hover:text-slate-400',
    }

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0'

    const finalClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

    return (
      <button ref={ref} className={finalClassName} {...props}>
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        {children && <span className="truncate">{children}</span>}
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
