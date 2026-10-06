import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, UserCog, Save, Users, Layers, BookOpen, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/store'
import { Tabs, Badge, Modal, Field, Avatar, Progress } from '../../components/ui'
import { sectionAttendanceRate, pct } from '../../lib/calc'
import { fDate, sar, typeLabel, iso } from '../../lib/format'
import type { Program, Section } from '../../data/types'

type Tab = 'programs' | 'plans' | 'sections' | 'trainers'

export default function Education() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'programs'
  return (
    <div>
      <div className="page-head"><div><h1 className="page-title">إدارة التعليم</h1><p className="page-sub">البرنامج تعريف ومحتوى؛ الشعبة تنفيذ محدد بتاريخ ومدرب ومتدربين.</p></div></div>
      <Tabs value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} tabs={[
        { id: 'programs', label: 'البرامج' }, { id: 'plans', label: 'الخطط والفصول' }, { id: 'sections', label: 'الشعب' }, { id: 'trainers', label: 'المدربون' },
      ]} />
      {tab === 'programs' && <ProgramsTab />}
      {tab === 'plans' && <PlansTab />}
      {tab === 'sections' && <SectionsTab />}
      {tab === 'trainers' && <TrainersTab />}
    </div>
  )
}

function ProgramsTab() {
  const { state } = useStore()
  const [edit, setEdit] = useState<Program | null>(null)
  return (
    <div className="card pad-0">
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>البرنامج</th><th>النوع</th><th>المجال</th><th>المدرب</th><th>الشعب</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            {state.programs.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => setEdit(p)}>
                <td><div className="bold">{p.title}</div><div className="xs muted">{p.duration} · {sar(p.price)} (تجريبي)</div></td>
                <td><Badge tone="neutral">{typeLabel[p.type]}</Badge></td>
                <td className="small">{p.domain}</td>
                <td className="small nowrap">{state.trainers.find((t) => t.id === p.trainerId)?.name}</td>
                <td>{state.sections.filter((s) => s.programId === p.id).length}</td>
                <td>{p.published ? <Badge tone="success">منشور</Badge> : <Badge tone="neutral">مسودة</Badge>}</td>
                <td><button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); setEdit(p) }}><Pencil />تحرير</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ProgramEditor program={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}

function ProgramEditor({ program, onClose }: { program: Program; onClose: () => void }) {
  const { state, mutate, toast } = useStore()
  const [f, setF] = useState({ title: program.title, summary: program.summary, trainerId: program.trainerId, published: program.published, featured: program.featured, price: String(program.price) })
  const ok = f.title.trim().length >= 3 && Number(f.price) >= 0
  const save = () => {
    mutate((d) => {
      const p = d.programs.find((x) => x.id === program.id)!
      p.title = f.title.trim(); p.summary = f.summary.trim(); p.trainerId = f.trainerId; p.published = f.published; p.featured = f.featured; p.price = Number(f.price)
    }, { actor: 'خالد الحربي', text: `تحديث بيانات البرنامج «${f.title.trim()}»`, kind: 'content' })
    toast('حُفظ البرنامج — التغييرات ظاهرة في الموقع العام')
    onClose()
  }
  return (
    <Modal wide title="تفاصيل البرنامج وتحريره" sub={typeLabel[program.type]} onClose={onClose} footer={<>
      <button className="btn btn-primary" disabled={!ok} onClick={save}><Save />حفظ التغييرات</button>
      <Link to={`/programs/${program.id}`} className="btn btn-secondary"><ExternalLink />صفحة البرنامج</Link>
      <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
    </>}>
      <Field label="اسم البرنامج" htmlFor="pe-t"><input id="pe-t" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="الوصف المختصر" htmlFor="pe-s"><textarea id="pe-s" className="textarea" rows={2} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></Field>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <Field label="المدرب الافتراضي" htmlFor="pe-tr"><select id="pe-tr" className="select" value={f.trainerId} onChange={(e) => setF({ ...f, trainerId: e.target.value })}>{state.trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
        <Field label="السعر (تجريبي)" htmlFor="pe-p"><input id="pe-p" className="input" inputMode="numeric" dir="ltr" style={{ textAlign: 'right' }} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
      </div>
      <div className="row wrap" style={{ gap: 24 }}>
        <label className="row small" style={{ gap: 8 }}><input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} />منشور في الكتالوج</label>
        <label className="row small" style={{ gap: 8 }}><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} />مميز في الصفحة الرئيسية</label>
      </div>
      <div className="divider" />
      <div className="small"><b>المخرجات:</b> <span className="muted">{program.outcomes.join('، ')}</span></div>
    </Modal>
  )
}

function PlansTab() {
  const { state } = useStore()
  const diplomas = state.programs.filter((p) => p.terms)
  const others = state.programs.filter((p) => !p.terms)
  return (
    <div className="stack lg">
      {diplomas.map((p) => (
        <div key={p.id} className="stack">
          <h2 className="section-title">{p.title}</h2>
          <div className="grid grid-2">
            {p.terms!.map((t) => (
              <div key={t.id} className="term">
                <div className="term-head"><b>{t.title}</b><span className="small muted">{t.courses.length} مقررات</span></div>
                {t.courses.map((c) => {
                  const sec = state.sections.find((s) => s.courseId === c.id)
                  return (
                    <div key={c.id} className="course">
                      <div className="row between wrap"><div className="row" style={{ gap: 8 }}><span className="badge neutral plain ltr">{c.code}</span><b>{c.title}</b></div>{sec ? <Badge tone="warning">شعبة {iso(sec.code)}</Badge> : <Badge tone="neutral">لا شعبة بعد</Badge>}</div>
                      <div className="small muted" style={{ marginTop: 6 }}>{c.units.length} وحدات · {c.units.reduce((n, u) => n + u.lessons.length, 0)} دروس</div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        <h2 className="section-title" style={{ marginBottom: 12 }}>برامج بوحدات مباشرة (دون فصول)</h2>
        <div className="grid grid-3">
          {others.map((p) => (
            <div key={p.id} className="card">
              <div className="row between"><b>{p.title}</b><Badge tone="neutral">{typeLabel[p.type]}</Badge></div>
              <ul className="small muted" style={{ margin: '10px 0 0', paddingInlineStart: 18 }}>{(p.plan ?? []).map((g) => <li key={g.title}>{g.title}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionsTab() {
  const { state } = useStore()
  const [assign, setAssign] = useState<Section | null>(null)
  return (
    <div className="card pad-0">
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>الشعبة</th><th>البرنامج / المقرر</th><th>المدرب</th><th>المتدربون</th><th>الحضور</th><th>تسليمات معلقة</th><th>الفترة</th><th></th></tr></thead>
          <tbody>
            {state.sections.map((s) => {
              const p = state.programs.find((x) => x.id === s.programId)!
              const course = p.terms?.flatMap((t) => t.courses).find((c) => c.id === s.courseId)
              const r = sectionAttendanceRate(state, s.id)
              const pending = state.submissions.filter((x) => !x.published && state.assignments.find((a) => a.id === x.assignmentId)?.sectionId === s.id).length
              return (
                <tr key={s.id}>
                  <td><span className="badge dark plain ltr">{s.code}</span></td>
                  <td><div className="bold">{p.title}</div>{course && <div className="xs muted">{course.title}</div>}</td>
                  <td className="nowrap">{state.trainers.find((t) => t.id === s.trainerId)?.name}</td>
                  <td>{s.learnerIds.length}</td>
                  <td style={{ minWidth: 110 }}>{r === null ? <span className="muted small">—</span> : <div className="row small" style={{ gap: 6 }}><div className="grow"><Progress value={r} /></div>{pct(r)}</div>}</td>
                  <td>{pending ? <Badge tone="warning">{pending}</Badge> : <span className="muted">0</span>}</td>
                  <td className="small nowrap">{fDate(s.start)} – {fDate(s.end)}</td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => setAssign(s)}><UserCog />إسناد مدرب</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {assign && <AssignTrainer section={assign} onClose={() => setAssign(null)} />}
    </div>
  )
}

function AssignTrainer({ section, onClose }: { section: Section; onClose: () => void }) {
  const { state, mutate, toast } = useStore()
  const [tid, setTid] = useState(section.trainerId)
  const t = state.trainers.find((x) => x.id === tid)!
  return (
    <Modal title={`إسناد مدرب — شعبة ${iso(section.code)}`} sub={section.title} onClose={onClose} footer={<>
      <button className="btn btn-primary" disabled={tid === section.trainerId} onClick={() => {
        mutate((d) => { d.sections.find((s) => s.id === section.id)!.trainerId = tid }, { actor: 'خالد الحربي', text: `إسناد شعبة ${iso(section.code)} إلى ${t.name}`, kind: 'ops' })
        toast(`أُسندت الشعبة ${iso(section.code)} إلى ${t.name}`); onClose()
      }}><Save />حفظ الإسناد</button>
      <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
    </>}>
      <div className="stack sm" role="radiogroup" aria-label="المدربون">
        {state.trainers.map((tr) => {
          const load = state.sections.filter((s) => s.trainerId === tr.id).length
          return (
            <label key={tr.id} className="list-item" style={{ border: `1px solid ${tid === tr.id ? 'var(--gold-500)' : 'var(--border)'}`, borderRadius: 12, padding: 12, cursor: 'pointer', background: tid === tr.id ? 'var(--gold-50)' : undefined }}>
              <input type="radio" name="trainer" checked={tid === tr.id} onChange={() => setTid(tr.id)} />
              <Avatar name={tr.name} />
              <div className="grow"><div className="bold small">{tr.name}</div><div className="xs muted">{tr.title}</div></div>
              <span className="xs muted">{load} شعب</span>
            </label>
          )
        })}
      </div>
      {section.trainerId !== tid && <p className="xs muted">سيظهر التغيير فورًا في بوابة المدرب.</p>}
    </Modal>
  )
}

function TrainersTab() {
  const { state } = useStore()
  return (
    <div className="grid grid-3">
      {state.trainers.map((t) => {
        const secs = state.sections.filter((s) => s.trainerId === t.id)
        return (
          <div key={t.id} className="card stack">
            <div className="row"><Avatar name={t.name} size="lg" /><div><div className="bold">{t.name}</div><div className="xs muted ltr">{t.code}</div></div></div>
            <div className="small muted">{t.title}</div>
            <div className="row wrap small" style={{ gap: 16 }}>
              <span className="row" style={{ gap: 6 }}><Layers size={16} />{secs.length} شعب</span>
              <span className="row" style={{ gap: 6 }}><Users size={16} />{secs.reduce((n, s) => n + s.learnerIds.length, 0)} متدربين</span>
              <span className="row" style={{ gap: 6 }}><BookOpen size={16} />{state.programs.filter((p) => p.trainerId === t.id).length} برامج</span>
            </div>
            <div className="row wrap" style={{ gap: 6 }}>{secs.map((s) => <span key={s.id} className="badge neutral plain ltr">{s.code}</span>)}{!secs.length && <span className="xs muted">لا شعب نشطة حاليًا</span>}</div>
          </div>
        )
      })}
    </div>
  )
}
