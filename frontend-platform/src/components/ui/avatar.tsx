import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br transition-all duration-300',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      variant: {
        default: 'from-blue-500 to-indigo-600',
        success: 'from-emerald-500 to-teal-600',
        warning: 'from-amber-500 to-orange-600',
        danger: 'from-red-500 to-pink-600',
        purple: 'from-purple-500 to-violet-600',
      },
      ring: {
        true: 'ring-4 ring-white ring-offset-2',
        false: '',
      },
      hoverable: {
        true: 'cursor-pointer hover:scale-110 hover:shadow-xl',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      ring: false,
      hoverable: false,
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

function Avatar({
  className,
  size,
  variant,
  ring,
  hoverable,
  src,
  alt,
  fallback,
  children,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(avatarVariants({ size, variant, ring, hoverable }), className)}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-white">
          {fallback || children || '؟'}
        </span>
      )}
    </div>
  );
}

export { Avatar, avatarVariants };
