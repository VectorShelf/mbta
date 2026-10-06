import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X, Inbox, Info } from 'lucide-react'
import { useStore } from '../store/store'
import type { AttendanceStatus } from '../data/types'
import { asset } from '../lib/format'

export function Modal({ title, sub, onClose, children, footer, wide }: { title: string; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')
    first?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title" id={id}>{title}</h2>
            {sub && <div className="muted small" style={{ marginTop: 2 }}>{sub}</div>}
          </div>
          <button className="icon-btn" data-close onClick={onClose} aria-label="إغلاق"><X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          {t.tone === 'error' ? <AlertCircle /> : <CheckCircle2 />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" className="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count !== undefined && t.count > 0 && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Progress({ value, dark, label }: { value: number; dark?: boolean; label?: string }) {
  return (
    <div className={`progress${dark ? ' dark' : ''}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function Ring({ value, size = 120, stroke = 10, children, color = 'var(--gold-600)', track = 'var(--gold-100)' }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string; track?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }} />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  )
}

export function Empty({ title, text, icon, action }: { title: string; text?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="icon-tile">{icon ?? <Inbox />}</div>
      <div className="empty-title">{title}</div>
      {text && <div className="small">{text}</div>}
      {action}
    </div>
  )
}

export function Callout({ children, tone, icon }: { children: ReactNode; tone?: 'info' | 'warning' | 'success'; icon?: ReactNode }) {
  return <div className={`callout${tone ? ' ' + tone : ''}`}>{icon ?? <Info />}<div>{children}</div></div>
}

export function Avatar({ name, size, dark }: { name: string; size?: 'lg'; dark?: boolean }) {
  const parts = name.split(' ')
  const ini = (parts[0]?.[0] ?? '') + (parts[1] ? parts[1].replace(/^ال/, '')[0] : '')
  return <span className={`avatar${size ? ' ' + size : ''}${dark ? ' dark' : ''}`} aria-hidden="true">{ini}</span>
}

export const attLabel: Record<AttendanceStatus, string> = { present: 'حاضر', late: 'متأخر', absent: 'غائب', excused: 'بعذر' }
const attTone: Record<AttendanceStatus, string> = { present: 'success', late: 'warning', absent: 'danger', excused: 'info' }
export function AttBadge({ s }: { s?: AttendanceStatus }) {
  if (!s) return <span className="badge neutral">لم يُرصد</span>
  return <span className={`badge ${attTone[s]}`}>{attLabel[s]}</span>
}

export function Badge({ tone, children }: { tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'dark'; children: ReactNode }) {
  return <span className={`badge${tone ? ' ' + tone : ''}`}>{children}</span>
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  )
}

/** نمط تجريدي مستلهم من أعمدة الشعار وصفحات الكتاب */
export function BrandArt({ variant = 'light', className, style }: { variant?: 'light' | 'dark'; className?: string; style?: CSSProperties }) {
  const dark = variant === 'dark'
  const cols = [
    { x: 120, h: 230, c: dark ? '#664E2A' : '#E5D5B3' },
    { x: 176, h: 310, c: dark ? '#806339' : '#C7AA73' },
    { x: 232, h: 270, c: dark ? '#3E3C3F' : '#29282A' },
    { x: 288, h: 200, c: dark ? '#333234' : '#66615A' },
    { x: 344, h: 150, c: dark ? '#46351E' : '#D6BF8F' },
  ]
  return (
    <svg viewBox="0 0 480 440" className={className} style={style} aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      {!dark && <circle cx="240" cy="230" r="200" fill="#F2EAD8" opacity=".55" />}
      {cols.map((c, i) => (
        <rect key={i} x={c.x} y={340 - c.h} width="40" height={c.h} rx="3" fill={c.c} />
      ))}
      <path d="M40 350 C 140 300, 210 320, 240 372 C 270 320, 340 300, 440 350 L 440 368 C 340 322, 272 340, 240 392 C 208 340, 140 322, 40 368 Z" fill={dark ? '#B99A62' : '#664E2A'} opacity={dark ? 0.55 : 0.92} />
      <path d="M70 380 C 150 350, 210 362, 240 404 C 270 362, 330 350, 410 380" fill="none" stroke={dark ? '#806339' : '#B99A62'} strokeWidth="3" />
    </svg>
  )
}

export function Logo({ dark, height = 40 }: { dark?: boolean; height?: number }) {
  return <img src={dark ? asset('brand/logo-h-dark.png') : asset('brand/logo-h.png')} alt="معهد بوابة المستقبل العالي للتدريب" style={{ height, width: 'auto' }} />
}

export function SimTag({ children = 'محاكاة' }: { children?: ReactNode }) {
  return <span className="sim-tag"><Info />{children}</span>
}
