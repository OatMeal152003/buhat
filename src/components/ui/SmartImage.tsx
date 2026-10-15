import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  /** Show the descriptive fallback block instead of the image after an error. */
  fallbackLabel?: string;
}

/**
 * Image with a graceful, branded fallback. If the remote photo fails to load,
 * a dark textured placeholder with an icon and label is shown instead — never
 * a broken frame.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  fallbackLabel = 'BUHAT',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image unavailable)`}
        className={cn(
          'slashes grid-lines flex items-center justify-center bg-surface2 text-faint',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <Dumbbell className="size-6" aria-hidden="true" />
          <span className="eyebrow text-[0.65rem] text-faint">{fallbackLabel}</span>
          <span className="text-xs text-faint">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden bg-surface2', className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        onError={() => setFailed(true)}
        className={cn('size-full object-cover', imgClassName)}
      />
    </div>
  );
}
