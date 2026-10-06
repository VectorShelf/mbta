import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Download, Check, X, Eye, Printer, Settings2, Activity as ActivityIcon, FileText, UserPlus, Archive } from 'lucide-react'
import { useStore } from '../../store/store'
import { Tabs, Badge, Modal, Field, Empty, Avatar, Callout, AttBadge } from '../../components/ui'
import { LearnerSummary } from '../trainer/SectionPage'
import { attendanceStats, csvDownload, pct } from '../../lib/calc'
import { fDate, fDateTime, relDay, fTime, iso } from '../../lib/format'
import type { Application, ServiceRequest } from '../../data/types'

type Tab = 'list' | 'attendance' | 'excuses' | 'admissions' | 'requests' | 'archive' | 'activity'
const ADMIN = 'خالد الحربي'

export default function LearnersAdmin() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'list'
  const count = {
    admissions: state.applications.filter((a) => a.status === 'new' || a.status === 'review').length,
    excuses: state.excuses.filter((e) => e.status === 'pending').length,
    requests: state.services.filter((s) => s.status === 'pending').length,
  }
  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">المتدربون والقبول</h1><p className="page-sub">السجلات والحضور والأعذار وطلبات القبول والخدمات الأكاديمية</p></div></div>
      <Tabs value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} tabs={[
        { id: 'list', label: 'المتدربون' }, { id: 'attendance', label: 'الحضور' }, { id: 'excuses', label: 'الأعذار', count: count.excuses },
        { id: 'admissions', label: 'طلبات القبول', count: count.admissions }, { id: 'requests', label: 'الطلبات الأكاديمية', count: count.requests },
        { id: 'archive', label: 'الأرشيف' }, { id: 'activity', label: 'سجل النشاط' },
      ]} />
      {tab === 'list' && <ListTab />}
      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'excuses' && <ExcusesTab />}
      {tab === 'admissions' && <AdmissionsTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'archive' && <ArchiveTab />}
      {tab === 'activity' && <ActivityTab />}
    </div>
  )
}

function ListTab() {
  const { state, toast } = useStore()
  const [q, setQ] = useState('')
  const [sec, setSec] = useState('all')
  const [lvl, setLvl] = useState('all')
  const [open, setOpen] = useState<string | null>(null)
  const rows = useMemo(() => state.learners
    .filter((l) => l.status !== 'archived')
    .map((l) => ({ l, st: attendanceStats(state, l.id, l.sectionId) }))
    .filter(({ l, st }) =>
      (sec === 'all' || (sec === 'none' ? !l.sectionId : l.sectionId === sec)) &&
      (lvl === 'all' || st.level === lvl) &&
      (!q.trim() || l.name.includes(q.trim()) || l.code.includes(q.trim()))), [state, q, sec, lvl])
  const exportCsv = () => {
    csvDownload('learners.csv', [['الاسم', 'الرقم التدريبي', 'البريد', 'الشعبة', 'الحالة', 'نسبة الغياب'], ...rows.map(({ l, st }) => [l.name, l.code, l.email, l.sectionId ?? 'غير مسند', l.status === 'new' ? 'مقبول جديد' : 'نشط', st.held ? pct(st.absencePct, 1) : '—'])])
    toast(`نُزّل ملف CSV يضم ${rows.length} سجلًا`)
  }
  const sel = open ? state.learners.find((l) => l.id === open) : null
  return (
    <div className="card pad-0">
      <div className="toolbar">
        <div className="search"><Search /><input className="input" placeholder="ابحث بالاسم أو الرقم التدريبي" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" /></div>
        <select className="select" value={sec} onChange={(e) => setSec(e.target.value)} aria-label="الشعبة">
          <option value="all">كل الشعب</option>
          {state.sections.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.title}</option>)}
          <option value="none">غير مسند</option>
        </select>
        <select className="select" value={lvl} onChange={(e) => setLvl(e.target.value)} aria-label="حالة الحضور">
          <option value="all">كل حالات الحضور</option><option value="ok">منتظم</option><option value="warn">يحتاج متابعة</option><option value="alert">تجاوز حد التنبيه</option>
        </select>
        <button className="btn btn-secondary" onClick={exportCsv} disabled={!rows.length}><Download />CSV</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>المتدرب</th><th>الرقم</th><th>الشعبة</th><th>الحضور</th><th>الحالة</th></tr></thead>
          <tbody>
            {rows.map(({ l, st }) => (
              <tr key={l.id} className="clickable" tabIndex={0} onClick={() => setOpen(l.id)} onKeyDown={(e) => e.key === 'Enter' && setOpen(l.id)}>
                <td><div className="row" style={{ gap: 10 }}><Avatar name={l.name} /><div><div className="bold">{l.name}</div><div className="xs muted ltr">{l.email}</div></div></div></td>
                <td><span className="ltr small">{l.code}</span></td>
                <td>{l.sectionId ? <span className="badge neutral plain ltr">{l.sectionId}</span> : <Badge tone="warning">غير مسند</Badge>}</td>
                <td>{!st.held ? <span className="muted small">—</span> : st.level === 'alert' ? <Badge tone="danger">غياب {pct(st.absencePct, 1)}</Badge> : st.level === 'warn' ? <Badge tone="warning">غياب {pct(st.absencePct, 1)}</Badge> : <Badge tone="success">منتظم</Badge>}</td>
                <td>{l.status === 'new' ? <Badge tone="info">مقبول جديد</Badge> : <Badge tone="success">نشط</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty title="لا توجد سجلات مطابقة" action={<button className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setSec('all'); setLvl('all') }}>إزالة التصفية</button>} />}
      </div>
      <div className="small muted" style={{ padding: 16, borderTop: '1px solid var(--border)' }}>{rows.length} سجل · اضغط على الصف لعرض ملف المتدرب</div>
      {sel && (sel.sectionId
        ? <LearnerSummary learnerId={sel.id} sectionId={sel.sectionId} onClose={() => setOpen(null)} />
        : <Modal title={sel.name} sub={<span className="ltr">{sel.code} · {sel.email}</span>} onClose={() => setOpen(null)}><Callout>متدرب مقبول حديثًا ولم يُسند إلى شعبة بعد.</Callout><dl className="kv"><dt>تاريخ القبول</dt><dd>{fDate(sel.joined)}</dd><dt>ملاحظة</dt><dd>{sel.note ?? '—'}</dd></dl></Modal>)}
    </div>
  )
}

function AttendanceTab() {
  const { state, mutate, toast } = useStore()
  const [threshold, setThreshold] = useState(String(state.settings.absenceThreshold))
  const [secId, setSecId] = useState(state.sections.find((s) => state.sessions.some((x) => x.sectionId === s.id && x.status === 'held'))?.id ?? '')
  const section = state.sections.find((s) => s.id === secId)
  const held = state.sessions.filter((s) => s.sectionId === secId && s.status === 'held').sort((a, b) => a.at.localeCompare(b.at))
  const n = Number(threshold)
  return (
    <div className="stack lg">
      <div className="card row wrap" style={{ gap: 16 }}>
        <div className="icon-tile"><Settings2 /></div>
        <div className="grow" style={{ minWidth: 220 }}><div className="bold">حد تنبيه الغياب (إعداد تجريبي)</div><div className="small muted">النسبة = الغياب غير المعذور ÷ اللقاءات المنعقدة. التنبيه منفصل عن قرار الحرمان، ولا يُطبَّق حرمان تلقائي.</div></div>
        <div className="row" style={{ gap: 8 }}>
          <input className="input" style={{ width: 90 }} dir="ltr" inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value)} aria-label="حد التنبيه بالنسبة المئوية" />
          <span>%</span>
          <button className="btn btn-primary btn-sm" disabled={!(n >= 5 && n <= 60) || n === state.settings.absenceThreshold} onClick={() => {
            mutate((d) => { d.settings.absenceThreshold = n }, { actor: ADMIN, text: `تعديل حد تنبيه الغياب إلى ${n}%`, kind: 'attendance' })
            toast(`عُدّل حد التنبيه إلى ${n}% — حُدّثت المؤشرات`)
          }}>حفظ</button>
        </div>
      </div>
      <div className="card pad-0">
        <div className="toolbar">
          <select className="select" value={secId} onChange={(e) => setSecId(e.target.value)} aria-label="الشعبة">
            {state.sections.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.title}</option>)}
          </select>
          <span className="small muted">{held.length} لقاءات منعقدة</span>
        </div>
        {section && held.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>المتدرب</th>{held.map((h, i) => <th key={h.id} title={h.title}>ل{i + 1}</th>)}<th>الغياب</th></tr></thead>
              <tbody>
                {section.learnerIds.map((lid) => {
                  const l = state.learners.find((x) => x.id === lid)!
                  const st = attendanceStats(state, lid, secId)
                  return (
                    <tr key={lid}>
                      <td className="bold nowrap">{l.name}</td>
                      {held.map((h) => <td key={h.id}><AttBadge s={state.attendance.find((a) => a.sessionId === h.id && a.learnerId === lid)?.status} /></td>)}
                      <td><Badge tone={st.level === 'alert' ? 'danger' : st.level === 'warn' ? 'warning' : 'success'}>{pct(st.absencePct, 1)}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty title="لا توجد لقاءات منعقدة لهذه الشعبة" text="الدورات المسجلة ذاتية الوتيرة لا تحتوي لقاءات حضور." />}
      </div>
    </div>
  )
}

function ExcusesTab() {
  const { state, mutate, toast } = useStore()
  const list = [...state.excuses].sort((a, b) => Number(a.status !== 'pending') - Number(b.status !== 'pending') || b.at.localeCompare(a.at))
  const decide = (id: string, accept: boolean) => {
    const ex = state.excuses.find((e) => e.id === id)!
    const l = state.learners.find((x) => x.id === ex.learnerId)!
    const s = state.sessions.find((x) => x.id === ex.sessionId)!
    const before = attendanceStats(state, l.id, l.sectionId)
    mutate((d) => {
      d.excuses.find((e) => e.id === id)!.status = accept ? 'accepted' : 'rejected'
      if (accept) {
        const rec = d.attendance.find((a) => a.sessionId === ex.sessionId && a.learnerId === ex.learnerId)
        if (rec) rec.status = 'excused'
        else d.attendance.push({ sessionId: ex.sessionId, learnerId: ex.learnerId, status: 'excused' })
      }
    }, { actor: ADMIN, text: `${accept ? 'قبول' : 'رفض'} عذر ${l.name} عن لقاء «${s.title}»`, kind: 'attendance' })
    if (accept) {
      const wasAbsent = state.attendance.find((a) => a.sessionId === ex.sessionId && a.learnerId === ex.learnerId)?.status === 'absent'
      const after = before.held ? ((before.absent - (wasAbsent ? 1 : 0)) / before.held) * 100 : 0
      toast(`قُبل العذر — حالة ${l.name} أصبحت «بعذر»، ونسبة غيابه ${pct(before.absencePct, 1)} ← ${pct(Math.max(0, after), 1)}`)
    } else toast(`رُفض العذر — يبقى الغياب محتسبًا`)
  }
  return (
    <div className="stack">
      <Callout>قاعدة الديمو المعلنة: قبول العذر يغيّر حالة اللقاء إلى «بعذر»، والغياب بعذر مقبول لا يدخل في نسبة الغياب.</Callout>
      {list.length ? list.map((e) => {
        const l = state.learners.find((x) => x.id === e.learnerId)!
        const s = state.sessions.find((x) => x.id === e.sessionId)!
        const rec = state.attendance.find((a) => a.sessionId === e.sessionId && a.learnerId === e.learnerId)
        return (
          <div key={e.id} className="card row wrap" style={{ gap: 16 }}>
            <Avatar name={l.name} />
            <div className="grow" style={{ minWidth: 220 }}>
              <div className="row wrap" style={{ gap: 8 }}><b>{l.name}</b><span className="badge neutral plain ltr">{l.sectionId}</span><AttBadge s={rec?.status} /></div>
              <div className="small muted" style={{ marginTop: 4 }}>لقاء «{s.title}» · {fDate(s.at)}</div>
              <div className="small" style={{ marginTop: 6 }}>السبب: {e.reason}{e.fileName && <span className="muted"> · مرفق: {e.fileName}</span>}</div>
            </div>
            {e.status === 'pending' ? (
              <div className="row">
                <button className="btn btn-success btn-sm" onClick={() => decide(e.id, true)}><Check />قبول العذر</button>
                <button className="btn btn-danger btn-sm" onClick={() => decide(e.id, false)}><X />رفض</button>
              </div>
            ) : <Badge tone={e.status === 'accepted' ? 'success' : 'danger'}>{e.status === 'accepted' ? 'مقبول' : 'مرفوض'}</Badge>}
          </div>
        )
      }) : <div className="card"><Empty title="لا توجد أعذار" /></div>}
    </div>
  )
}

const appStatus: Record<Application['status'], { t: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  new: { t: 'جديد', tone: 'info' }, review: { t: 'قيد المراجعة', tone: 'warning' }, accepted: { t: 'مقبول', tone: 'success' }, rejected: { t: 'مرفوض', tone: 'danger' },
}
function AdmissionsTab() {
  const { state, mutate, toast } = useStore()
  const [view, setView] = useState<Application | null>(null)
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const list = state.applications.filter((a) => filter === 'all' || a.status === 'new' || a.status === 'review').sort((a, b) => b.at.localeCompare(a.at))
  const setStatus = (a: Application, status: Application['status']) => {
    mutate((d) => { d.applications.find((x) => x.id === a.id)!.status = status }, { actor: ADMIN, text: `${status === 'review' ? 'بدء مراجعة' : 'رفض'} طلب ${a.name}`, kind: 'admission' })
    toast(status === 'review' ? `طلب ${a.name} قيد المراجعة الآن` : `رُفض طلب ${a.name}`)
  }
  return (
    <div className="card pad-0">
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="التصفية">
          <button aria-pressed={filter === 'open'} onClick={() => setFilter('open')}>بانتظار القرار</button>
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>كل الطلبات</button>
        </div>
        <span className="small muted">الطلبات القادمة من نموذج التقديم في الموقع تظهر هنا فورًا</span>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>المتقدم</th><th>البرنامج</th><th>التاريخ</th><th>المصدر</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td><div className="bold">{a.name}</div><div className="xs muted ltr">{a.email}</div></td>
                  <td className="small">{state.programs.find((p) => p.id === a.programId)?.title}</td>
                  <td className="small nowrap">{relDay(a.at)} · {fTime(a.at)}</td>
                  <td className="small">{a.source}</td>
                  <td><Badge tone={appStatus[a.status].tone}>{appStatus[a.status].t}</Badge></td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      {(a.status === 'new' || a.status === 'review') && <button className="btn btn-primary btn-sm" onClick={() => setView(a)}><Eye />مراجعة وقبول</button>}
                      {a.status === 'new' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(a, 'review')}>قيد المراجعة</button>}
                      {(a.status === 'new' || a.status === 'review') && <button className="btn btn-danger btn-sm" onClick={() => setStatus(a, 'rejected')} aria-label={`رفض ${a.name}`}><X /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty icon={<UserPlus />} title="لا توجد طلبات بانتظار القرار" text="قدّم طلبًا من صفحة أي برنامج في الموقع ليظهر هنا." />}
      {view && <AcceptModal app={view} onClose={() => setView(null)} />}
    </div>
  )
}

function AcceptModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const { state, mutate, toast } = useStore()
  const program = state.programs.find((p) => p.id === app.programId)!
  const sections = state.sections.filter((s) => s.programId === app.programId)
  const [sec, setSec] = useState(sections[0]?.id ?? '')
  const accept = () => {
    const next = state.learners.filter((l) => l.code.startsWith('S2026')).length + 1
    const code = `S2026${String(next).padStart(3, '0')}`
    const id = `L${Date.now().toString(36)}`
    mutate((d) => {
      d.applications.find((x) => x.id === app.id)!.status = 'accepted'
      d.learners.push({ id, code, name: app.name, email: app.email, phone: app.phone, sectionId: sec || null, status: sec ? 'active' : 'new', joined: new Date().toISOString(), note: `قُبل في ${program.title}` })
      if (sec) d.sections.find((s) => s.id === sec)!.learnerIds.push(id)
    }, { actor: ADMIN, text: `قبول ${app.name} في «${program.title}»${sec ? ` وإسناده لشعبة ${iso(sec)}` : ''}`, kind: 'admission' })
    toast(`قُبل ${app.name} برقم تدريبي ${code}${sec ? ` في شعبة ${iso(sec)}` : ''}`)
    onClose()
  }
  return (
    <Modal title="مراجعة طلب القبول" sub={program.title} onClose={onClose} footer={<>
      <button className="btn btn-success" onClick={accept}><Check />قبول المتقدم</button>
      <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
    </>}>
      <dl className="kv">
        <dt>الاسم</dt><dd>{app.name}</dd>
        <dt>البريد</dt><dd><span className="ltr">{app.email}</span></dd>
        <dt>الجوال</dt><dd><span className="ltr">{app.phone || '—'}</span></dd>
        <dt>تاريخ الطلب</dt><dd>{fDateTime(app.at)}</dd>
        <dt>المصدر</dt><dd>{app.source}</dd>
      </dl>
      <Field label="الإسناد إلى شعبة" htmlFor="acc-s" hint="يمكن القبول دون إسناد ثم إسناده لاحقًا">
        <select id="acc-s" className="select" value={sec} onChange={(e) => setSec(e.target.value)}>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.title} ({s.learnerIds.length} متدربين)</option>)}
          <option value="">بدون إسناد الآن</option>
        </select>
      </Field>
      <p className="xs muted">القبول ينشئ سجل متدرب تجريبيًا فقط؛ لا تُرسل رسائل أو بيانات دخول.</p>
    </Modal>
  )
}

function RequestsTab() {
  const { state } = useStore()
  const [reply, setReply] = useState<ServiceRequest | null>(null)
  const list = [...state.services].sort((a, b) => Number(a.status !== 'pending') - Number(b.status !== 'pending') || b.at.localeCompare(a.at))
  return (
    <div className="card pad-0">
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>المتدرب</th><th>الطلب</th><th>التفاصيل</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {list.map((r) => {
                const l = state.learners.find((x) => x.id === r.learnerId)!
                return (
                  <tr key={r.id}>
                    <td className="bold nowrap">{l.name}</td>
                    <td><div className="row" style={{ gap: 6 }}><FileText size={16} color="var(--gold-700)" />{r.type}</div></td>
                    <td className="small muted">{r.details}{r.reply && <div style={{ color: 'var(--text)' }}>الرد: {r.reply}</div>}</td>
                    <td className="small nowrap">{relDay(r.at)}</td>
                    <td><Badge tone={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>{r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</Badge></td>
                    <td>{r.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => setReply(r)}>معالجة</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty title="لا توجد طلبات" />}
      {reply && <ReplyModal req={reply} onClose={() => setReply(null)} />}
    </div>
  )
}

function ReplyModal({ req, onClose }: { req: ServiceRequest; onClose: () => void }) {
  const { state, mutate, toast } = useStore()
  const l = state.learners.find((x) => x.id === req.learnerId)!
  const [text, setText] = useState(req.type === 'إفادة انتظام' ? 'تم إصدار الإفادة ويمكن استلامها من بوابة المتدرب (معاينة تجريبية).' : 'تمت معالجة طلبك.')
  const decide = (approve: boolean) => {
    mutate((d) => { const r = d.services.find((x) => x.id === req.id)!; r.status = approve ? 'approved' : 'rejected'; r.reply = text.trim() || undefined },
      { actor: ADMIN, text: `${approve ? 'اعتماد' : 'رفض'} طلب «${req.type}» للمتدرب ${l.name}`, kind: 'academic' })
    toast(`${approve ? 'اعتُمد' : 'رُفض'} الطلب — يظهر الرد للمتدرب ${l.name}`)
    onClose()
  }
  return (
    <Modal title={`طلب ${req.type}`} sub={`${l.name} · ${fDate(req.at)}`} onClose={onClose} footer={<>
      <button className="btn btn-success" onClick={() => decide(true)}><Check />اعتماد</button>
      <button className="btn btn-danger" onClick={() => decide(false)}><X />رفض</button>
    </>}>
      <p className="small"><b>التفاصيل:</b> <span className="muted">{req.details}</span></p>
      <Field label="الرد الظاهر للمتدرب" htmlFor="rp-t"><textarea id="rp-t" className="textarea" value={text} onChange={(e) => setText(e.target.value)} /></Field>
    </Modal>
  )
}

function ArchiveTab() {
  const { state } = useStore()
  const list = state.learners.filter((l) => l.status === 'archived')
  return (
    <div className="card pad-0">
      <div className="toolbar"><Archive size={18} color="var(--text-2)" /><span className="small muted">سجلات مؤرشفة للقراءة فقط — لا تدخل في أعداد المتدربين النشطين</span><div className="grow" /><button className="btn btn-secondary btn-sm" onClick={() => window.print()}><Printer />طباعة</button></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>الاسم</th><th>الرقم</th><th>تاريخ الالتحاق</th><th>سبب الأرشفة</th></tr></thead>
          <tbody>{list.map((l) => <tr key={l.id}><td className="bold">{l.name}</td><td><span className="ltr small">{l.code}</span></td><td className="small">{fDate(l.joined)}</td><td className="small muted">{l.note}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

const kinds = { all: 'الكل', admission: 'القبول', academic: 'أكاديمي', attendance: 'الحضور', content: 'المحتوى', ops: 'التشغيل' } as const
function ActivityTab() {
  const { state } = useStore()
  const [k, setK] = useState<keyof typeof kinds>('all')
  const list = state.activity.filter((a) => k === 'all' || a.kind === k)
  return (
    <div className="card">
      <div className="segmented" role="group" aria-label="نوع النشاط" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.keys(kinds) as (keyof typeof kinds)[]).map((x) => <button key={x} aria-pressed={k === x} onClick={() => setK(x)}>{kinds[x]}</button>)}
      </div>
      {list.length ? (
        <div className="list">
          {list.map((a) => (
            <div key={a.id} className="list-item">
              <div className="icon-tile" style={{ width: 34, height: 34 }}><ActivityIcon size={16} /></div>
              <div className="grow"><div className="small">{a.text}</div><div className="xs muted">{a.actor} · {fDateTime(a.at)}</div></div>
              <Badge tone="neutral">{kinds[a.kind]}</Badge>
            </div>
          ))}
        </div>
      ) : <Empty title="لا توجد نشاطات من هذا النوع" />}
    </div>
  )
}
