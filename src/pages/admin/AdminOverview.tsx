import { Link } from 'react-router-dom'
import { Users, Presentation, Layers, BookOpen, ArrowLeft, AlertTriangle, FileText, UserPlus, FileWarning, ClipboardCheck, Activity as ActivityIcon } from 'lucide-react'
import { useStore } from '../../store/store'
import { Badge, Ring, Progress, Empty } from '../../components/ui'
import { attendanceStats, lessonProgress, sectionAttendanceRate, nextSession, pct } from '../../lib/calc'
import { fDateY, relDay, fTime } from '../../lib/format'
import { MAIN_PROGRAM } from '../../data/seed'

export default function AdminOverview() {
  const { state } = useStore()
  const active = state.learners.filter((l) => l.status === 'active')
  const newcomers = state.learners.filter((l) => l.status === 'new')
  const sections = state.sections.filter((s) => s.status === 'active')
  const published = state.programs.filter((p) => p.published)

  // نسبة حضور عامة من سجلات اللقاءات المنعقدة
  let tot = 0, att = 0
  for (const s of sections) {
    const held = state.sessions.filter((x) => x.sectionId === s.id && x.status === 'held')
    for (const h of held) for (const lid of s.learnerIds) {
      const r = state.attendance.find((a) => a.sessionId === h.id && a.learnerId === lid)
      if (!r) continue
      tot++; if (r.status === 'present' || r.status === 'late') att++
    }
  }
  const attRate = tot ? (att / tot) * 100 : 0
  const pmSection = state.sections.find((s) => s.programId === MAIN_PROGRAM)
  const pmLearners = pmSection?.learnerIds ?? []
  const avgProgress = pmLearners.length ? pmLearners.reduce((n, id) => n + lessonProgress(state, id, MAIN_PROGRAM).pct, 0) / pmLearners.length : 0

  const apps = state.applications.filter((a) => a.status === 'new' || a.status === 'review')
  const excuses = state.excuses.filter((e) => e.status === 'pending')
  const services = state.services.filter((s) => s.status === 'pending')
  const ungraded = state.submissions.filter((s) => !s.published).length
  const risk = active.map((l) => ({ l, st: attendanceStats(state, l.id, l.sectionId) })).filter((x) => x.st.level !== 'ok').sort((a, b) => b.st.absencePct - a.st.absencePct)

  const stats = [
    { icon: <Users />, v: active.length, l: 'متدربون نشطون', sub: newcomers.length ? `+${newcomers.length} مقبولون جدد بانتظار الإسناد` : `${state.learners.filter((l) => l.status === 'archived').length} سجلات مؤرشفة` },
    { icon: <Presentation />, v: state.trainers.length, l: 'مدربون', sub: `${new Set(sections.map((s) => s.trainerId)).size} من ${state.trainers.length} لديهم شعب نشطة` },
    { icon: <Layers />, v: sections.length, l: 'شعب نشطة', sub: `${state.sessions.filter((s) => s.status === 'upcoming').length} لقاءات قادمة` },
    { icon: <BookOpen />, v: published.length, l: 'برامج منشورة', sub: 'أمثلة تجريبية' },
  ]
  const follow = [
    { icon: <UserPlus />, n: apps.length, t: 'طلبات قبول بانتظار القرار', to: '/admin/learners?tab=admissions' },
    { icon: <FileWarning />, n: excuses.length, t: 'أعذار غياب للمراجعة', to: '/admin/learners?tab=excuses' },
    { icon: <FileText />, n: services.length, t: 'طلبات خدمات أكاديمية', to: '/admin/learners?tab=requests' },
    { icon: <ClipboardCheck />, n: ungraded, t: 'تسليمات لم تُعتمد درجاتها', to: '/admin/education?tab=sections' },
  ]

  return (
    <div className="stack lg">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div><h1 className="page-title">نظرة الإدارة</h1><p className="page-sub">{fDateY(new Date().toISOString())} · كل الأرقام مشتقة من بيانات الديمو الحالية</p></div>
        <Link to="/admin/learners?tab=admissions" className="btn btn-primary"><UserPlus />مراجعة طلبات القبول{apps.length > 0 && ` (${apps.length})`}</Link>
      </div>

      <div className="grid grid-4 stats">
        {stats.map((s) => (
          <div key={s.l} className="card stack sm">
            <div className="row between top">
              <div className="stat"><span className="stat-value">{s.v}</span><span className="stat-label">{s.l}</span></div>
              <div className="icon-tile">{s.icon}</div>
            </div>
            <div className="xs muted">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="main-aside">
        <div className="stack lg">
          <div className="grid grid-2">
            <div className="card row" style={{ gap: 20 }}>
              <Ring value={attRate} size={100} color="var(--success)" track="var(--success-bg)"><b style={{ fontSize: 20 }}>{pct(attRate)}</b></Ring>
              <div><div className="bold">نسبة الحضور العامة</div><div className="small muted">{att} حضور من {tot} سجل في اللقاءات المنعقدة (التأخير يُحتسب حضورًا)</div></div>
            </div>
            <div className="card row" style={{ gap: 20 }}>
              <Ring value={avgProgress} size={100}><b style={{ fontSize: 20 }}>{pct(avgProgress)}</b></Ring>
              <div><div className="bold">متوسط تقدم المحتوى</div><div className="small muted">لمتدربي دبلوم إدارة المشاريع ({pmLearners.length} متدربين)</div></div>
            </div>
          </div>

          <div className="card pad-0">
            <div className="card-head" style={{ padding: '20px 20px 0' }}><h2 className="card-title">الشعب النشطة</h2><Link to="/admin/education?tab=sections" className="btn btn-ghost btn-sm">إدارة الشعب<ArrowLeft /></Link></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>الشعبة</th><th>المدرب</th><th>المتدربون</th><th>الحضور</th><th>اللقاء القادم</th></tr></thead>
                <tbody>
                  {sections.map((s) => {
                    const r = sectionAttendanceRate(state, s.id)
                    const nx = nextSession(state, s.id)
                    return (
                      <tr key={s.id}>
                        <td><div className="bold">{s.title}</div><div className="xs muted ltr">{s.code}</div></td>
                        <td className="nowrap">{state.trainers.find((t) => t.id === s.trainerId)?.name}</td>
                        <td>{s.learnerIds.length}</td>
                        <td style={{ minWidth: 120 }}>{r === null ? <span className="muted small">ذاتي — لا لقاءات</span> : <div className="row small" style={{ gap: 8 }}><div className="grow"><Progress value={r} /></div>{pct(r)}</div>}</td>
                        <td className="small nowrap">{nx ? `${relDay(nx.at)} · ${fTime(nx.at)}` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2 className="card-title">آخر النشاطات</h2><Link to="/admin/learners?tab=activity" className="btn btn-ghost btn-sm">السجل الكامل<ArrowLeft /></Link></div>
            <div className="list">
              {state.activity.slice(0, 6).map((a) => (
                <div key={a.id} className="list-item">
                  <div className="icon-tile" style={{ width: 34, height: 34 }}><ActivityIcon size={16} /></div>
                  <div className="grow"><div className="small">{a.text}</div><div className="xs muted">{a.actor} · {relDay(a.at)} {fTime(a.at)}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="stack lg">
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 12 }}>تحتاج متابعة</h2>
            <div className="list">
              {follow.map((f) => (
                <Link key={f.t} to={f.to} className="list-item">
                  <div className={`icon-tile${f.n ? ' warning' : ''}`}>{f.icon}</div>
                  <div className="grow small">{f.t}</div>
                  <b>{f.n}</b>
                </Link>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2 className="card-title">تنبيهات الحضور</h2><AlertTriangle size={20} color="var(--warning)" /></div>
            {risk.length ? (
              <div className="list">
                {risk.map(({ l, st }) => (
                  <Link key={l.id} to={`/admin/learners?tab=attendance`} className="list-item">
                    <div className="grow"><div className="small bold">{l.name}</div><div className="xs muted">شعبة <span className="ltr">{l.sectionId}</span> · غياب {st.absent} من {st.held}</div></div>
                    <Badge tone={st.level === 'alert' ? 'danger' : 'warning'}>{pct(st.absencePct, 1)}</Badge>
                  </Link>
                ))}
              </div>
            ) : <Empty title="لا توجد تنبيهات" />}
            <div className="xs muted" style={{ marginTop: 12 }}>حد التنبيه التجريبي {state.settings.absenceThreshold}%؛ «يحتاج متابعة» من {Math.round(state.settings.absenceThreshold * 0.6)}%. لا حرمان تلقائي.</div>
          </div>
        </aside>
      </div>
    </div>
  )
}
