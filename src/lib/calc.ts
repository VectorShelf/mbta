import type { AttendanceStatus, DemoState, Lesson, Program } from '../data/types'

export function allLessons(p: Program): (Lesson & { courseId: string; courseTitle: string; unitTitle: string })[] {
  return (p.terms ?? []).flatMap((t) =>
    t.courses.flatMap((c) => c.units.flatMap((u) => u.lessons.map((l) => ({ ...l, courseId: c.id, courseTitle: c.title, unitTitle: u.title })))),
  )
}

/** تقدم المحتوى فقط — منفصل عن الحضور والدرجات */
export function lessonProgress(s: DemoState, learnerId: string, programId: string) {
  const p = s.programs.find((x) => x.id === programId)
  const lessons = p ? allLessons(p) : []
  const done = (s.progress[learnerId] ?? []).filter((id) => lessons.some((l) => l.id === id))
  const total = lessons.length
  return { done: done.length, total, pct: total ? Math.round((done.length / total) * 100) : 0, doneIds: done }
}

export function courseProgress(s: DemoState, learnerId: string, programId: string, courseId: string) {
  const p = s.programs.find((x) => x.id === programId)
  const lessons = p ? allLessons(p).filter((l) => l.courseId === courseId) : []
  const done = lessons.filter((l) => (s.progress[learnerId] ?? []).includes(l.id)).length
  return { done, total: lessons.length, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 }
}

/**
 * قاعدة الديمو المعلنة: نسبة الغياب = الغياب غير المعذور ÷ اللقاءات المنعقدة.
 * التأخير لا يُحتسب غيابًا، والغياب بعذر مقبول لا يدخل في النسبة.
 */
export function attendanceStats(s: DemoState, learnerId: string, sectionId: string | null) {
  const held = s.sessions.filter((x) => x.sectionId === sectionId && x.status === 'held')
  const recs = held.map((h) => s.attendance.find((a) => a.sessionId === h.id && a.learnerId === learnerId)?.status)
  const count = (st: AttendanceStatus) => recs.filter((r) => r === st).length
  const present = count('present'), late = count('late'), absent = count('absent'), excused = count('excused')
  const absencePct = held.length ? (absent / held.length) * 100 : 0
  const threshold = s.settings.absenceThreshold
  const level: 'ok' | 'warn' | 'alert' = absencePct >= threshold ? 'alert' : absencePct >= threshold * 0.6 ? 'warn' : 'ok'
  return { held: held.length, present, late, absent, excused, absencePct, level, attendedPct: held.length ? ((present + late) / held.length) * 100 : 0 }
}

export function sectionAttendanceRate(s: DemoState, sectionId: string) {
  const sec = s.sections.find((x) => x.id === sectionId)
  if (!sec) return null
  const held = s.sessions.filter((x) => x.sectionId === sectionId && x.status === 'held')
  if (!held.length) return null
  let total = 0, attended = 0
  for (const h of held) for (const lid of sec.learnerIds) {
    const r = s.attendance.find((a) => a.sessionId === h.id && a.learnerId === lid)
    if (!r) continue
    total++
    if (r.status === 'present' || r.status === 'late') attended++
  }
  return total ? (attended / total) * 100 : null
}

export const pct = (n: number, digits = 0) => `${n.toFixed(digits).replace(/\.0$/, '')}%`

export function nextSession(s: DemoState, sectionId: string | null) {
  return s.sessions
    .filter((x) => x.sectionId === sectionId && x.status === 'upcoming')
    .sort((a, b) => a.at.localeCompare(b.at))[0]
}

export function sectionOf(s: DemoState, learnerId: string) {
  const l = s.learners.find((x) => x.id === learnerId)
  return s.sections.find((x) => x.id === l?.sectionId)
}

export function csvDownload(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const t = String(v ?? '')
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  const body = '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
