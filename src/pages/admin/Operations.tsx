import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, X, Plus, Download, Printer, Save, ExternalLink, CalendarDays, Flag } from 'lucide-react'
import { useStore, newId } from '../../store/store'
import { Tabs, Badge, Modal, Field, Empty, Avatar, Callout } from '../../components/ui'
import { attendanceStats, csvDownload, lessonProgress, pct } from '../../lib/calc'
import { fDate, relDay } from '../../lib/format'
import type { Staff, Task } from '../../data/types'

type Tab = 'team' | 'leaves' | 'tasks' | 'reports' | 'site'
const ADMIN = 'خالد الحربي'
const workLabel: Record<Staff['work'], { t: string; tone: 'success' | 'info' | 'warning' | 'neutral' }> = {
  office: { t: 'في المكتب', tone: 'success' }, remote: { t: 'عن بُعد', tone: 'info' }, leave: { t: 'في إجازة', tone: 'warning' }, off: { t: 'لم يسجّل', tone: 'neutral' },
}

export default function Operations() {
  const { state } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'tasks'
  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">تشغيل المعهد</h1><p className="page-sub">الفريق والدوام والإجازات والمهام والتقارير ومحتوى الموقع</p></div></div>
      <Tabs value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} tabs={[
        { id: 'tasks', label: 'المهام' }, { id: 'team', label: 'الفريق والدوام' }, { id: 'leaves', label: 'الإجازات', count: state.leaves.filter((l) => l.status === 'pending').length },
        { id: 'reports', label: 'التقارير' }, { id: 'site', label: 'محتوى الموقع' },
      ]} />
      {tab === 'team' && <TeamTab />}
      {tab === 'leaves' && <LeavesTab />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'site' && <SiteTab />}
    </div>
  )
}

function TeamTab() {
  const { state, mutate, toast } = useStore()
  return (
    <div className="stack">
      <Callout>حالة الدوام تجريبية تُحدَّث يدويًا للعرض؛ لا تكامل مع أنظمة البصمة أو الرواتب أو الجهات الحكومية.</Callout>
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>الموظف</th><th>الإدارة</th><th>المهام المفتوحة</th><th>حالة الدوام اليوم</th></tr></thead>
            <tbody>
              {state.staff.map((s) => (
                <tr key={s.id}>
                  <td><div className="row" style={{ gap: 10 }}><Avatar name={s.name} /><div><div className="bold">{s.name}</div><div className="xs muted">{s.role}</div></div></div></td>
                  <td className="small">{s.dept}</td>
                  <td>{state.tasks.filter((t) => t.staffId === s.id && t.status !== 'done').length}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Badge tone={workLabel[s.work].tone}>{workLabel[s.work].t}</Badge>
                      <select className="select" style={{ width: 'auto', height: 34 }} value={s.work} aria-label={`حالة دوام ${s.name}`} onChange={(e) => {
                        const v = e.target.value as Staff['work']
                        mutate((d) => { d.staff.find((x) => x.id === s.id)!.work = v }, { actor: ADMIN, text: `تحديث حالة دوام ${s.name}: ${workLabel[v].t}`, kind: 'ops' })
                        toast(`حُدّثت حالة دوام ${s.name}`)
                      }}>
                        {(Object.keys(workLabel) as Staff['work'][]).map((k) => <option key={k} value={k}>{workLabel[k].t}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function LeavesTab() {
  const { state, mutate, toast } = useStore()
  const [create, setCreate] = useState(false)
  const d0 = new Date(); d0.setDate(d0.getDate() + 5)
  const [f, setF] = useState({ staffId: state.staff[1].id, type: 'إجازة سنوية', from: d0.toISOString().slice(0, 10), days: '2', note: '' })
  const list = [...state.leaves].sort((a, b) => Number(a.status !== 'pending') - Number(b.status !== 'pending') || b.from.localeCompare(a.from))
  const decide = (id: string, approve: boolean) => {
    const lv = state.leaves.find((l) => l.id === id)!
    const st = state.staff.find((s) => s.id === lv.staffId)!
    mutate((d) => { d.leaves.find((l) => l.id === id)!.status = approve ? 'approved' : 'rejected' }, { actor: ADMIN, text: `${approve ? 'اعتماد' : 'رفض'} ${lv.type} لـ${st.name} (${lv.days} أيام)`, kind: 'ops' })
    toast(`${approve ? 'اعتُمدت' : 'رُفضت'} ${lv.type} لـ${st.name}`)
  }
  return (
    <div className="stack">
      <div className="row between wrap"><span className="small muted">{list.filter((l) => l.status === 'pending').length} طلبات بانتظار الاعتماد</span><button className="btn btn-primary" onClick={() => setCreate(true)}><Plus />طلب إجازة</button></div>
      <div className="card pad-0">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>الموظف</th><th>النوع</th><th>الفترة</th><th>الأيام</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {list.map((l) => {
                const s = state.staff.find((x) => x.id === l.staffId)!
                return (
                  <tr key={l.id}>
                    <td><div className="row" style={{ gap: 10 }}><Avatar name={s.name} /><span className="bold nowrap">{s.name}</span></div></td>
                    <td className="small">{l.type}{l.note && <div className="xs muted">{l.note}</div>}</td>
                    <td className="small nowrap">{fDate(l.from)}{l.days > 1 ? ` – ${fDate(l.to)}` : ''}</td>
                    <td>{l.days}</td>
                    <td><Badge tone={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>{l.status === 'approved' ? 'معتمدة' : l.status === 'rejected' ? 'مرفوضة' : 'بانتظار الاعتماد'}</Badge></td>
                    <td>{l.status === 'pending' && <div className="row" style={{ gap: 6 }}><button className="btn btn-success btn-sm" onClick={() => decide(l.id, true)}><Check />اعتماد</button><button className="btn btn-danger btn-sm" onClick={() => decide(l.id, false)} aria-label="رفض"><X /></button></div>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {create && (
        <Modal title="طلب إجازة" onClose={() => setCreate(false)} footer={<>
          <button className="btn btn-primary" disabled={!(Number(f.days) >= 1 && Number(f.days) <= 30)} onClick={() => {
            const from = new Date(f.from + 'T08:00:00'); const to = new Date(from); to.setDate(to.getDate() + Number(f.days) - 1)
            const st = state.staff.find((s) => s.id === f.staffId)!
            mutate((d) => { d.leaves.push({ id: newId('LV'), staffId: f.staffId, type: f.type, from: from.toISOString(), to: to.toISOString(), days: Number(f.days), status: 'pending', note: f.note }) }, { actor: st.name, text: `طلب ${f.type} (${f.days} أيام)`, kind: 'ops' })
            toast('أُنشئ طلب الإجازة بانتظار الاعتماد'); setCreate(false)
          }}><Plus />إرسال الطلب</button>
          <button className="btn btn-secondary" onClick={() => setCreate(false)}>إلغاء</button>
        </>}>
          <Field label="الموظف" htmlFor="lv-s"><select id="lv-s" className="select" value={f.staffId} onChange={(e) => setF({ ...f, staffId: e.target.value })}>{state.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="نوع الإجازة" htmlFor="lv-t"><select id="lv-t" className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{['إجازة سنوية', 'إجازة اضطرارية', 'إجازة مرضية'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Field label="من تاريخ" htmlFor="lv-f"><input id="lv-f" type="date" className="input" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
            <Field label="عدد الأيام" htmlFor="lv-d"><input id="lv-d" className="input" inputMode="numeric" dir="ltr" style={{ textAlign: 'right' }} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} /></Field>
          </div>
          <Field label="ملاحظة (اختياري)" htmlFor="lv-n"><input id="lv-n" className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  )
}

const cols: { id: Task['status']; t: string }[] = [{ id: 'planned', t: 'مخطط' }, { id: 'doing', t: 'قيد التنفيذ' }, { id: 'review', t: 'للمراجعة' }, { id: 'done', t: 'مكتمل' }]
const prio = { high: { t: 'عالية', tone: 'danger' as const }, normal: { t: 'عادية', tone: 'neutral' as const }, low: { t: 'منخفضة', tone: 'info' as const } }
function TasksTab() {
  const { state, mutate, toast } = useStore()
  const [create, setCreate] = useState(false)
  const [f, setF] = useState({ title: '', staffId: state.staff[0].id, priority: 'normal' as Task['priority'], days: '5' })
  const move = (t: Task, status: Task['status']) => {
    mutate((d) => { d.tasks.find((x) => x.id === t.id)!.status = status }, { actor: ADMIN, text: `نقل مهمة «${t.title}» إلى ${cols.find((c) => c.id === status)!.t}`, kind: 'ops' })
    toast(`نُقلت المهمة إلى «${cols.find((c) => c.id === status)!.t}»`)
  }
  const reassign = (t: Task, staffId: string) => {
    const s = state.staff.find((x) => x.id === staffId)!
    mutate((d) => { d.tasks.find((x) => x.id === t.id)!.staffId = staffId }, { actor: ADMIN, text: `ربط مهمة «${t.title}» بـ${s.name}`, kind: 'ops' })
    toast(`رُبطت المهمة بـ${s.name}`)
  }
  return (
    <div className="stack">
      <div className="row between wrap"><span className="small muted">{state.tasks.length} مهام · انقل البطاقة عبر قائمة «نقل إلى»</span><button className="btn btn-primary" onClick={() => setCreate(true)}><Plus />مهمة جديدة</button></div>
      <div className="kanban">
        {cols.map((c) => {
          const items = state.tasks.filter((t) => t.status === c.id)
          return (
            <section key={c.id} className="kanban-col" aria-label={c.t}>
              <div className="kanban-col-head"><span>{c.t}</span><span className="badge neutral plain">{items.length}</span></div>
              {items.map((t) => {
                const s = state.staff.find((x) => x.id === t.staffId)!
                const overdue = t.status !== 'done' && new Date(t.due).getTime() < Date.now()
                return (
                  <article key={t.id} className="task">
                    <div className="task-title">{t.title}</div>
                    <div className="row wrap" style={{ gap: 6 }}>
                      <Badge tone={prio[t.priority].tone}><Flag size={11} />{prio[t.priority].t}</Badge>
                      <span className={`xs row ${overdue ? '' : 'muted'}`} style={{ gap: 4, color: overdue ? 'var(--danger)' : undefined }}><CalendarDays size={13} />{relDay(t.due)}</span>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar name={s.name} />
                      <select className="select" style={{ height: 32, fontSize: 13, padding: '0 8px' }} value={t.staffId} onChange={(e) => reassign(t, e.target.value)} aria-label="المسؤول">
                        {state.staff.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                    </div>
                    <select className="select" style={{ height: 34, fontSize: 13 }} value="" onChange={(e) => e.target.value && move(t, e.target.value as Task['status'])} aria-label={`نقل مهمة ${t.title}`}>
                      <option value="">نقل إلى…</option>
                      {cols.filter((x) => x.id !== t.status).map((x) => <option key={x.id} value={x.id}>{x.t}</option>)}
                    </select>
                  </article>
                )
              })}
              {!items.length && <div className="xs muted" style={{ textAlign: 'center', padding: 16 }}>لا توجد مهام</div>}
            </section>
          )
        })}
      </div>
      {create && (
        <Modal title="مهمة جديدة" onClose={() => setCreate(false)} footer={<>
          <button className="btn btn-primary" disabled={f.title.trim().length < 3} onClick={() => {
            const due = new Date(); due.setDate(due.getDate() + Number(f.days || 0)); due.setHours(12, 0, 0, 0)
            const s = state.staff.find((x) => x.id === f.staffId)!
            mutate((d) => { d.tasks.push({ id: newId('TK'), title: f.title.trim(), staffId: f.staffId, status: 'planned', due: due.toISOString(), priority: f.priority }) }, { actor: ADMIN, text: `إنشاء مهمة «${f.title.trim()}» وربطها بـ${s.name}`, kind: 'ops' })
            toast('أُضيفت المهمة إلى عمود «مخطط»'); setCreate(false); setF({ ...f, title: '' })
          }}><Plus />إضافة</button>
          <button className="btn btn-secondary" onClick={() => setCreate(false)}>إلغاء</button>
        </>}>
          <Field label="عنوان المهمة" htmlFor="tk-t"><input id="tk-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <Field label="المسؤول" htmlFor="tk-s"><select id="tk-s" className="select" value={f.staffId} onChange={(e) => setF({ ...f, staffId: e.target.value })}>{state.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
            <Field label="الأولوية" htmlFor="tk-p"><select id="tk-p" className="select" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Task['priority'] })}><option value="high">عالية</option><option value="normal">عادية</option><option value="low">منخفضة</option></select></Field>
            <Field label="الاستحقاق بعد (أيام)" htmlFor="tk-d"><input id="tk-d" className="input" inputMode="numeric" dir="ltr" style={{ textAlign: 'right' }} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

type ReportId = 'learners' | 'attendance' | 'admissions'
function ReportsTab() {
  const { state, toast } = useStore()
  const [rep, setRep] = useState<ReportId>('learners')
  const [sec, setSec] = useState('all')
  const learners = state.learners.filter((l) => l.status !== 'archived' && (sec === 'all' || l.sectionId === sec))
  let head: string[] = []
  let rows: (string | number)[][] = []
  if (rep === 'learners') {
    head = ['الاسم', 'الرقم التدريبي', 'الشعبة', 'البرنامج', 'تقدم المحتوى']
    rows = learners.map((l) => {
      const s = state.sections.find((x) => x.id === l.sectionId)
      const lp = s ? lessonProgress(state, l.id, s.programId) : null
      return [l.name, l.code, l.sectionId ?? 'غير مسند', s ? state.programs.find((p) => p.id === s.programId)!.title : '—', lp && lp.total ? `${lp.done}/${lp.total} (${lp.pct}%)` : '—']
    })
  } else if (rep === 'attendance') {
    head = ['الاسم', 'الشعبة', 'منعقدة', 'حاضر', 'متأخر', 'غائب', 'بعذر', 'نسبة الغياب']
    rows = learners.map((l) => { const st = attendanceStats(state, l.id, l.sectionId); return [l.name, l.sectionId ?? '—', st.held, st.present, st.late, st.absent, st.excused, st.held ? pct(st.absencePct, 1) : '—'] })
  } else {
    head = ['المتقدم', 'البريد', 'البرنامج', 'التاريخ', 'الحالة']
    const map = { new: 'جديد', review: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض' }
    rows = state.applications.map((a) => [a.name, a.email, state.programs.find((p) => p.id === a.programId)?.title ?? '', fDate(a.at), map[a.status]])
  }
  const titles: Record<ReportId, string> = { learners: 'تقرير المتدربين والتقدم', attendance: 'تقرير الحضور', admissions: 'تقرير طلبات القبول' }
  return (
    <div className="stack">
      <div className="card tight row wrap no-print" style={{ gap: 12 }}>
        <div className="segmented" role="group" aria-label="نوع التقرير" style={{ flexWrap: 'wrap' }}>
          {(Object.keys(titles) as ReportId[]).map((r) => <button key={r} aria-pressed={rep === r} onClick={() => setRep(r)}>{titles[r]}</button>)}
        </div>
        {rep !== 'admissions' && (
          <select className="select" style={{ width: 'auto' }} value={sec} onChange={(e) => setSec(e.target.value)} aria-label="الشعبة">
            <option value="all">كل الشعب</option>{state.sections.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
          </select>
        )}
        <div className="grow" />
        <button className="btn btn-primary" disabled={!rows.length} onClick={() => { csvDownload(`${rep}-report.csv`, [head, ...rows]); toast(`نُزّل التقرير CSV (${rows.length} صفًا)`) }}><Download />تنزيل CSV</button>
        <button className="btn btn-secondary" onClick={() => window.print()}><Printer />طباعة</button>
      </div>
      <div className="card pad-0">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="bold" style={{ fontSize: 17 }}>{titles[rep]}</div>
          <div className="xs muted">معهد بوابة المستقبل العالي للتدريب · {fDate(new Date().toISOString())} · {rows.length} صفًا · بيانات تجريبية</div>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="table"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? 'bold' : 'small'}>{c}</td>)}</tr>)}</tbody></table>
          </div>
        ) : <Empty title="لا توجد بيانات لهذا التصفية" />}
      </div>
    </div>
  )
}

function SiteTab() {
  const { state, mutate, toast } = useStore()
  const [f, setF] = useState(state.site)
  const dirty = JSON.stringify(f) !== JSON.stringify(state.site)
  return (
    <div className="main-aside">
      <div className="card stack">
        <h2 className="card-title">واجهة الموقع الرئيسية</h2>
        <Field label="عنوان الواجهة" htmlFor="st-t"><input id="st-t" className="input" value={f.heroTitle} onChange={(e) => setF({ ...f, heroTitle: e.target.value })} /></Field>
        <Field label="النص المساند" htmlFor="st-s"><textarea id="st-s" className="textarea" rows={3} value={f.heroSub} onChange={(e) => setF({ ...f, heroSub: e.target.value })} /></Field>
        <Field label="تنبيه أسفل الواجهة (اختياري)" htmlFor="st-n" hint="مثال: يبدأ التسجيل في الفصل القادم قريبًا"><input id="st-n" className="input" value={f.notice} onChange={(e) => setF({ ...f, notice: e.target.value })} /></Field>
        <div className="row wrap">
          <button className="btn btn-primary" disabled={!dirty || f.heroTitle.trim().length < 3} onClick={() => {
            mutate((d) => { d.site = { heroTitle: f.heroTitle.trim(), heroSub: f.heroSub.trim(), notice: f.notice.trim() } }, { actor: ADMIN, text: 'تحديث محتوى واجهة الموقع', kind: 'content' })
            toast('نُشر التحديث على واجهة الموقع')
          }}><Save />نشر التحديث</button>
          <Link to="/" className="btn btn-secondary"><ExternalLink />معاينة الموقع</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>البرامج في الموقع</h2>
        <div className="list">
          {state.programs.map((p) => (
            <div key={p.id} className="list-item">
              <div className="grow"><div className="small bold">{p.title}</div><div className="xs muted">{p.featured ? 'مميز في الرئيسية' : 'في الكتالوج فقط'}</div></div>
              {p.published ? <Badge tone="success">منشور</Badge> : <Badge tone="neutral">مسودة</Badge>}
            </div>
          ))}
        </div>
        <Link to="/admin/education" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>تحرير البرامج من إدارة التعليم</Link>
      </div>
    </div>
  )
}

