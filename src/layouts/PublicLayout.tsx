import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, LogIn, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from '../components/ui'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => {
    if (!loc.hash) return
    const el = document.getElementById(loc.hash.slice(1))
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [loc.hash, loc.pathname])

  return (
    <>
      <div className="demo-banner">نموذج عرض تجريبي — البيانات والبرامج والأسعار أمثلة للعرض فقط. <Link to="/demo">اختيار تجربة البوابة</Link></div>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="site-logo" aria-label="الصفحة الرئيسية"><Logo height={44} /></Link>
          <nav className={`site-nav${open ? ' open' : ''}`} aria-label="التنقل الرئيسي">
            <NavLink to="/" end>الرئيسية</NavLink>
            <NavLink to="/programs">البرامج</NavLink>
            <Link to="/#services">الخدمات</Link>
            <Link to="/#method">المنهجية</Link>
            <Link to="/#about">عن المعهد</Link>
            <Link to="/#contact">تواصل معنا</Link>
          </nav>
          <div className="row">
            <Link to="/demo" className="btn btn-primary"><LogIn />دخول المنصة</Link>
            <button className="icon-btn mobile-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="القائمة" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div className="stack">
              <Logo dark height={40} />
              <p className="small" style={{ color: '#B5AFA5', maxWidth: 320 }}>حلول متكاملة للتدريب والتطوير وبناء القدرات للأفراد والمؤسسات.</p>
              <p className="xs ltr" style={{ color: '#8A847A' }}>Future Gate Higher Training Institute</p>
            </div>
            <div>
              <h4>المنصة</h4>
              <ul>
                <li><Link to="/programs">البرامج التدريبية</Link></li>
                <li><Link to="/demo">بوابة المتدرب</Link></li>
                <li><Link to="/demo">بوابة المدرب</Link></li>
                <li><Link to="/demo">بوابة الإدارة</Link></li>
              </ul>
            </div>
            <div>
              <h4>المعهد</h4>
              <ul>
                <li><Link to="/#about">عن المعهد</Link></li>
                <li><Link to="/#services">الخدمات</Link></li>
                <li><Link to="/#method">منهجية التنفيذ</Link></li>
                <li><Link to="/#faq">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
            <div>
              <h4>تواصل معنا</h4>
              <ul>
                <li className="row" style={{ gap: 8 }}><Mail size={16} /><span className="ltr">info@fgti.sa</span></li>
                <li className="row" style={{ gap: 8 }}><Phone size={16} /><span className="ltr">+966 50 657 7222</span></li>
                <li className="row" style={{ gap: 8 }}><Phone size={16} /><span className="ltr">011 208 6333</span></li>
                <li className="row top" style={{ gap: 8 }}><MapPin size={16} style={{ marginTop: 4, flexShrink: 0 }} /><span>الرياض، إشبيلية، طريق الإمام عبدالله بن عبدالعزيز</span></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} معهد بوابة المستقبل العالي للتدريب</span>
            <span>نموذج أولي للعرض — لا يُرسل أي طلب أو رسالة فعلية</span>
          </div>
        </div>
      </footer>
    </>
  )
}
