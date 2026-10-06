import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, GraduationCap, Users, Presentation, Building2, Briefcase, Menu, Globe, RotateCcw,
  UserRound, ShieldCheck, School, Info,
} from 'lucide-react'
import { useStore } from '../store/store'
import { Avatar, Modal } from '../components/ui'
import { MAIN_LEARNER, MAIN_TRAINER, MAIN_ADMIN, MAIN_PROGRAM } from '../data/seed'
import { asset } from '../lib/format'

type Role = 'learner' | 'trainer' | 'admin'

export default function PortalLayout() {
  const { state, reset } = useStore()
  const loc = useLocation()
  const role: Role = loc.pathname.startsWith('/trainer') ? 'trainer' : loc.pathname.startsWith('/admin') ? 'admin' : 'learner'
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])

  const learner = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const trainer = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const admin = state.staff.find((s) => s.id === MAIN_ADMIN)!
  const user = role === 'learner' ? { name: learner.name, sub: `متدرب · ${learner.code}` } : role === 'trainer' ? { name: trainer.name, sub: `مدربة · ${trainer.code}` } : { name: admin.name, sub: admin.role }

  const pendingAdmissions = state.applications.filter((a) => a.status === 'new' || a.status === 'review').length
    + state.excuses.filter((e) => e.status === 'pending').length + state.services.filter((s) => s.status === 'pending').length
  const pendingLeaves = state.leaves.filter((l) => l.status === 'pending').length
  const mySections = state.sections.filter((s) => s.trainerId === MAIN_TRAINER)

  const dark = role !== 'learner'
  return (
    <div className="portal">
      <aside className={`sidebar${dark ? ' dark' : ''}${open ? ' open' : ''}`} aria-label="القائمة الجانبية">
        <Link to="/" className="sidebar-logo" aria-label="الموقع العام">
          <img src={dark ? asset('brand/logo-h-dark.png') : asset('brand/logo-h.png')} alt="معهد بوابة المستقبل العالي للتدريب" />
        </Link>
        {role === 'learner' && (
          <nav className="stack sm" style={{ gap: 2 }}>
            <div className="sidebar-group">بوابة المتدرب</div>
            <NavLink to="/learner" end className="nav-link"><LayoutDashboard />الرئيسية</NavLink>
            <NavLink to={`/learner/program/${MAIN_PROGRAM}`} className={({ isActive }) => `nav-link${isActive || loc.pathname.startsWith('/learner/lesson') ? ' active' : ''}`}><BookOpen />برنامجي</NavLink>
            <NavLink to="/learner/academic" className="nav-link"><GraduationCap />الشؤون الأكاديمية</NavLink>
          </nav>
        )}
        {role === 'trainer' && (
          <nav className="stack sm" style={{ gap: 2 }}>
            <div className="sidebar-group">بوابة المدرب</div>
            <NavLink to="/trainer" end className="nav-link"><LayoutDashboard />الرئيسية</NavLink>
            <div className="sidebar-group">شعبي</div>
            {mySections.map((s) => (
              <NavLink key={s.id} to={`/trainer/sections/${s.id}`} className="nav-link"><Presentation /><span className="grow">{s.title}</span><span className="xs ltr" style={{ opacity: .7 }}>{s.code}</span></NavLink>
            ))}
          </nav>
        )}
        {role === 'admin' && (
          <nav className="stack sm" style={{ gap: 2 }}>
            <div className="sidebar-group">الإدارة</div>
            <NavLink to="/admin" end className="nav-link"><LayoutDashboard />نظرة عامة</NavLink>
            <NavLink to="/admin/education" className="nav-link"><School />إدارة التعليم</NavLink>
            <NavLink to="/admin/learners" className="nav-link"><Users />المتدربون والقبول{pendingAdmissions > 0 && <span className="nav-count">{pendingAdmissions}</span>}</NavLink>
            <div className="sidebar-group">التشغيل</div>
            <NavLink to="/admin/operations" className="nav-link"><Briefcase />تشغيل المعهد{pendingLeaves > 0 && <span className="nav-count">{pendingLeaves}</span>}</NavLink>
          </nav>
        )}
        <div className="sidebar-foot stack sm">
          <div className="row" style={{ gap: 8 }}><Info size={15} />بيانات اصطناعية محفوظة على هذا المتصفح فقط</div>
          <button className="btn btn-sm btn-ghost" style={{ justifyContent: 'flex-start', paddingInline: 0, color: 'inherit' }} onClick={() => setConfirm(true)}><RotateCcw />إعادة ضبط الديمو</button>
        </div>
      </aside>
      <div className={`scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <div style={{ minWidth: 0 }}>
        <header className="topbar">
          <button className="icon-btn portal-menu-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة"><Menu /></button>
          <nav className="role-switch" aria-label="مبدّل أدوار العرض">
            <NavLink to="/learner" aria-label="عرض كمتدرب" className={role === 'learner' ? 'active' : ''}><UserRound /><span>متدرب</span></NavLink>
            <NavLink to="/trainer" aria-label="عرض كمدرب" className={role === 'trainer' ? 'active' : ''}><Presentation /><span>مدرب</span></NavLink>
            <NavLink to="/admin" aria-label="عرض كإدارة" className={role === 'admin' ? 'active' : ''}><ShieldCheck /><span>إدارة</span></NavLink>
          </nav>
          <span className="sim-tag hide-tablet" title="مبدّل الأدوار أداة عرض وليس نظام صلاحيات"><Building2 />وضع العرض التجريبي</span>
          <div className="grow" />
          <Link to="/" className="btn btn-sm btn-secondary hide-phone"><Globe />الموقع</Link>
          <div className="user-chip">
            <Avatar name={user.name} />
            <div className="hide-phone">
              <div className="name">{user.name}</div>
              <div className="role">{user.sub}</div>
            </div>
          </div>
        </header>
        <main className="portal-main"><Outlet /></main>
      </div>
      {confirm && (
        <Modal title="إعادة ضبط بيانات الديمو؟" onClose={() => setConfirm(false)}
          footer={<>
            <button className="btn btn-primary" onClick={() => { reset(); setConfirm(false) }}><RotateCcw />نعم، أعد الضبط</button>
            <button className="btn btn-secondary" onClick={() => setConfirm(false)}>إلغاء</button>
          </>}>
          <p className="muted">ستُحذف كل التغييرات التي أجريتها في هذا المتصفح (التسليمات، الدرجات، الحضور، الطلبات…) وتعود البيانات التجريبية إلى حالتها الأصلية.</p>
        </Modal>
      )}
    </div>
  )
}
