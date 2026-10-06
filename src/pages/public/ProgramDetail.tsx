import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, MonitorPlay, CheckCircle2, CalendarDays, Users, ArrowLeft, Tag, ChevronLeft, FileText } from 'lucide-react'
import { useStore, newId } from '../../store/store'
import { Modal, Field, Avatar, Empty, Callout } from '../../components/ui'
import { ProgramTop } from '../../components/ProgramCard'
import { fDate, sar, typeLabel } from '../../lib/format'

export default function ProgramDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const p = state.programs.find((x) => x.id === id)
  const [apply, setApply] = useState(false)
  if (!p) return <div className="container" style={{ padding: '64px 16px' }}><Empty title="البرنامج غير موجود" action={<Link to="/programs" className="btn btn-primary">العودة للبرامج</Link>} /></div>

  const trainer = state.trainers.find((t) => t.id === p.trainerId)
  const section = state.sections.find((s) => s.programId === p.id)
  const plan = p.terms
    ? p.terms.map((t) => ({ title: t.title, items: t.courses.map((c) => `${c.title} — ${c.units.reduce((n, u) => n + u.lessons.length, 0)} دروس`) }))
    : p.plan ?? []

  return (
    <>
      <section style={{ background: 'var(--charcoal)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', insetInlineEnd: 0, bottom: 0, width: 'min(380px, 40%)', height: '100%', opacity: .3 }}><ProgramTop type={p.type} height="100%" /></div>
        <div className="container" style={{ position: 'relative', padding: '40px 24px 48px' }}>
          <nav className="row small" style={{ gap: 6, color: '#BDB7AD', marginBottom: 20 }} aria-label="مسار التنقل">
            <Link to="/programs">البرامج</Link><ChevronLeft size={14} /><span style={{ color: '#fff' }}>{p.title}</span>
          </nav>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="badge plain" style={{ background: 'rgba(255,255,255,.92)' }}>{typeLabel[p.type]}</span>
            <span className="badge plain" style={{ background: 'transparent', color: 'var(--gold-300)', borderColor: 'var(--charcoal-3)' }}>{p.domain}</span>
          </div>
          <h1 style={{ fontSize: 40, marginTop: 14, maxWidth: 760 }}>{p.title}</h1>
          <p style={{ color: '#D9D4CB', marginTop: 12, maxWidth: 640, fontSize: 17 }}>{p.summary}</p>
          <div className="row wrap" style={{ gap: 24, marginTop: 24, color: '#D9D4CB' }}>
            <span className="row" style={{ gap: 8 }}><MonitorPlay size={18} color="var(--gold-400)" />{p.mode}</span>
            <span className="row" style={{ gap: 8 }}><Clock size={18} color="var(--gold-400)" />{p.duration}</span>
          </div>
        </div>
      </section>
      <section className="site-section" style={{ paddingTop: 40 }}>
        <div className="container main-aside">
          <div className="stack lg">
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 10 }}>وصف البرنامج</h2>
              <p className="muted">{p.description}</p>
              <p className="small" style={{ marginTop: 12 }}><span className="bold">الفئة المستهدفة: </span><span className="muted">{p.audience}</span></p>
            </div>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 14 }}>مخرجات التعلم</h2>
              <div className="grid grid-2" style={{ gap: 12 }}>
                {p.outcomes.map((o) => <div key={o} className="row top" style={{ gap: 10 }}><CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /><span>{o}</span></div>)}
              </div>
            </div>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 14 }}>الخطة التدريبية</h2>
              <div className="stack">
                {plan.map((g, i) => (
                  <div key={g.title} className="row top" style={{ gap: 14 }}>
                    <span className="icon-tile" style={{ width: 34, height: 34, fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                    <div className="grow">
                      <div className="bold">{g.title}</div>
                      <ul className="muted small" style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {trainer && (
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: 14 }}>المدرب</h2>
                <div className="row top"><Avatar name={trainer.name} size="lg" /><div><div className="bold">{trainer.name}</div><div className="small muted">{trainer.title}</div><p className="small muted" style={{ marginTop: 6 }}>{trainer.bio}</p></div></div>
              </div>
            )}
          </div>
          <aside className="stack" style={{ position: 'sticky', top: 96 }}>
            <div className="card stack">
              <div>
                <div className="row" style={{ gap: 8 }}><span className="stat-value">{sar(p.price)}</span></div>
                <span className="badge warning" style={{ marginTop: 6 }}><Tag size={12} />سعر تجريبي للعرض</span>
              </div>
              <div className="divider" />
              <dl className="kv">
                <dt className="row" style={{ gap: 6 }}><CalendarDays size={16} />البداية</dt><dd>{section ? fDate(section.start) : 'تُعلن لاحقًا'}</dd>
                <dt className="row" style={{ gap: 6 }}><Clock size={16} />المواعيد</dt><dd>{section ? `${section.days} · ${section.time}` : 'حسب الجدول'}</dd>
                <dt className="row" style={{ gap: 6 }}><Users size={16} />النمط</dt><dd>{p.mode}</dd>
              </dl>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setApply(true)}>قدّم الآن<ArrowLeft /></button>
              <p className="xs muted">التقديم ينشئ طلبًا تجريبيًا داخل النموذج فقط، دون إرسال أو دفع.</p>
            </div>
          </aside>
        </div>
      </section>
      {apply && <ApplyModal programId={p.id} onClose={() => setApply(false)} />}
    </>
  )
}

function ApplyModal({ programId, onClose }: { programId: string; onClose: () => void }) {
  const { state, mutate } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', programId })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (form.name.trim().split(/\s+/).length < 2) er.name = 'أدخل الاسم الأول واسم العائلة'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) er.email = 'أدخل بريدًا إلكترونيًا صحيحًا'
    if (form.phone && !/^05\d{8}$/.test(form.phone.replace(/\s/g, ''))) er.phone = 'رقم الجوال يبدأ بـ 05 ويتكون من 10 أرقام'
    setErrors(er)
    if (Object.keys(er).length) return
    const id = newId('AP')
    const program = state.programs.find((x) => x.id === form.programId)
    mutate((d) => {
      d.applications.unshift({ id, name: form.name.trim(), email: form.email.trim(), phone: form.phone.replace(/\s/g, ''), programId: form.programId, at: new Date().toISOString(), status: 'new', source: 'الموقع' })
    }, { actor: form.name.trim(), text: `طلب قبول جديد — ${program?.title}`, kind: 'admission' })
    setDone(id)
  }

  if (done) {
    return (
      <Modal title="تم استلام طلبك" onClose={onClose} footer={<>
        <Link to="/admin/learners?tab=admissions" className="btn btn-primary">عرض الطلب في بوابة الإدارة<ArrowLeft /></Link>
        <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
      </>}>
        <Callout tone="success" icon={<CheckCircle2 />}>أُنشئ طلب قبول تجريبي باسم <b>{form.name}</b>، ويظهر الآن في قائمة طلبات القبول لدى الإدارة.</Callout>
        <p className="small muted">رقم الطلب: <span className="ltr bold">{done.toUpperCase()}</span> — لم يُرسل أي بريد أو رسالة فعلية.</p>
      </Modal>
    )
  }

  return (
    <Modal title="التقديم على البرنامج" sub="نموذج قصير — يُنشئ طلبًا تجريبيًا فقط" onClose={onClose} footer={<>
      <button className="btn btn-primary" type="submit" form="apply-form"><FileText />إرسال الطلب</button>
      <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
    </>}>
      <form id="apply-form" className="stack" onSubmit={submit} noValidate>
        <Field label="الاسم الكامل" htmlFor="ap-name" error={errors.name}>
          <input id="ap-name" className={`input${errors.name ? ' error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" placeholder="مثال: ريان الدوسري" />
        </Field>
        <Field label="البريد الإلكتروني" htmlFor="ap-email" error={errors.email}>
          <input id="ap-email" type="email" dir="ltr" className={`input${errors.email ? ' error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" placeholder="name@example.com" style={{ textAlign: 'right' }} />
        </Field>
        <Field label="رقم الجوال (اختياري)" htmlFor="ap-phone" error={errors.phone}>
          <input id="ap-phone" dir="ltr" inputMode="tel" className={`input${errors.phone ? ' error' : ''}`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" placeholder="05xxxxxxxx" style={{ textAlign: 'right' }} />
        </Field>
        <Field label="البرنامج" htmlFor="ap-program">
          <select id="ap-program" className="select" value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
            {state.programs.filter((x) => x.published).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </Field>
      </form>
    </Modal>
  )
}
