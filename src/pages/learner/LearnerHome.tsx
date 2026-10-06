import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle, CalendarClock, Video, Megaphone, ClipboardList, ArrowLeft, Upload, CheckCircle2, UserCheck } from 'lucide-react'
import { useStore } from '../../store/store'
import { BrandArt, Ring, Progress, Empty, Badge } from '../../components/ui'
import { LiveRoom, SubmitModal, SubmissionStatus } from '../../components/shared'
import { allLessons, attendanceStats, courseProgress, lessonProgress, nextSession, pct } from '../../lib/calc'
import { fDay, fTime, relDay, fDate, iso, deg } from '../../lib/format'
import { MAIN_LEARNER, MAIN_PROGRAM } from '../../data/seed'
import type { Assignment, Session } from '../../data/types'

export default function LearnerHome() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const section = state.sections.find((s) => s.id === me.sectionId)!
  const program = state.programs.find((p) => p.id === MAIN_PROGRAM)!
  const prog = lessonProgress(state, me.id, program.id)
  const currentTerm = program.terms!.find((t) => t.courses.some((c) => c.id === section.courseId))!
  const termCourseIds = currentTerm.courses.map((c) => c.id)
  const next = allLessons(program).find((l) => termCourseIds.includes(l.courseId) && !prog.doneIds.includes(l.id))
  const currentCourse = currentTerm.courses.find((c) => c.id === section.courseId)!
  const cp = courseProgress(state, me.id, program.id, currentCourse.id)
  const session = nextSession(state, section.id)
  const att = attendanceStats(state, me.id, section.id)
  const assignments = state.assignments.filter((a) => a.sectionId === section.id).sort((a, b) => a.due.localeCompare(b.due))
  const openAssignments = assignments.filter((a) => {
    const sub = state.submissions.find((s) => s.assignmentId === a.id && s.learnerId === me.id)
    return !sub?.published || new Date(a.due).getTime() > Date.now() - 86400000 * 3
  }).slice(0, 3)
  const announcement = state.announcements.filter((n) => n.sectionId === section.id || n.sectionId === null).sort((a, b) => b.at.localeCompare(a.at))[0]
  const [live, setLive] = useState<Session | null>(null)
  const [submit, setSubmit] = useState<Assignment | null>(null)
  const firstName = me.name.split(' ')[0]

  return (
    <div className="stack lg">
      <div className="welcome">
        <BrandArt className="art" />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div className="muted small">{program.title} · شعبة {iso(section.code)}</div>
          <h1 style={{ marginTop: 6 }}>مرحبًا {firstName}، لنكمل من حيث توقفت</h1>
          {next ? (
            <>
              <p className="muted" style={{ marginTop: 8 }}>الدرس التالي: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{next.title}</span> — {next.courseTitle}</p>
              <Link to={`/learner/lesson/${next.id}`} className="btn btn-primary btn-lg btn-arrow" style={{ marginTop: 22 }}>أكمل الدرس<ArrowLeft /></Link>
            </>
          ) : (
            <p className="muted" style={{ marginTop: 8 }}>أكملت جميع دروس {currentTerm.title}. تُتاح دروس الفصل التالي بعد اعتماد التقييمات.</p>
          )}
        </div>
      </div>

      <div className="main-aside">
        <div className="stack lg">
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">أكمل تعلمك</h2>
              <Link to={`/learner/program/${program.id}`} className="btn btn-ghost btn-sm">عرض البرنامج<ArrowLeft /></Link>
            </div>
            <div className="row top wrap" style={{ gap: 24 }}>
              <Ring value={prog.pct} size={116}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{prog.pct}%</div>
                <div className="xs muted">{prog.done} من {prog.total} درسًا</div>
              </Ring>
              <div className="grow stack sm" style={{ minWidth: 220 }}>
                <div className="eyebrow">المقرر الحالي · {currentCourse.code}</div>
                <div className="bold" style={{ fontSize: 17 }}>{currentCourse.title}</div>
                <Progress value={cp.pct} label="تقدم المقرر" />
                <div className="small muted">{cp.done} من {cp.total} دروس في المقرر · تقدم المحتوى منفصل عن الحضور والدرجات</div>
                {next && (
                  <Link to={`/learner/lesson/${next.id}`} className="list-item" style={{ marginTop: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div className="icon-tile"><PlayCircle /></div>
                    <div className="grow"><div className="bold small">{next.title}</div><div className="xs muted">{next.unitTitle} · {next.minutes} دقيقة</div></div>
                    <ArrowLeft size={18} color="var(--gold-800)" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2 className="card-title">الواجبات</h2>
              <Link to="/learner/academic?tab=tasks" className="btn btn-ghost btn-sm">كل الواجبات والاختبارات<ArrowLeft /></Link>
            </div>
            {openAssignments.length ? (
              <div className="list">
                {openAssignments.map((a) => {
                  const sub = state.submissions.find((s) => s.assignmentId === a.id && s.learnerId === me.id)
                  return (
                    <div key={a.id} className="list-item wrap" style={{ flexWrap: 'wrap' }}>
                      <div className="icon-tile"><ClipboardList /></div>
                      <div className="grow" style={{ minWidth: 180 }}>
                        <div className="bold">{a.title}</div>
                        <div className="xs muted">التسليم {relDay(a.due)} · {fTime(a.due)} · من {deg(a.maxScore)}</div>
                        {sub?.published && sub.feedback && <div className="xs" style={{ marginTop: 4, color: 'var(--success)' }}>ملاحظة المدربة: {sub.feedback}</div>}
                        {sub && !sub.published && <div className="xs muted" style={{ marginTop: 4 }}>الملف: {sub.fileName}</div>}
                      </div>
                      <SubmissionStatus assignmentId={a.id} learnerId={me.id} />
                      {!sub && new Date(a.due).getTime() > Date.now() && <button className="btn btn-primary btn-sm" onClick={() => setSubmit(a)}><Upload />تسليم</button>}
                    </div>
                  )
                })}
              </div>
            ) : <Empty title="لا توجد واجبات حالية" icon={<CheckCircle2 />} />}
          </div>

          {announcement && (
            <div className="card">
              <div className="row top">
                <div className="icon-tile"><Megaphone /></div>
                <div className="grow">
                  <div className="row between wrap"><span className="eyebrow">أحدث إعلان · {announcement.sectionId ? `شعبة ${iso(announcement.sectionId)}` : 'عام'}</span><span className="xs muted">{relDay(announcement.at)}</span></div>
                  <div className="bold" style={{ marginTop: 4 }}>{announcement.title}</div>
                  <p className="small muted" style={{ marginTop: 4 }}>{announcement.body}</p>
                  <div className="xs muted" style={{ marginTop: 6 }}>{announcement.author}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="stack lg">
          <div className="card">
            <div className="card-head"><h2 className="card-title">اللقاء القادم</h2><Video size={20} color="var(--gold-700)" /></div>
            {session ? (
              <div className="stack">
                <div>
                  <div className="bold" style={{ fontSize: 17 }}>{session.title}</div>
                  <div className="small muted row" style={{ gap: 6, marginTop: 4 }}><CalendarClock size={16} />{fDay(session.at)} · {fTime(session.at)} بتوقيت الرياض</div>
                </div>
                <Badge tone={relDay(session.at) === 'اليوم' ? 'warning' : 'neutral'}>{relDay(session.at)}</Badge>
                <button className="btn btn-primary btn-block" onClick={() => setLive(session)}><Video />الانضمام للقاء</button>
              </div>
            ) : <Empty title="لا توجد لقاءات قادمة" />}
          </div>
          <div className="card">
            <div className="card-head"><h2 className="card-title">الحضور</h2><UserCheck size={20} color="var(--gold-700)" /></div>
            <div className="row between">
              <div className="stat"><span className="stat-value">{att.present + att.late}/{att.held}</span><span className="stat-label">لقاءات حضرتها</span></div>
              <div className="stat" style={{ textAlign: 'start' }}><span className="stat-value" style={{ color: att.level === 'alert' ? 'var(--danger)' : att.level === 'warn' ? 'var(--warning)' : 'var(--success)' }}>{pct(att.absencePct, 1)}</span><span className="stat-label">نسبة الغياب</span></div>
            </div>
            <div className="xs muted" style={{ marginTop: 12 }}>حد التنبيه التجريبي {state.settings.absenceThreshold}% · الغياب بعذر مقبول لا يُحتسب</div>
            <Link to="/learner/academic?tab=attendance" className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 14 }}>سجل الحضور والأعذار</Link>
          </div>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>آخر النتائج</h2>
            <div className="list">
              {state.submissions.filter((s) => s.learnerId === me.id && s.published).map((s) => {
                const a = state.assignments.find((x) => x.id === s.assignmentId)!
                return (
                  <div key={s.id} className="list-item">
                    <div className="grow"><div className="small bold">{a.title}</div><div className="xs muted">واجب · {fDate(s.submittedAt)}</div></div>
                    <span className="bold">{s.score}/{a.maxScore}</span>
                  </div>
                )
              })}
              {state.quizzes.filter((q) => q.sectionId === section.id && q.scores[me.id] !== undefined).map((q) => (
                <div key={q.id} className="list-item">
                  <div className="grow"><div className="small bold">{q.title}</div><div className="xs muted">اختبار · {fDate(q.at)}</div></div>
                  <span className="bold">{q.scores[me.id]}/{q.maxScore}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      {live && <LiveRoom session={live} role="learner" onClose={() => setLive(null)} />}
      {submit && <SubmitModal assignment={submit} onClose={() => setSubmit(null)} />}
    </div>
  )
}
