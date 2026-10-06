import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Video, CalendarDays, FileWarning, Send, ClipboardList, PenLine, Upload, Award, IdCard, FileText } from 'lucide-react'
import { useStore, newId } from '../../store/store'
import { Tabs, AttBadge, Badge, Modal, Field, Empty, Callout, Avatar } from '../../components/ui'
import { LiveRoom, SubmitModal, SubmissionStatus } from '../../components/shared'
import { attendanceStats, pct } from '../../lib/calc'
import { fDay, fTime, fDate, fDateY, relDay, isPast, deg } from '../../lib/format'
import { MAIN_LEARNER, MAIN_PROGRAM } from '../../data/seed'
import type { Assignment, Session } from '../../data/types'

type Tab = 'schedule' | 'attendance' | 'grades' | 'tasks' | 'services' | 'certs'

export default function Academic() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'schedule'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const section = state.sections.find((s) => s.id === me.sectionId)!
  const myRequests = state.services.filter((s) => s.learnerId === me.id)
  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">الشؤون الأكاديمية</h1>
          <p className="page-sub">الجدول والحضور والدرجات والخدمات — شعبة <span className="ltr">{section.code}</span> · {section.title}</p>
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'schedule', label: 'الجدول' }, { id: 'attendance', label: 'الحضور' }, { id: 'grades', label: 'الدرجات' },
        { id: 'tasks', label: 'الواجبات والاختبارات' }, { id: 'services', label: 'الخدمات', count: myRequests.filter((r) => r.status === 'pending').length },
        { id: 'certs', label: 'الشهادات والبطاقة' },
      ]} />
      {tab === 'schedule' && <Schedule />}
      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'grades' && <Grades />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'services' && <Services />}
      {tab === 'certs' && <Certs />}
    </div>
  )
}

function Schedule() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const [live, setLive] = useState<Session | null>(null)
  const sessions = state.sessions.filter((s) => s.sectionId === me.sectionId)
  const upcoming = sessions.filter((s) => s.status === 'upcoming').sort((a, b) => a.at.localeCompare(b.at))
  const held = sessions.filter((s) => s.status === 'held').sort((a, b) => b.at.localeCompare(a.at))
  return (
    <div className="main-aside">
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>اللقاءات القادمة</h2>
        <div className="list">
          {upcoming.map((s, i) => (
            <div key={s.id} className="list-item" style={{ flexWrap: 'wrap' }}>
              <div className={`icon-tile${i === 0 ? ' dark' : ''}`}><CalendarDays /></div>
              <div className="grow" style={{ minWidth: 180 }}><div className="bold">{s.title}</div><div className="small muted">{fDay(s.at)} · {fTime(s.at)} · {s.minutes} دقيقة</div></div>
              <Badge tone={i === 0 ? 'warning' : 'neutral'}>{relDay(s.at)}</Badge>
              {i === 0 && <button className="btn btn-primary btn-sm" onClick={() => setLive(s)}><Video />الانضمام</button>}
            </div>
          ))}
          {!upcoming.length && <Empty title="لا توجد لقاءات قادمة" />}
        </div>
      </div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>اللقاءات المنعقدة</h2>
        <div className="list">
          {held.map((s) => (
            <div key={s.id} className="list-item">
              <div className="grow"><div className="small bold">{s.title}</div><div className="xs muted">{fDate(s.at)}</div></div>
              <AttBadge s={state.attendance.find((a) => a.sessionId === s.id && a.learnerId === me.id)?.status} />
            </div>
          ))}
        </div>
      </div>
      {live && <LiveRoom session={live} role="learner" onClose={() => setLive(null)} />}
    </div>
  )
}

function AttendanceTab() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const st = attendanceStats(state, me.id, me.sectionId)
  const [excuseFor, setExcuseFor] = useState<Session | null>(null)
  const held = state.sessions.filter((s) => s.sectionId === me.sectionId && s.status === 'held').sort((a, b) => a.at.localeCompare(b.at))
  return (
    <div className="stack lg">
      <div className="grid grid-4 stats">
        {[
          { l: 'حاضر', v: st.present }, { l: 'متأخر', v: st.late }, { l: 'غائب', v: st.absent }, { l: 'بعذر مقبول', v: st.excused },
        ].map((x) => <div key={x.l} className="card tight stat"><span className="stat-value">{x.v}</span><span className="stat-label">{x.l} · من {st.held} لقاءات</span></div>)}
      </div>
      <Callout tone={st.level === 'alert' ? 'warning' : st.level === 'warn' ? 'warning' : 'info'}>
        نسبة غيابك غير المعذور <b>{pct(st.absencePct, 1)}</b> ({st.absent} من {st.held} لقاءات منعقدة). حد التنبيه في هذا الديمو <b>{state.settings.absenceThreshold}%</b> — إعداد تجريبي قابل للتعديل، والتنبيه لا يعني حرمانًا تلقائيًا. التأخير لا يُحتسب غيابًا، والغياب بعذر مقبول لا يدخل في النسبة.
      </Callout>
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>اللقاء</th><th>التاريخ</th><th>الحالة</th><th>العذر</th></tr></thead>
            <tbody>
              {held.map((s, i) => {
                const rec = state.attendance.find((a) => a.sessionId === s.id && a.learnerId === me.id)
                const ex = state.excuses.find((e) => e.sessionId === s.id && e.learnerId === me.id)
                return (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td className="bold">{s.title}</td>
                    <td className="nowrap">{fDate(s.at)}</td>
                    <td><AttBadge s={rec?.status} /></td>
                    <td>
                      {ex ? <Badge tone={ex.status === 'accepted' ? 'success' : ex.status === 'rejected' ? 'danger' : 'warning'}>{ex.status === 'accepted' ? 'عذر مقبول' : ex.status === 'rejected' ? 'عذر مرفوض' : 'عذر قيد المراجعة'}</Badge>
                        : rec?.status === 'absent' ? <button className="btn btn-secondary btn-sm" onClick={() => setExcuseFor(s)}><FileWarning />تقديم عذر</button> : <span className="muted">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {excuseFor && <ExcuseModal session={excuseFor} onClose={() => setExcuseFor(null)} />}
    </div>
  )
}

function ExcuseModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const { mutate, toast, state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const [reason, setReason] = useState('')
  const [file, setFile] = useState('')
  const send = () => {
    mutate((d) => { d.excuses.unshift({ id: newId('EX'), learnerId: me.id, sessionId: session.id, reason, fileName: file || undefined, at: new Date().toISOString(), status: 'pending' }) },
      { actor: me.name, text: `تقديم عذر غياب عن لقاء «${session.title}»`, kind: 'attendance' })
    toast('أُرسل العذر إلى الإدارة للمراجعة')
    onClose()
  }
  return (
    <Modal title="تقديم عذر غياب" sub={`${session.title} · ${fDate(session.at)}`} onClose={onClose} footer={<>
      <button className="btn btn-primary" disabled={reason.trim().length < 4} onClick={send}><Send />إرسال العذر</button>
      <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
    </>}>
      <Field label="سبب الغياب" htmlFor="ex-r"><textarea id="ex-r" className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      <Field label="مستند داعم (اختياري)" htmlFor="ex-f" hint="يُحفظ اسم الملف فقط داخل الديمو"><input id="ex-f" type="file" className="input" style={{ paddingTop: 8 }} onChange={(e) => setFile(e.target.files?.[0]?.name ?? '')} /></Field>
    </Modal>
  )
}

function Grades() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const assignments = state.assignments.filter((a) => a.sectionId === me.sectionId)
  const quizzes = state.quizzes.filter((q) => q.sectionId === me.sectionId)
  const rows = [
    ...assignments.map((a) => {
      const sub = state.submissions.find((s) => s.assignmentId === a.id && s.learnerId === me.id)
      return { id: a.id, title: a.title, kind: 'واجب', max: a.maxScore, score: sub?.published ? sub.score : undefined, note: sub?.published ? sub.feedback : sub ? 'سُلّم — بانتظار اعتماد الدرجة' : isPast(a.due) ? 'لم يُسلّم' : 'لم يحن موعده' }
    }),
    ...quizzes.map((q) => ({ id: q.id, title: q.title, kind: 'اختبار', max: q.maxScore, score: q.scores[me.id], note: q.scores[me.id] === undefined ? (isPast(q.at) ? 'لم يُرصد' : `موعده ${fDate(q.at)}`) : '' })),
  ]
  const graded = rows.filter((r) => r.score !== undefined)
  const sum = graded.reduce((n, r) => n + (r.score ?? 0), 0)
  const max = graded.reduce((n, r) => n + r.max, 0)
  return (
    <div className="stack lg">
      <div className="grid grid-3">
        <div className="card tight stat"><span className="stat-value">{sum}/{max}</span><span className="stat-label">مجموع الدرجات المعتمدة حتى الآن</span></div>
        <div className="card tight stat"><span className="stat-value">{max ? pct((sum / max) * 100) : '—'}</span><span className="stat-label">النسبة من التقييمات المرصودة</span></div>
        <div className="card tight stat"><span className="stat-value">{rows.length - graded.length}</span><span className="stat-label">تقييمات بانتظار الرصد</span></div>
      </div>
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>التقييم</th><th>النوع</th><th>الدرجة</th><th>ملاحظات</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="bold">{r.title}</td>
                  <td><Badge tone="neutral">{r.kind}</Badge></td>
                  <td className="nowrap">{r.score !== undefined ? <b>{r.score} / {r.max}</b> : <span className="muted">— / {r.max}</span>}</td>
                  <td className="small muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="xs muted">تظهر الدرجة بعد اعتمادها من المدرب. الدرجة النهائية للمقرر تُحتسب وفق قواعد التقييم المعتمدة بعد اكتمال جميع التقييمات.</p>
    </div>
  )
}

function TasksTab() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming')
  const [submit, setSubmit] = useState<Assignment | null>(null)
  const items = [
    ...state.assignments.filter((a) => a.sectionId === me.sectionId).map((a) => ({ id: a.id, kind: 'a' as const, title: a.title, at: a.due, a })),
    ...state.quizzes.filter((q) => q.sectionId === me.sectionId).map((q) => ({ id: q.id, kind: 'q' as const, title: q.title, at: q.at, q })),
  ].sort((x, y) => x.at.localeCompare(y.at))
  const list = items.filter((i) => (view === 'upcoming' ? !isPast(i.at) : isPast(i.at)))
  if (view === 'past') list.reverse()
  return (
    <div className="stack">
      <div className="segmented" role="group" aria-label="التصنيف">
        <button aria-pressed={view === 'upcoming'} onClick={() => setView('upcoming')}>القادمة</button>
        <button aria-pressed={view === 'past'} onClick={() => setView('past')}>المنتهية</button>
      </div>
      <div className="grid grid-3">
        {list.map((i) => {
          const sub = i.kind === 'a' ? state.submissions.find((s) => s.assignmentId === i.id && s.learnerId === me.id) : undefined
          return (
            <div key={i.id} className="card stack sm">
              <div className="row between">
                <div className="icon-tile">{i.kind === 'a' ? <ClipboardList /> : <PenLine />}</div>
                <Badge tone="neutral">{i.kind === 'a' ? 'واجب' : 'اختبار'}</Badge>
              </div>
              <div className="bold" style={{ fontSize: 16, marginTop: 6 }}>{i.title}</div>
              <div className="small muted">{i.kind === 'a' ? 'التسليم' : 'الموعد'}: {relDay(i.at)} · {fTime(i.at)}</div>
              <div className="row between wrap" style={{ marginTop: 8 }}>
                {i.kind === 'a' ? <SubmissionStatus assignmentId={i.id} learnerId={me.id} /> : i.q.scores[me.id] !== undefined ? <Badge tone="success">{i.q.scores[me.id]}/{i.q.maxScore}</Badge> : <Badge tone="neutral">{i.q.minutes} دقيقة · من {deg(i.q.maxScore)}</Badge>}
                {i.kind === 'a' && !sub && !isPast(i.at) && <button className="btn btn-primary btn-sm" onClick={() => setSubmit(i.a)}><Upload />تسليم</button>}
              </div>
            </div>
          )
        })}
      </div>
      {!list.length && <div className="card"><Empty title={view === 'upcoming' ? 'لا توجد مهام قادمة' : 'لا توجد مهام منتهية'} /></div>}
      {submit && <SubmitModal assignment={submit} onClose={() => setSubmit(null)} />}
    </div>
  )
}

const serviceTypes = ['إفادة انتظام', 'كشف درجات', 'تعريف بالبرنامج', 'طلب تأجيل']
function Services() {
  const { state, mutate, toast } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const [type, setType] = useState(serviceTypes[0])
  const [details, setDetails] = useState('')
  const mine = state.services.filter((s) => s.learnerId === me.id)
  const send = (e: React.FormEvent) => {
    e.preventDefault()
    mutate((d) => { d.services.unshift({ id: newId('SR'), learnerId: me.id, type, details: details || '—', at: new Date().toISOString(), status: 'pending' }) },
      { actor: me.name, text: `طلب خدمة أكاديمية: ${type}`, kind: 'academic' })
    setDetails('')
    toast(`أُرسل طلب «${type}» إلى الإدارة`)
  }
  return (
    <div className="main-aside">
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>طلباتي</h2>
        {mine.length ? (
          <div className="list">
            {mine.map((r) => (
              <div key={r.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                <div className="icon-tile"><FileText /></div>
                <div className="grow">
                  <div className="row between wrap"><span className="bold">{r.type}</span><Badge tone={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>{r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</Badge></div>
                  <div className="xs muted">{fDate(r.at)} · {r.details}</div>
                  {r.reply && <div className="small" style={{ marginTop: 6, padding: '8px 12px', background: 'var(--gold-50)', borderRadius: 8 }}><b>رد الإدارة:</b> {r.reply}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : <Empty title="لا توجد طلبات بعد" text="قدّم طلب خدمة أكاديمية من النموذج المجاور." />}
      </div>
      <form className="card stack" onSubmit={send}>
        <h2 className="card-title">طلب خدمة جديدة</h2>
        <Field label="نوع الخدمة" htmlFor="sv-t"><select id="sv-t" className="select" value={type} onChange={(e) => setType(e.target.value)}>{serviceTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="تفاصيل (اختياري)" htmlFor="sv-d"><textarea id="sv-d" className="textarea" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="مثال: لتقديمها إلى جهة العمل" /></Field>
        <button className="btn btn-primary" type="submit"><Send />إرسال الطلب</button>
      </form>
    </div>
  )
}

function Certs() {
  const { state } = useStore()
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const program = state.programs.find((p) => p.id === MAIN_PROGRAM)!
  return (
    <div className="stack lg">
      <Callout tone="warning">البطاقة الرقمية والشهادة معاينات تجريبية لتوضيح الشكل فقط، ولا تحمل أي تحقق رسمي.</Callout>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card stack">
          <div className="row"><IdCard size={20} color="var(--gold-700)" /><h2 className="card-title">البطاقة الرقمية</h2></div>
          <div className="id-card">
            <img src="/brand/logo-h-dark.png" alt="" style={{ height: 26, width: 'auto', alignSelf: 'flex-start' }} />
            <div className="row" style={{ gap: 14 }}>
              <Avatar name={me.name} size="lg" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{me.name}</div>
                <div className="xs" style={{ color: '#BDB7AD' }}>{program.title}</div>
              </div>
            </div>
            <div className="row between xs" style={{ color: '#BDB7AD' }}>
              <span>الرقم التدريبي <b className="ltr" style={{ color: '#fff' }}>{me.code}</b></span>
              <span>شعبة <b className="ltr" style={{ color: '#fff' }}>{me.sectionId}</b></span>
            </div>
            <div className="watermark" style={{ color: 'rgba(255,255,255,.07)', fontSize: 38 }}>معاينة تجريبية</div>
          </div>
        </div>
        <div className="card stack">
          <div className="row"><Award size={20} color="var(--gold-700)" /><h2 className="card-title">شهادة إتمام مقرر</h2></div>
          <div className="cert">
            <div className="watermark">معاينة تجريبية</div>
            <img src="/brand/logo-h.png" alt="" style={{ height: 34, width: 'auto', margin: '0 auto' }} />
            <div className="eyebrow" style={{ marginTop: 18 }}>شهادة إتمام</div>
            <div className="small muted" style={{ marginTop: 10 }}>يشهد المعهد بأن المتدرب</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{me.name}</div>
            <div className="small muted" style={{ marginTop: 8 }}>قد أتم محتوى مقرر <b style={{ color: 'var(--text)' }}>مبادئ إدارة المشاريع</b> ضمن {program.title}</div>
            <div className="xs muted" style={{ marginTop: 14 }}>{fDateY(new Date().toISOString())}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
