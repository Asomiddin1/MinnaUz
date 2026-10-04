'use client';

import { useLang } from '@/lib/i18n';
import { messages, type KitsuneMessageKey } from '@/lib/kitsune/messages';
import { cn } from '@/lib/utils';
import { KitsuneMascot, type KitsuneMascotProps } from './kitsune-mascot';

interface KitsuneMessageProps extends KitsuneMascotProps {
  messageKey: KitsuneMessageKey;
  announce?: boolean;
  showLevel?: boolean;
}

export function KitsuneMessage({
  messageKey, level, className, announce = false, showLevel = false,
  size = 'medium', ...mascotProps
}: KitsuneMessageProps) {
  const { t } = useLang();
  const message = messages[messageKey];
  const advanced = level === 'N3' || level === 'N2' || level === 'N1';

  return (
    <div className={cn('flex min-w-0 items-center gap-3 sm:gap-5', className)}>
      <KitsuneMascot {...mascotProps} level={level} size={size} />
      <div className="min-w-0 rounded-2xl border border-border bg-card px-4 py-3 text-foreground">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Kitsune</p>
        <div aria-live={announce ? 'polite' : 'off'} aria-atomic="true">
          {message.kana && (
            <p lang="ja" className="break-words text-sm leading-8 sm:text-base">
              {level === 'N4' ? message.ruby.map(([text, reading], index) => reading ? (
                <ruby key={index}>{text}<rp>(</rp><rt>{reading}</rt><rp>)</rp></ruby>
              ) : <span key={index}>{text}</span>) : advanced ? message.kanji : message.kana}
            </p>
          )}
          <p className="break-words text-xs leading-relaxed text-muted-foreground sm:text-sm">{t.kitsune.messages[messageKey]}</p>
        </div>
        {showLevel && level && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(level) && (
          <p className="mt-2 text-xs font-medium text-primary">{t.kitsune.preparationLevel.replace('{level}', level)}</p>
        )}
      </div>
    </div>
  );
}
