import { Link } from 'react-router-dom'
import { UserRound, Presentation, ShieldCheck, ArrowLeft, Info } from 'lucide-react'
import { useStore } from '../../store/store'
import { Avatar } from '../../components/ui'
import { MAIN_LEARNER, MAIN_TRAINER, MAIN_ADMIN } from '../../data/seed'

export default function DemoSelect() {
  const { state } = useStore()
  const l = state.learners.find((x) => x.id === MAIN_LEARNER)!
  const t = state.trainers.find((x) => x.id === MAIN_TRAINER)!
  const a = state.staff.find((x) => x.id === MAIN_ADMIN)!
  const roles = [
    { to: '/learner', icon: <UserRound />, role: 'المتدرب', name: l.name, code: l.code, text: 'تابع تعلمك في دبلوم إدارة المشاريع، أكمل الدروس، سلّم الواجبات، واطّلع على الحضور والدرجات.' },
    { to: '/trainer', icon: <Presentation />, role: 'المدرب', name: t.name, code: t.code, text: 'أدر شعبك: رصد الحضور، تصحيح التسليمات، نشر الإعلانات، وإدارة اللقاءات المباشرة.' },
    { to: '/admin', icon: <ShieldCheck />, role: 'الإدارة', name: a.name, code: a.role, text: 'تابع مؤشرات المعهد، راجع طلبات القبول والأعذار، وأدر التعليم والفريق والمهام والتقارير.' },
  ]
  return (
    <section className="site-section" style={{ paddingTop: 56 }}>
      <div className="container" style={{ maxWidth: 1040 }}>
        <div className="section-head" style={{ textAlign: 'center', marginInline: 'auto' }}>
          <span className="eyebrow">دخول المنصة</span>
          <h1 style={{ fontSize: 36, marginTop: 8 }}>اختر تجربة البوابة</h1>
          <p>نموذج عرض بثلاث وجهات حسب الدور. يمكنك التبديل بين الأدوار في أي وقت من رأس البوابة دون فقدان التغييرات.</p>
        </div>
        <div className="grid grid-3">
          {roles.map((r) => (
            <Link key={r.to} to={r.to} className="card card-link stack" style={{ padding: 28 }}>
              <div className="row between">
                <div className="icon-tile dark">{r.icon}</div>
                <span className="eyebrow">{r.role}</span>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <Avatar name={r.name} />
                <div><div className="bold">{r.name}</div><div className="xs muted ltr">{r.code}</div></div>
              </div>
              <p className="small muted">{r.text}</p>
              <span className="btn btn-primary btn-block" style={{ marginTop: 'auto' }}>الدخول كـ{r.role}<ArrowLeft /></span>
            </Link>
          ))}
        </div>
        <div className="callout info" style={{ marginTop: 32 }}>
          <Info />
          <div>
            <b>بيانات تجريبية دون تسجيل دخول حقيقي.</b> الأسماء اصطناعية، وكل التغييرات تُحفظ محليًا على هذا المتصفح فقط لاستمرار العرض، ولا تُزامَن بين الأجهزة. يمكن إعادة البيانات الأصلية من «إعادة ضبط الديمو» في القائمة الجانبية.
          </div>
        </div>
      </div>
    </section>
  )
}
