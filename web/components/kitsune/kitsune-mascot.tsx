'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { getKitsuneAsset, poses, type KitsuneState, type KitsuneVariant } from '@/lib/kitsune/assets';
import { cn } from '@/lib/utils';
import styles from './kitsune.module.css';

export interface KitsuneMascotProps {
  state?: KitsuneState;
  variant?: KitsuneVariant;
  level?: string | null;
  size?: 'small' | 'medium' | 'hero';
  animate?: boolean;
  decorative?: boolean;
  className?: string;
}

export function KitsuneMascot({
  state = 'welcome', variant = 'pose', level, size = 'medium',
  animate = false, decorative = true, className,
}: KitsuneMascotProps) {
  const { t } = useLang();
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const asset = getKitsuneAsset(state, variant, level);
  const source = size === 'hero' && asset === poses.welcome
    ? '/kitsune/poses/P01_salom-hero.webp' : asset;
  const src = failedSources.includes(source) ? poses.welcome : source;
  const unavailable = failedSources.includes(src);
  const dimensions = size === 'hero' ? 'w-36 sm:w-72' : size === 'small' ? 'w-16 sm:w-20' : 'w-20 sm:w-32';

  return (
    <div
      aria-hidden={decorative || undefined}
      className={cn('relative aspect-square shrink-0', dimensions, className)}
      data-kitsune-state={state}
    >
      {unavailable ? (
        <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
          {decorative ? '' : t.kitsune.alt}
        </span>
      ) : (
        <Image
          key={src}
          src={src}
          alt={decorative ? '' : t.kitsune.alt}
          width={size === 'hero' ? 768 : 512}
          height={size === 'hero' ? 768 : 512}
          sizes={size === 'hero' ? '(min-width: 640px) 288px, 144px' : size === 'small' ? '(min-width: 640px) 80px, 64px' : '(min-width: 640px) 128px, 80px'}
          loading={size === 'hero' ? 'eager' : 'lazy'}
          className={cn('h-full w-full object-contain', animate && state !== 'testing' && (state === 'celebrating' ? styles.celebrate : styles.idle))}
          onError={() => setFailedSources((previous) => previous.includes(src) ? previous : [...previous, src])}
        />
      )}
    </div>
  );
}
