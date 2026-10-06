import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, Lock, FileText, ArrowLeft } from 'lucide-react'
import { iso } from '../../lib/format'
import { useStore } from '../../store/store'
import { Tabs, Progress, Badge, Empty } from '../../components/ui'
import { courseProgress, lessonProgress } from '../../lib/calc'
import { MAIN_LEARNER } from '../../data/seed'

export default function LearnerProgram() {
  const { id } = useParams()
  const { state } = useStore()
  const [tab, setTab] = useState<'content' | 'plan'>('content')
  const program = state.programs.find((p) => p.id === id)
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const section = state.sections.find((s) => s.id === me.sectionId)
  if (!program?.terms || section?.programId !== program.id) return <Empty title="البرنامج غير متاح في حسابك" action={<Link to="/learner" className="btn btn-primary">العودة للرئيسية</Link>} />

  const prog = lessonProgress(state, me.id, program.id)
  const done = new Set(prog.doneIds)
  const currentTermId = program.terms.find((t) => t.courses.some((c) => c.id === section.courseId))?.id
  const firstUndone = program.terms.flatMap((t) => t.courses.flatMap((c) => c.units.flatMap((u) => u.lessons))).find((l) => !done.has(l.id))

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">دبلوم · شعبة {iso(section.code)}</div>
          <h1 className="page-title">{program.title}</h1>
          <p className="page-sub">{program.terms.length} فصول تدريبية · {program.terms.reduce((n, t) => n + t.courses.length, 0)} مقررات · {prog.total} درسًا</p>
        </div>
        <div className="card tight" style={{ minWidth: 280 }}>
          <div className="row between small"><span className="bold">تقدم المحتوى</span><span>{prog.done} من {prog.total} درسًا · <b>{prog.pct}%</b></span></div>
          <div style={{ marginTop: 10 }}><Progress value={prog.pct} dark label="تقدم البرنامج" /></div>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'content', label: 'المحتوى' }, { id: 'plan', label: 'الخطة الدراسية' }]} />

      {tab === 'content' && (
        <div className="stack lg">
          {program.terms.map((term) => {
            const isCurrent = term.id === currentTermId
            const locked = !isCurrent && term.courses.every((c) => courseProgress(state, me.id, program.id, c.id).done === 0)
            return (
              <section key={term.id} className="term" style={isCurrent ? { borderColor: 'var(--gold-300)' } : undefined}>
                <div className="term-head">
                  <div className="row"><h2 className="section-title" style={{ fontSize: 18 }}>{term.title}</h2>{isCurrent ? <Badge>الفصل الحالي</Badge> : locked ? <Badge tone="neutral">يُتاح لاحقًا</Badge> : null}</div>
                  <span className="small muted">{term.courses.length} مقررات</span>
                </div>
                {term.courses.map((c) => {
                  const cp = courseProgress(state, me.id, program.id, c.id)
                  const isCurrentCourse = c.id === section.courseId
                  return (
                    <div key={c.id} className="course">
                      <div className="row between wrap">
                        <div className="row" style={{ gap: 10 }}>
                          <span className="badge neutral plain ltr">{c.code}</span>
                          <h3 style={{ fontSize: 17 }}>{c.title}</h3>
                          {isCurrentCourse && <Badge tone="warning">المقرر الحالي</Badge>}
                        </div>
                        <div className="row small" style={{ gap: 10, minWidth: 200 }}>
                          <div className="grow"><Progress value={cp.pct} label={`تقدم ${c.title}`} /></div>
                          <span className="muted nowrap">{cp.done}/{cp.total}</span>
                        </div>
                      </div>
                      {cp.done === cp.total && cp.total > 0 && <div className="xs muted" style={{ marginTop: 6 }}>اكتمل المحتوى — اجتياز المقرر يعتمد على التقييمات والحضور</div>}
                      {c.units.map((u) => (
                        <div key={u.id} className="unit">
                          <div className="unit-title">{u.title}</div>
                          {u.lessons.map((l) => {
                            const isDone = done.has(l.id)
                            const isNext = firstUndone?.id === l.id
                            return locked ? (
                              <div key={l.id} className="lesson-nav-item" style={{ opacity: .6 }}><Lock />{l.title}<span className="xs muted" style={{ marginInlineStart: 'auto' }}>{l.minutes} د</span></div>
                            ) : (
                              <Link key={l.id} to={`/learner/lesson/${l.id}`} className={`lesson-nav-item${isNext ? ' current' : ''}`}>
                                {isDone ? <CheckCircle2 className="done" /> : isNext ? <PlayCircle /> : <Circle />}
                                <span className="grow">{l.title}</span>
                                {isNext && <span className="badge plain">التالي</span>}
                                <span className="xs muted nowrap">{l.minutes} د</span>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </section>
            )
          })}
        </div>
      )}

      {tab === 'plan' && (
        <div className="card pad-0">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>الفصل</th><th>الرمز</th><th>المقرر</th><th>الوحدات</th><th>الدروس</th><th>الحالة</th></tr></thead>
              <tbody>
                {program.terms.flatMap((t) => t.courses.map((c) => {
                  const cp = courseProgress(state, me.id, program.id, c.id)
                  const status = c.id === section.courseId ? <Badge tone="warning">جارٍ</Badge> : cp.done === cp.total ? <Badge tone="success">مكتمل المحتوى</Badge> : cp.done > 0 ? <Badge tone="info">بدأ</Badge> : <Badge tone="neutral">لم يبدأ</Badge>
                  return (
                    <tr key={c.id}>
                      <td className="nowrap">{t.title}</td>
                      <td><span className="ltr">{c.code}</span></td>
                      <td className="bold">{c.title}</td>
                      <td>{c.units.length}</td>
                      <td>{cp.done}/{cp.total}</td>
                      <td>{status}</td>
                    </tr>
                  )
                }))}
              </tbody>
            </table>
          </div>
          <div className="row between wrap" style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <span className="small muted row" style={{ gap: 6 }}><FileText size={16} />المدة المعلنة: {program.duration} · {program.mode}</span>
            <Link to="/learner/academic?tab=grades" className="btn btn-ghost btn-sm">الدرجات<ArrowLeft /></Link>
          </div>
        </div>
      )}
    </div>
  )
}
