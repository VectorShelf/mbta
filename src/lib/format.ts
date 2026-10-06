const base = { calendar: 'gregory', numberingSystem: 'latn' } as const

const dFmt = new Intl.DateTimeFormat('ar-SA', { ...base, day: 'numeric', month: 'long', timeZone: 'Asia/Riyadh' })
const dyFmt = new Intl.DateTimeFormat('ar-SA', { ...base, day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' })
const wdFmt = new Intl.DateTimeFormat('ar-SA', { ...base, weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Riyadh' })
const tFmt = new Intl.DateTimeFormat('ar-SA', { ...base, hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Riyadh' })

export const fDate = (iso: string) => dFmt.format(new Date(iso))
export const fDateY = (iso: string) => dyFmt.format(new Date(iso))
export const fDay = (iso: string) => wdFmt.format(new Date(iso))
export const fTime = (iso: string) => tFmt.format(new Date(iso))
export const fDateTime = (iso: string) => `${fDate(iso)} — ${fTime(iso)}`

function dayDiff(iso: string) {
  const a = new Date(iso); const b = new Date()
  a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0)
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}
export function relDay(iso: string) {
  const d = dayDiff(iso)
  if (d === 0) return 'اليوم'
  if (d === 1) return 'غدًا'
  if (d === -1) return 'أمس'
  if (d === 2) return 'بعد يومين'
  if (d === -2) return 'قبل يومين'
  if (d > 2 && d <= 10) return `بعد ${d} أيام`
  if (d < -2 && d >= -10) return `قبل ${-d} أيام`
  return fDate(iso)
}
export const isPast = (iso: string) => new Date(iso).getTime() < Date.now()

export const sar = (n: number) => `${n.toLocaleString('en-US')} ر.س`
export const fSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} م.ب` : `${Math.max(1, Math.round(b / 1024))} ك.ب`)
export const initials = (name: string) => {
  const p = name.replace(/^ال/, '').split(' ')
  return (p[0]?.[0] ?? '') + (p[1]?.replace(/^ال/, '')[0] ?? '')
}

export const typeLabel: Record<string, string> = { diploma: 'دبلوم', live: 'دورة مباشرة', recorded: 'دورة مسجلة', short: 'برنامج قصير' }

/** عزل الرموز اللاتينية (مثل PM-01) داخل النص العربي حتى لا ينقلب ترتيبها */
export const iso = (s?: string | null) => (s ? `⁦${s}⁩` : '')
/** تمييز العدد: 3–10 درجات، وما عداها درجة */
export const deg = (n: number) => `${n} ${n >= 3 && n <= 10 ? 'درجات' : 'درجة'}`
