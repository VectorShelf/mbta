import { Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, GraduationCap, Award, MonitorSmartphone, Lightbulb, Users, BarChart3, Briefcase, Landmark,
  ShieldCheck, Bot, Languages, Plus, Target, Gem, Sparkles, HeartHandshake, TrendingUp,
} from 'lucide-react'
import { useStore } from '../../store/store'
import ProgramCard from '../../components/ProgramCard'
import { BrandArt } from '../../components/ui'

const services = [
  { icon: <Building2 />, title: 'التدريب وبناء القدرات', text: 'برامج تدريبية مصممة وفق الاحتياج الفعلي للأفراد والجهات.' },
  { icon: <Award />, title: 'البرامج التنفيذية والشهادات الاحترافية', text: 'تأهيل القيادات والمهنيين للشهادات الاحترافية المعتمدة.' },
  { icon: <MonitorSmartphone />, title: 'الحلول التعليمية والتدريب الرقمي', text: 'تجارب تعلم رقمية ومحتوى تفاعلي يدعم التعلم المستمر.' },
  { icon: <Lightbulb />, title: 'الاستشارات والفعاليات والمبادرات', text: 'دعم الجهات في تحليل الاحتياج وتنظيم المبادرات التدريبية.' },
]
const domains = [
  { icon: <Users />, t: 'القيادة والإدارة' }, { icon: <Briefcase />, t: 'إدارة المشاريع والأعمال' },
  { icon: <HeartHandshake />, t: 'الموارد البشرية' }, { icon: <BarChart3 />, t: 'المالية والمحاسبة' },
  { icon: <Landmark />, t: 'الحوكمة والمخاطر والامتثال' }, { icon: <ShieldCheck />, t: 'تقنية وأمن المعلومات' },
  { icon: <Bot />, t: 'الذكاء الاصطناعي والتحول الرقمي' }, { icon: <Languages />, t: 'اللغات والتواصل' },
]
const method = ['فهم وتحليل الاحتياج', 'التصميم والتخطيط', 'اختيار الخبرات', 'التنفيذ وإدارة التجربة', 'القياس والتقييم', 'التقارير والتحسين']
const values = [
  { icon: <Gem />, t: 'الجودة' }, { icon: <Target />, t: 'الاحترافية' }, { icon: <Sparkles />, t: 'الابتكار' },
  { icon: <ShieldCheck />, t: 'الالتزام' }, { icon: <TrendingUp />, t: 'الأثر' },
]
const faqs = [
  { q: 'ما أنماط التعلم المتاحة؟', a: 'تتنوع البرامج بين الدبلومات متعددة الفصول، والدورات المباشرة عن بُعد، والدورات المسجلة بوتيرة ذاتية، والبرامج القصيرة المركّزة.' },
  { q: 'هل يمكن تصميم برنامج خاص لجهة؟', a: 'نعم، تبدأ منهجيتنا بفهم الاحتياج وتحليله ثم تصميم البرنامج واختيار الخبرات المناسبة وقياس الأثر بعد التنفيذ.' },
  { q: 'كيف أتابع تقدمي في البرنامج؟', a: 'توفر البوابة التعليمية لوحة للمتدرب تعرض تقدم المحتوى والحضور والدرجات والواجبات والإعلانات في مكان واحد.' },
  { q: 'هل البرامج المعروضة هنا متاحة للتسجيل الفعلي؟', a: 'هذه الصفحة نموذج عرض تجريبي؛ البرامج والأسعار أمثلة لتوضيح التجربة ولا تمثل عروضًا معتمدة.' },
]

export default function Home() {
  const { state } = useStore()
  const featured = state.programs.filter((p) => p.featured && p.published).slice(0, 3)
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">معهد بوابة المستقبل العالي للتدريب</span>
            <h1 style={{ marginTop: 12 }}>{state.site.heroTitle}</h1>
            <p className="lead">{state.site.heroSub}</p>
            <div className="hero-actions">
              <Link to="/programs" className="btn btn-primary btn-lg btn-arrow">استكشف البرامج<ArrowLeft /></Link>
              <Link to="/#services" className="btn btn-secondary btn-lg">حلول التدريب للجهات</Link>
            </div>
            {state.site.notice && <p className="small muted" style={{ marginTop: 20 }}>{state.site.notice}</p>}
          </div>
          <div className="hero-art"><BrandArt style={{ width: '100%', height: '100%' }} /></div>
        </div>
      </section>

      <section className="site-section alt" id="services">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">خدماتنا</span>
            <h2>حلول تدريب متكاملة للأفراد والمؤسسات</h2>
            <p>برامج نوعية تجمع المعرفة والتطبيق والممارسة العملية، وتستجيب للاحتياجات الفعلية ومتطلبات سوق العمل.</p>
          </div>
          <div className="grid grid-4">
            {services.map((s) => (
              <div key={s.title} className="card flat service-card">
                <div className="icon-tile">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="container">
          <div className="row between wrap" style={{ marginBottom: 32, alignItems: 'flex-end' }}>
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">برامج مختارة</span>
              <h2>ابدأ مسارك التدريبي</h2>
            </div>
            <Link to="/programs" className="btn btn-secondary">كل البرامج<ArrowLeft /></Link>
          </div>
          <div className="grid grid-3">{featured.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
          <p className="xs muted" style={{ marginTop: 16 }}>البرامج المعروضة أمثلة للعرض وليست إعلانًا عن برامج فعلية.</p>
          <div style={{ marginTop: 48 }}>
            <h3 className="section-title" style={{ marginBottom: 16 }}>مجالات التدريب</h3>
            <div className="grid grid-4" style={{ gap: 12 }}>
              {domains.map((d) => <div key={d.t} className="domain-chip">{d.icon}{d.t}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="site-section dark" id="method">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">منهجية التنفيذ</span>
            <h2>من فهم الاحتياج إلى قياس الأثر</h2>
            <p>كل برنامج يمر بست مراحل واضحة تضمن ارتباطه بالاحتياج الفعلي وقياس مخرجاته.</p>
          </div>
          <div className="method">
            {method.map((m, i) => (
              <div key={m} className="method-step">
                <div className="num ltr">0{i + 1}</div>
                <div className="bar" />
                <h4>{m}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section" id="about">
        <div className="container grid grid-2" style={{ alignItems: 'start', gap: 48 }}>
          <div className="stack lg">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">عن المعهد</span>
              <h2>شريك في بناء القدرات البشرية</h2>
            </div>
            <p style={{ fontSize: 16, color: 'var(--text-2)' }}>
              معهد بوابة المستقبل العالي للتدريب متخصص في تقديم حلول متكاملة للتدريب والتطوير وبناء القدرات للأفراد والمؤسسات، عبر برامج نوعية تجمع المعرفة والتطبيق والممارسة العملية، وتستجيب للاحتياجات الفعلية ومتطلبات سوق العمل.
            </p>
            <div className="card flat" style={{ background: 'var(--gold-50)', borderColor: 'var(--gold-100)' }}>
              <div className="eyebrow">الرؤية</div>
              <p style={{ marginTop: 6, fontWeight: 500 }}>أن نكون شريكًا موثوقًا ورائدًا في بناء القدرات البشرية، وصناعة تجارب تعلم وتطوير تحقق أثرًا مستدامًا للأفراد والمؤسسات.</p>
            </div>
            <p className="small muted">وفق ملف تعريف المعهد: مرخّص من المؤسسة العامة للتدريب التقني والمهني والمركز الوطني للتعليم الإلكتروني.</p>
          </div>
          <div className="stack lg">
            <div>
              <h3 className="section-title" style={{ marginBottom: 16 }}>قيمنا</h3>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {values.map((v) => <div key={v.t} className="domain-chip">{v.icon}{v.t}</div>)}
              </div>
            </div>
            <div className="card">
              <div className="row top">
                <div className="icon-tile dark"><GraduationCap /></div>
                <div className="stack sm grow">
                  <h3 className="card-title">منصة تعليمية واحدة لكل الأدوار</h3>
                  <p className="muted small">المتدرب يتابع تعلمه، والمدرب يدير شعبه، والإدارة ترى الصورة كاملة — في تجربة موحدة.</p>
                  <Link to="/demo" className="btn btn-primary btn-arrow" style={{ alignSelf: 'flex-start', marginTop: 8 }}>جرّب بوابة المنصة<ArrowLeft /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section alt" id="faq">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="section-head"><span className="eyebrow">أسئلة شائعة</span><h2>إجابات سريعة</h2></div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}><summary>{f.q}<Plus size={20} /></summary><p>{f.a}</p></details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
