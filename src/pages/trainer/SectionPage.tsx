import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Save, Video, Plus, Megaphone, FileText, Pencil, CheckCircle2, Search, CalendarPlus, BookOpen, Users, Download } from 'lucide-react'
import { useStore, newId } from '../../store/store'
import { Tabs, AttBadge, attLabel, Badge, Modal, Field, Empty, Avatar, Callout, Progress } from '../../components/ui'
import { LiveRoom } from '../../components/shared'
import { attendanceStats, lessonProgress, pct, csvDownload } from '../../lib/calc'
import { fDate, fDateTime, fDay, fTime, relDay, fSize, isPast, iso, deg } from '../../lib/format'
import { MAIN_TRAINER } from '../../data/seed'
import type { Assignment, AttendanceStatus, Session, Submission } from '../../data/types'

type Tab = 'learners' | 'attendance' | 'content' | 'assignments' | 'grades' | 'sessions' | 'announcements'

export default function SectionPage() {
  const { id } = useParams()
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'learners'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const section = state.sections.find((s) => s.id === id)
  if (!section) return <Empty title="الشعبة غير موجودة" action={<Link className="btn btn-primary" to="/trainer">العودة</Link>} />
  const program = state.programs.find((p) => p.id === section.programId)!
  const pendingCount = state.submissions.filter((s) => !s.published && state.assignments.find((a) => a.id === s.assignmentId)?.sectionId === section.id).length
  const isMine = section.trainerId === MAIN_TRAINER

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="row" style={{ gap: 8 }}><span className="badge dark plain ltr">{section.code}</span><span className="eyebrow">{program.title}</span></div>
          <h1 className="page-title" style={{ marginTop: 6 }}>{section.title}</h1>
          <p className="page-sub">{section.learnerIds.length} متدربين · {section.days} · {section.time} · من {fDate(section.start)} إلى {fDate(section.end)}</p>
        </div>
      </div>
      {!isMine && <div style={{ marginBottom: 16 }}><Callout tone="warning">هذه الشعبة لم تعد مسندة إليك بعد تعديل الإدارة.</Callout></div>}
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'learners', label: 'المتدربون' }, { id: 'attendance', label: 'الحضور' }, { id: 'content', label: 'المحتوى' },
        { id: 'assignments', label: 'الواجبات', count: pendingCount }, { id: 'grades', label: 'الدرجات' },
        { id: 'sessions', label: 'اللقاءات' }, { id: 'announcements', label: 'الإعلانات' },
      ]} />
      {tab === 'learners' && <LearnersTab sectionId={section.id} />}
      {tab === 'attendance' && <AttendanceTab sectionId={section.id} initialSession={params.get('session')} />}
      {tab === 'content' && <ContentTab sectionId={section.id} />}
      {tab === 'assignments' && <AssignmentsTab sectionId={section.id} openId={params.get('a')} openNew={params.get('new') === '1'} />}
      {tab === 'grades' && <GradesTab sectionId={section.id} />}
      {tab === 'sessions' && <SessionsTab sectionId={section.id} />}
      {tab === 'announcements' && <AnnouncementsTab sectionId={section.id} openNew={params.get('new') === '1'} />}
    </div>
  )
}

function LearnersTab({ sectionId }: { sectionId: string }) {
  const { state } = useStore()
  const section = state.sections.find((s) => s.id === sectionId)!
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const hasLessons = !!state.programs.find((p) => p.id === section.programId)?.terms
  const rows = section.learnerIds.map((id) => state.learners.find((l) => l.id === id)!).filter((l) => l && l.name.includes(q.trim()))
  const sel = open ? state.learners.find((l) => l.id === open) : null
  return (
    <div className="card pad-0">
      <div className="toolbar"><div className="search"><Search /><input className="input" placeholder="ابحث باسم المتدرب" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" /></div></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>المتدرب</th><th>الرقم</th>{hasLessons && <th>تقدم المحتوى</th>}<th>الغياب</th><th>الحالة</th></tr></thead>
          <tbody>
            {rows.map((l) => {
              const st = attendanceStats(state, l.id, sectionId)
              const lp = lessonProgress(state, l.id, section.programId)
              return (
                <tr key={l.id} className="clickable" onClick={() => setOpen(l.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(l.id)}>
                  <td><div className="row" style={{ gap: 10 }}><Avatar name={l.name} /><span className="bold">{l.name}</span></div></td>
                  <td><span className="ltr small">{l.code}</span></td>
                  {hasLessons && <td style={{ minWidth: 160 }}><div className="row small" style={{ gap: 8 }}><div className="grow"><Progress value={lp.pct} /></div>{lp.done}/{lp.total}</div></td>}
                  <td>{st.held ? pct(st.absencePct, 1) : '—'}</td>
                  <td>{st.level === 'alert' ? <Badge tone="danger">تجاوز حد التنبيه</Badge> : st.level === 'warn' ? <Badge tone="warning">يحتاج متابعة</Badge> : <Badge tone="success">منتظم</Badge>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!rows.length && <Empty title="لا يوجد متدربون مطابقون" />}
      </div>
      {sel && <LearnerSummary learnerId={sel.id} sectionId={sectionId} onClose={() => setOpen(null)} />}
    </div>
  )
}

export function LearnerSummary({ learnerId, sectionId, onClose }: { learnerId: string; sectionId: string; onClose: () => void }) {
  const { state } = useStore()
  const l = state.learners.find((x) => x.id === learnerId)!
  const section = state.sections.find((s) => s.id === sectionId)!
  const st = attendanceStats(state, l.id, sectionId)
  const lp = lessonProgress(state, l.id, section.programId)
  const subs = state.submissions.filter((s) => s.learnerId === l.id)
  return (
    <Modal title={l.name} sub={<span className="ltr">{l.code} · {l.email}</span>} onClose={onClose}>
      <div className="grid grid-3" style={{ gap: 12 }}>
        <div className="card tight flat stat"><span className="stat-value" style={{ fontSize: 22 }}>{lp.total ? `${lp.pct}%` : '—'}</span><span className="stat-label">تقدم المحتوى</span></div>
        <div className="card tight flat stat"><span className="stat-value" style={{ fontSize: 22 }}>{st.held ? pct(st.absencePct, 1) : '—'}</span><span className="stat-label">نسبة الغياب</span></div>
        <div className="card tight flat stat"><span className="stat-value" style={{ fontSize: 22 }}>{subs.length}</span><span className="stat-label">تسليمات</span></div>
      </div>
      <dl className="kv">
        <dt>حاضر</dt><dd>{st.present}</dd><dt>متأخر</dt><dd>{st.late}</dd><dt>غائب</dt><dd>{st.absent}</dd><dt>بعذر</dt><dd>{st.excused}</dd>
      </dl>
      {subs.length > 0 && (
        <div className="list">
          {subs.map((s) => {
            const a = state.assignments.find((x) => x.id === s.assignmentId)!
            return <div key={s.id} className="list-item"><div className="grow small"><b>{a.title}</b><div className="xs muted">{s.fileName}</div></div>{s.published ? <Badge tone="success">{s.score}/{a.maxScore}</Badge> : <Badge tone="info">بانتظار التصحيح</Badge>}</div>
          })}
        </div>
      )}
    </Modal>
  )
}

const statuses: AttendanceStatus[] = ['present', 'late', 'absent', 'excused']
function AttendanceTab({ sectionId, initialSession }: { sectionId: string; initialSession: string | null }) {
  const { state, mutate, toast } = useStore()
  const section = state.sections.find((s) => s.id === sectionId)!
  const trainer = state.trainers.find((t) => t.id === section.trainerId)!
  const candidates = state.sessions
    .filter((s) => s.sectionId === sectionId && (s.status === 'held' || relDay(s.at) === 'اليوم'))
    .sort((a, b) => b.at.localeCompare(a.at))
  const [sid, setSid] = useState(initialSession && candidates.some((c) => c.id === initialSession) ? initialSession : candidates[0]?.id ?? '')
  const session = candidates.find((c) => c.id === sid)
  const existing = useMemo(() => Object.fromEntries(section.learnerIds.map((lid) => [lid, state.attendance.find((a) => a.sessionId === sid && a.learnerId === lid)?.status])), [sid, state.attendance, section.learnerIds])
  const [draft, setDraft] = useState<Record<string, AttendanceStatus | undefined>>(existing)
  useEffect(() => setDraft(existing), [existing])
  const dirty = section.learnerIds.some((lid) => draft[lid] !== existing[lid])
  const complete = section.learnerIds.every((lid) => draft[lid])

  if (!session) return <div className="card"><Empty title="لا توجد لقاءات منعقدة بعد" text="يمكن رصد الحضور للقاءات المنعقدة أو لقاء اليوم." /></div>

  const save = () => {
    mutate((d) => {
      for (const lid of section.learnerIds) {
        const st = draft[lid]
        if (!st) continue
        const rec = d.attendance.find((a) => a.sessionId === sid && a.learnerId === lid)
        if (rec) rec.status = st
        else d.attendance.push({ sessionId: sid, learnerId: lid, status: st })
      }
      const s = d.sessions.find((x) => x.id === sid)
      if (s) s.status = 'held'
    }, { actor: trainer.name, text: `رصد حضور لقاء «${session.title}» — شعبة ${iso(section.code)}`, kind: 'attendance' })
    toast('حُفظ الحضور — انعكس لدى المتدربين والإدارة')
  }

  return (
    <div className="stack">
      <div className="card tight row wrap" style={{ gap: 12 }}>
        <label className="label" htmlFor="att-s">اللقاء</label>
        <select id="att-s" className="select" style={{ width: 'auto', minWidth: 260, flex: 1 }} value={sid} onChange={(e) => setSid(e.target.value)}>
          {candidates.map((c) => <option key={c.id} value={c.id}>{c.title} — {fDate(c.at)}{c.status === 'upcoming' ? ' (اليوم)' : ''}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => setDraft(Object.fromEntries(section.learnerIds.map((l) => [l, 'present'])))}>تحديد الكل حاضر</button>
      </div>
      {session.status === 'upcoming' && <Callout>رصد حضور لقاء اليوم يدويًا يحوّله إلى لقاء منعقد ويُحتسب في نسب الحضور.</Callout>}
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>المتدرب</th><th>الحالة المحفوظة</th><th>التحضير</th></tr></thead>
            <tbody>
              {section.learnerIds.map((lid) => {
                const l = state.learners.find((x) => x.id === lid)!
                return (
                  <tr key={lid}>
                    <td><div className="row" style={{ gap: 10 }}><Avatar name={l.name} /><span className="bold nowrap">{l.name}</span></div></td>
                    <td><AttBadge s={existing[lid]} /></td>
                    <td>
                      <div className="segmented" role="radiogroup" aria-label={`حالة ${l.name}`}>
                        {statuses.map((st) => (
                          <button key={st} role="radio" aria-checked={draft[lid] === st} aria-pressed={draft[lid] === st} onClick={() => setDraft({ ...draft, [lid]: st })}>{attLabel[st]}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="row wrap" style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" disabled={!dirty || !complete} onClick={save}><Save />حفظ الحضور</button>
          <span className="small muted">{!complete ? 'حدد حالة كل متدرب قبل الحفظ' : dirty ? 'تغييرات غير محفوظة' : 'لا توجد تغييرات'}</span>
        </div>
      </div>
    </div>
  )
}

function ContentTab({ sectionId }: { sectionId: string }) {
  const { state, mutate, toast } = useStore()
  const section = state.sections.find((s) => s.id === sectionId)!
  const program = state.programs.find((p) => p.id === section.programId)!
  const course = program.terms?.flatMap((t) => t.courses).find((c) => c.id === section.courseId)
  const materials = state.materials.filter((m) => m.sectionId === sectionId)
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ title: '', kind: 'ملف PDF' })
  return (
    <div className="main-aside">
      <div className="card">
        <div className="card-head"><h2 className="card-title">{course ? `محتوى المقرر · ${course.title}` : 'خطة البرنامج'}</h2><BookOpen size={20} color="var(--gold-700)" /></div>
        {course ? course.units.map((u) => (
          <div key={u.id} className="unit" style={{ marginTop: 0, marginBottom: 16 }}>
            <div className="unit-title">{u.title}</div>
            {u.lessons.map((l) => <div key={l.id} className="lesson-nav-item"><FileText />{l.title}<span className="xs muted" style={{ marginInlineStart: 'auto' }}>{l.minutes} د</span></div>)}
          </div>
        )) : (program.plan ?? []).map((g) => (
          <div key={g.title} className="unit" style={{ marginTop: 0, marginBottom: 16 }}><div className="unit-title">{g.title}</div>{g.items.map((i) => <div key={i} className="lesson-nav-item"><FileText />{i}</div>)}</div>
        ))}
        <p className="xs muted">محتوى البرنامج تديره الإدارة؛ المواد الإضافية تخص هذه الشعبة فقط.</p>
      </div>
      <div className="card">
        <div className="card-head"><h2 className="card-title">مواد الشعبة</h2><button className="btn btn-primary btn-sm" onClick={() => setAdd(true)}><Plus />إضافة</button></div>
        {materials.length ? <div className="list">{materials.map((m) => <div key={m.id} className="list-item"><div className="icon-tile"><FileText /></div><div className="grow"><div className="small bold">{m.title}</div><div className="xs muted">{m.kind} · {fDate(m.at)}</div></div></div>)}</div>
          : <Empty title="لا توجد مواد إضافية" />}
      </div>
      {add && (
        <Modal title="إضافة مادة للشعبة" onClose={() => setAdd(false)} footer={<>
          <button className="btn btn-primary" disabled={form.title.trim().length < 3} onClick={() => {
            mutate((d) => { d.materials.unshift({ id: newId('M'), sectionId, title: form.title.trim(), kind: form.kind, at: new Date().toISOString() }) })
            toast('أُضيفت المادة إلى الشعبة'); setAdd(false); setForm({ title: '', kind: 'ملف PDF' })
          }}><Plus />إضافة</button>
          <button className="btn btn-secondary" onClick={() => setAdd(false)}>إلغاء</button>
        </>}>
          <Field label="عنوان المادة" htmlFor="m-t"><input id="m-t" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="النوع" htmlFor="m-k"><select id="m-k" className="select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{['ملف PDF', 'عرض تقديمي', 'قالب Word', 'رابط مرجعي'].map((k) => <option key={k}>{k}</option>)}</select></Field>
        </Modal>
      )}
    </div>
  )
}

function AssignmentsTab({ sectionId, openId, openNew }: { sectionId: string; openId: string | null; openNew: boolean }) {
  const { state } = useStore()
  const section = state.sections.find((s) => s.id === sectionId)!
  const list = state.assignments.filter((a) => a.sectionId === sectionId).sort((a, b) => b.due.localeCompare(a.due))
  const withPending = list.find((a) => state.submissions.some((s) => s.assignmentId === a.id && !s.published))
  const [selected, setSelected] = useState<string | null>(openId ?? withPending?.id ?? list[0]?.id ?? null)
  const [create, setCreate] = useState(openNew)
  const [grading, setGrading] = useState<Submission | null>(null)
  const a = list.find((x) => x.id === selected)
  const subs = a ? state.submissions.filter((s) => s.assignmentId === a.id) : []
  const missing = a ? section.learnerIds.filter((lid) => !subs.some((s) => s.learnerId === lid)) : []
  return (
    <div className="stack lg">
      <div className="row between wrap">
        <div className="segmented" role="group" aria-label="الواجبات" style={{ flexWrap: 'wrap' }}>
          {list.map((x) => <button key={x.id} aria-pressed={selected === x.id} onClick={() => setSelected(x.id)}>{x.title}</button>)}
        </div>
        <button className="btn btn-primary" onClick={() => setCreate(true)}><Plus />إنشاء واجب</button>
      </div>
      {a ? (
        <div className="card pad-0">
          <div className="row between wrap" style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="bold" style={{ fontSize: 18 }}>{a.title}</div>
              <div className="small muted">التسليم: {fDateTime(a.due)} · من {deg(a.maxScore)}</div>
            </div>
            <div className="row wrap" style={{ gap: 8 }}>
              <Badge tone="info">{subs.length} من {section.learnerIds.length} سلّموا</Badge>
              <Badge tone="warning">{subs.filter((s) => !s.published).length} بانتظار التصحيح</Badge>
            </div>
          </div>
          {subs.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>المتدرب</th><th>الملف</th><th>وقت التسليم</th><th>الدرجة</th><th></th></tr></thead>
                <tbody>
                  {subs.sort((x, y) => Number(x.published) - Number(y.published) || y.submittedAt.localeCompare(x.submittedAt)).map((s) => {
                    const l = state.learners.find((x) => x.id === s.learnerId)!
                    const late = new Date(s.submittedAt) > new Date(a.due)
                    return (
                      <tr key={s.id}>
                        <td><div className="row" style={{ gap: 10 }}><Avatar name={l.name} /><span className="bold nowrap">{l.name}</span></div></td>
                        <td className="small"><div className="row" style={{ gap: 6 }}><FileText size={16} color="var(--gold-700)" /><span style={{ wordBreak: 'break-all' }}>{s.fileName}</span></div><div className="xs muted">{fSize(s.fileSize)}</div></td>
                        <td className="small nowrap">{relDay(s.submittedAt)} · {fTime(s.submittedAt)}{late && <div><Badge tone="danger">متأخر</Badge></div>}</td>
                        <td>{s.published ? <Badge tone="success">{s.score}/{a.maxScore}</Badge> : s.score !== undefined ? <Badge tone="neutral">مسودة {s.score}</Badge> : <Badge tone="warning">لم يُصحح</Badge>}</td>
                        <td><button className={`btn btn-sm ${s.published ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setGrading(s)}>{s.published ? <><Pencil />تعديل</> : <><CheckCircle2 />تصحيح</>}</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <Empty title="لا توجد تسليمات بعد" text={isPast(a.due) ? 'انتهى موعد التسليم.' : `الموعد ${relDay(a.due)}.`} />}
          {missing.length > 0 && subs.length > 0 && <div className="small muted" style={{ padding: 16, borderTop: '1px solid var(--border)' }}>لم يسلّم بعد: {missing.map((id) => state.learners.find((l) => l.id === id)?.name).join('، ')}</div>}
        </div>
      ) : <div className="card"><Empty title="لا توجد واجبات" action={<button className="btn btn-primary btn-sm" onClick={() => setCreate(true)}><Plus />إنشاء واجب</button>} /></div>}
      {grading && a && <GradeModal sub={grading} assignment={a} onClose={() => setGrading(null)} />}
      {create && <CreateAssignment sectionId={sectionId} onClose={(newId) => { setCreate(false); if (newId) setSelected(newId) }} />}
    </div>
  )
}

function GradeModal({ sub, assignment, onClose }: { sub: Submission; assignment: Assignment; onClose: () => void }) {
  const { state, mutate, toast } = useStore()
  const l = state.learners.find((x) => x.id === sub.learnerId)!
  const trainer = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const [score, setScore] = useState(sub.score !== undefined ? String(sub.score) : '')
  const [feedback, setFeedback] = useState(sub.feedback ?? '')
  const n = Number(score)
  const valid = score.trim() !== '' && !Number.isNaN(n) && n >= 0 && n <= assignment.maxScore
  const err = score.trim() !== '' && !valid ? `أدخل درجة بين 0 و ${assignment.maxScore}` : undefined
  const save = (publish: boolean) => {
    mutate((d) => {
      const s = d.submissions.find((x) => x.id === sub.id)!
      s.score = n; s.feedback = feedback.trim() || undefined; s.published = publish
    }, publish ? { actor: trainer.name, text: `اعتماد درجة ${l.name} في «${assignment.title}»: ${n}/${assignment.maxScore}`, kind: 'academic' } : undefined)
    toast(publish ? `اعتُمدت الدرجة ${n}/${assignment.maxScore} — تظهر الآن لـ${l.name}` : 'حُفظت الدرجة كمسودة (لا تظهر للمتدرب)')
    onClose()
  }
  return (
    <Modal title={`تصحيح: ${l.name}`} sub={assignment.title} onClose={onClose} footer={<>
      <button className="btn btn-primary" disabled={!valid} onClick={() => save(true)}><CheckCircle2 />اعتماد ونشر الدرجة</button>
      <button className="btn btn-secondary" disabled={!valid} onClick={() => save(false)}>حفظ كمسودة</button>
    </>}>
      <div className="list-item" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
        <div className="icon-tile"><FileText /></div>
        <div className="grow"><div className="small bold" style={{ wordBreak: 'break-all' }}>{sub.fileName}</div><div className="xs muted">{fSize(sub.fileSize)} · {fDateTime(sub.submittedAt)}</div></div>
        <button className="btn btn-sm btn-secondary" onClick={() => toast('الملف غير مرفوع إلى خادم في نموذج العرض — يُحفظ اسمه فقط', 'error')}><Download />فتح</button>
      </div>
      <Field label={`الدرجة (من ${assignment.maxScore})`} htmlFor="g-s" error={err}>
        <input id="g-s" className={`input${err ? ' error' : ''}`} inputMode="decimal" dir="ltr" style={{ textAlign: 'right', maxWidth: 160 }} value={score} onChange={(e) => setScore(e.target.value)} />
      </Field>
      <Field label="ملاحظة للمتدرب" htmlFor="g-f"><textarea id="g-f" className="textarea" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="مثال: وثيقة واضحة، أضف معايير قبول المخرجات." /></Field>
      <p className="xs muted">لا تظهر الدرجة والملاحظة للمتدرب إلا بعد الاعتماد.</p>
    </Modal>
  )
}

function CreateAssignment({ sectionId, onClose }: { sectionId: string; onClose: (id?: string) => void }) {
  const { mutate, toast, state } = useStore()
  const trainer = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const d0 = new Date(); d0.setDate(d0.getDate() + 7)
  const [f, setF] = useState({ title: '', description: '', max: '10', due: d0.toISOString().slice(0, 10) })
  const ok = f.title.trim().length >= 3 && Number(f.max) > 0 && Number(f.max) <= 100 && f.due
  const create = () => {
    const id = newId('A')
    const due = new Date(f.due + 'T23:59:00')
    mutate((d) => { d.assignments.push({ id, sectionId, title: f.title.trim(), description: f.description.trim() || '—', maxScore: Number(f.max), due: due.toISOString(), createdAt: new Date().toISOString() }) },
      { actor: trainer.name, text: `إنشاء واجب «${f.title.trim()}» لشعبة ${iso(sectionId)}`, kind: 'academic' })
    toast('أُنشئ الواجب ويظهر الآن للمتدربين في الشعبة')
    onClose(id)
  }
  return (
    <Modal title="إنشاء واجب" sub={`شعبة ${iso(sectionId)}`} onClose={() => onClose()} footer={<>
      <button className="btn btn-primary" disabled={!ok} onClick={create}><Plus />إنشاء ونشر</button>
      <button className="btn btn-secondary" onClick={() => onClose()}>إلغاء</button>
    </>}>
      <Field label="عنوان الواجب" htmlFor="ca-t"><input id="ca-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="الوصف والمطلوب" htmlFor="ca-d"><textarea id="ca-d" className="textarea" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <Field label="الدرجة القصوى" htmlFor="ca-m"><input id="ca-m" className="input" inputMode="numeric" dir="ltr" style={{ textAlign: 'right' }} value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} /></Field>
        <Field label="آخر موعد للتسليم" htmlFor="ca-due"><input id="ca-due" type="date" className="input" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
      </div>
    </Modal>
  )
}

function GradesTab({ sectionId }: { sectionId: string }) {
  const { state } = useStore()
  const section = state.sections.find((s) => s.id === sectionId)!
  const assignments = state.assignments.filter((a) => a.sectionId === sectionId)
  const quizzes = state.quizzes.filter((q) => q.sectionId === sectionId)
  const cols = [
    ...assignments.map((a) => ({ id: a.id, title: a.title, max: a.maxScore, get: (lid: string) => { const s = state.submissions.find((x) => x.assignmentId === a.id && x.learnerId === lid); return s?.published ? s.score : undefined } })),
    ...quizzes.map((q) => ({ id: q.id, title: q.title, max: q.maxScore, get: (lid: string) => q.scores[lid] })),
  ]
  const exportCsv = () => csvDownload(`grades-${section.code}.csv`, [
    ['المتدرب', 'الرقم', ...cols.map((c) => `${c.title} (${c.max})`)],
    ...section.learnerIds.map((lid) => { const l = state.learners.find((x) => x.id === lid)!; return [l.name, l.code, ...cols.map((c) => c.get(lid) ?? '')] }),
  ])
  return (
    <div className="card pad-0">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}><span className="small muted">الدرجات المعتمدة فقط · الخلايا الفارغة لم تُرصد بعد</span><button className="btn btn-secondary btn-sm" onClick={exportCsv}><Download />تنزيل CSV</button></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>المتدرب</th>{cols.map((c) => <th key={c.id}>{c.title}<div className="xs" style={{ fontWeight: 400 }}>من {c.max}</div></th>)}</tr></thead>
          <tbody>
            {section.learnerIds.map((lid) => {
              const l = state.learners.find((x) => x.id === lid)!
              return <tr key={lid}><td className="bold nowrap">{l.name}</td>{cols.map((c) => { const v = c.get(lid); return <td key={c.id}>{v !== undefined ? v : <span className="muted">—</span>}</td> })}</tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SessionsTab({ sectionId }: { sectionId: string }) {
  const { state, mutate, toast } = useStore()
  const trainer = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const sessions = state.sessions.filter((s) => s.sectionId === sectionId).sort((a, b) => a.at.localeCompare(b.at))
  const [live, setLive] = useState<Session | null>(null)
  const [create, setCreate] = useState(false)
  const d0 = new Date(); d0.setDate(d0.getDate() + 21)
  const [f, setF] = useState({ title: '', date: d0.toISOString().slice(0, 10), time: '19:00' })
  return (
    <div className="stack">
      <div className="row between wrap"><span className="small muted">{sessions.filter((s) => s.status === 'held').length} منعقدة · {sessions.filter((s) => s.status === 'upcoming').length} قادمة · روابط الجلسات محاكاة داخل الديمو</span><button className="btn btn-primary" onClick={() => setCreate(true)}><CalendarPlus />جدولة لقاء</button></div>
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>اللقاء</th><th>الموعد</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="bold">{s.title}</td>
                  <td className="small nowrap">{fDay(s.at)} · {fTime(s.at)}</td>
                  <td>{s.status === 'held' ? <Badge tone="neutral">منعقد</Badge> : <Badge tone={relDay(s.at) === 'اليوم' ? 'warning' : 'info'}>{relDay(s.at)}</Badge>}</td>
                  <td>{s.status === 'upcoming' ? <button className="btn btn-sm btn-secondary" onClick={() => setLive(s)}><Video />بدء/معاينة</button> : <Link className="btn btn-sm btn-ghost" to={`/trainer/sections/${sectionId}?tab=attendance&session=${s.id}`}>الحضور</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {live && <LiveRoom session={live} role="trainer" onClose={() => setLive(null)} />}
      {create && (
        <Modal title="جدولة لقاء مباشر" sub={`شعبة ${iso(sectionId)}`} onClose={() => setCreate(false)} footer={<>
          <button className="btn btn-primary" disabled={f.title.trim().length < 3} onClick={() => {
            const at = new Date(`${f.date}T${f.time}:00`)
            mutate((d) => { d.sessions.push({ id: newId('S'), sectionId, title: f.title.trim(), at: at.toISOString(), minutes: 90, status: 'upcoming' }) },
              { actor: trainer.name, text: `جدولة لقاء «${f.title.trim()}» لشعبة ${iso(sectionId)}`, kind: 'content' })
            toast('جُدول اللقاء ويظهر في جدول المتدربين'); setCreate(false); setF({ ...f, title: '' })
          }}><CalendarPlus />جدولة</button>
          <button className="btn btn-secondary" onClick={() => setCreate(false)}>إلغاء</button>
        </>}>
          <Field label="عنوان اللقاء" htmlFor="ss-t"><input id="ss-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Field label="التاريخ" htmlFor="ss-d"><input id="ss-d" type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <Field label="الوقت (الرياض)" htmlFor="ss-h"><input id="ss-h" type="time" className="input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AnnouncementsTab({ sectionId, openNew }: { sectionId: string; openNew: boolean }) {
  const { state, mutate, toast } = useStore()
  const trainer = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const list = state.announcements.filter((n) => n.sectionId === sectionId).sort((a, b) => b.at.localeCompare(a.at))
  const [create, setCreate] = useState(openNew)
  const [f, setF] = useState({ title: '', body: '' })
  const ok = f.title.trim().length >= 3 && f.body.trim().length >= 5
  const publish = () => {
    mutate((d) => { d.announcements.push({ id: newId('N'), sectionId, title: f.title.trim(), body: f.body.trim(), at: new Date().toISOString(), author: trainer.name }) },
      { actor: trainer.name, text: `نشر إعلان «${f.title.trim()}» لشعبة ${iso(sectionId)}`, kind: 'content' })
    toast(`نُشر الإعلان — يظهر الآن لمتدربي شعبة ${iso(sectionId)}`)
    setF({ title: '', body: '' }); setCreate(false)
  }
  return (
    <div className="stack">
      <div className="row between wrap"><span className="small muted row" style={{ gap: 6 }}><Users size={16} />تظهر الإعلانات لجميع المتدربين المسجلين في الشعبة</span><button className="btn btn-primary" onClick={() => setCreate(true)}><Megaphone />إعلان جديد</button></div>
      {list.length ? list.map((n) => (
        <div key={n.id} className="card">
          <div className="row between wrap"><span className="bold" style={{ fontSize: 17 }}>{n.title}</span><span className="xs muted">{relDay(n.at)} · {fTime(n.at)}</span></div>
          <p className="muted" style={{ marginTop: 6 }}>{n.body}</p>
          <div className="xs muted" style={{ marginTop: 8 }}>{n.author}</div>
        </div>
      )) : <div className="card"><Empty icon={<Megaphone />} title="لا توجد إعلانات" /></div>}
      {create && (
        <Modal title="إعلان جديد للشعبة" sub={`شعبة ${iso(sectionId)}`} onClose={() => setCreate(false)} footer={<>
          <button className="btn btn-primary" disabled={!ok} onClick={publish}><Megaphone />نشر الإعلان</button>
          <button className="btn btn-secondary" onClick={() => setCreate(false)}>إلغاء</button>
        </>}>
          <Field label="العنوان" htmlFor="an-t"><input id="an-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثال: تذكير بلقاء الليلة" /></Field>
          <Field label="نص الإعلان" htmlFor="an-b"><textarea id="an-b" className="textarea" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  )
}
