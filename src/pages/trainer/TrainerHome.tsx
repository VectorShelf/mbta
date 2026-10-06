import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Video, UserCheck, ClipboardCheck, Megaphone, FilePlus2, Users, CalendarClock, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react'
import { useStore } from '../../store/store'
import { Badge, Empty, Avatar, Progress } from '../../components/ui'
import { LiveRoom } from '../../components/shared'
import { nextSession, sectionAttendanceRate, pct } from '../../lib/calc'
import { fDay, fTime, relDay } from '../../lib/format'
import { MAIN_TRAINER } from '../../data/seed'
import type { Session } from '../../data/types'

export default function TrainerHome() {
  const { state } = useStore()
  const me = state.trainers.find((t) => t.id === MAIN_TRAINER)!
  const sections = state.sections.filter((s) => s.trainerId === me.id)
  const ids = sections.map((s) => s.id)
  const upcoming = state.sessions.filter((s) => ids.includes(s.sectionId) && s.status === 'upcoming').sort((a, b) => a.at.localeCompare(b.at))
  const today = upcoming.find((s) => relDay(s.at) === 'اليوم')
  const featured = today ?? upcoming[0]
  const pending = state.submissions
    .filter((s) => !s.published)
    .map((s) => ({ s, a: state.assignments.find((a) => a.id === s.assignmentId)! }))
    .filter(({ a }) => a && ids.includes(a.sectionId))
    .sort((x, y) => y.s.submittedAt.localeCompare(x.s.submittedAt))
  const [live, setLive] = useState<Session | null>(null)
  const firstSec = sections[0]

  return (
    <div className="stack lg">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">بوابة المدرب</div>
          <h1 className="page-title">مرحبًا، {me.name.split(' ')[0]}</h1>
          <p className="page-sub">{featured ? <>لديك لقاء {relDay(featured.at)} الساعة {fTime(featured.at)} · </> : null}{pending.length} تسليمات تنتظر التصحيح</p>
        </div>
        {featured && <button className="btn btn-primary btn-lg" onClick={() => setLive(featured)}><Video />{today ? 'بدء لقاء اليوم' : 'معاينة اللقاء القادم'}</button>}
      </div>

      <div className="main-aside">
        <div className="stack lg">
          {featured && (
            <div className="card" style={{ borderColor: 'var(--gold-300)' }}>
              <div className="row top wrap" style={{ gap: 20 }}>
                <div className="icon-tile dark" style={{ width: 56, height: 56 }}><CalendarClock /></div>
                <div className="grow" style={{ minWidth: 200 }}>
                  <div className="row wrap" style={{ gap: 8 }}><span className="eyebrow">{today ? 'لقاء اليوم' : 'اللقاء القادم'}</span><span className="badge neutral plain ltr">{featured.sectionId}</span></div>
                  <div className="bold" style={{ fontSize: 19, marginTop: 4 }}>{featured.title}</div>
                  <div className="small muted">{fDay(featured.at)} · {fTime(featured.at)} بتوقيت الرياض · {featured.minutes} دقيقة</div>
                </div>
                <div className="row wrap">
                  <button className="btn btn-primary" onClick={() => setLive(featured)}><Video />{today ? 'بدء الجلسة' : 'معاينة'}</button>
                  <Link to={`/trainer/sections/${featured.sectionId}?tab=attendance&session=${featured.id}`} className="btn btn-secondary"><UserCheck />رصد الحضور</Link>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="section-title" style={{ marginBottom: 14 }}>شعبي</h2>
            <div className="grid grid-2">
              {sections.map((s) => {
                const program = state.programs.find((p) => p.id === s.programId)!
                const rate = sectionAttendanceRate(state, s.id)
                const nx = nextSession(state, s.id)
                return (
                  <Link key={s.id} to={`/trainer/sections/${s.id}`} className="card card-link stack sm">
                    <div className="row between"><span className="badge dark plain ltr">{s.code}</span><span className="xs muted">{program.title}</span></div>
                    <div className="bold" style={{ fontSize: 18, marginTop: 6 }}>{s.title}</div>
                    <div className="row wrap small muted" style={{ gap: 16 }}>
                      <span className="row" style={{ gap: 6 }}><Users size={16} />{s.learnerIds.length} متدربين</span>
                      {nx && <span className="row" style={{ gap: 6 }}><CalendarClock size={16} />{relDay(nx.at)}</span>}
                    </div>
                    {rate !== null && (
                      <div style={{ marginTop: 8 }}>
                        <div className="row between xs muted" style={{ marginBottom: 6 }}><span>نسبة الحضور</span><b style={{ color: 'var(--text)' }}>{pct(rate)}</b></div>
                        <Progress value={rate} label="نسبة الحضور" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="stack lg">
          <div className="card">
            <div className="card-head"><h2 className="card-title">تنتظر التصحيح</h2>{pending.length > 0 && <Badge tone="warning">{pending.length}</Badge>}</div>
            {pending.length ? (
              <div className="list">
                {pending.slice(0, 5).map(({ s, a }) => {
                  const l = state.learners.find((x) => x.id === s.learnerId)!
                  return (
                    <Link key={s.id} to={`/trainer/sections/${a.sectionId}?tab=assignments&a=${a.id}`} className="list-item">
                      <Avatar name={l.name} />
                      <div className="grow"><div className="small bold">{l.name}</div><div className="xs muted">{a.title} · {relDay(s.submittedAt)}</div></div>
                      <ArrowLeft size={16} color="var(--gold-800)" />
                    </Link>
                  )
                })}
              </div>
            ) : <Empty icon={<CheckCircle2 />} title="لا توجد تسليمات معلقة" />}
          </div>
          {firstSec && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 12 }}>وصول سريع للتحضير</h2>
              <div className="stack sm">
                <Link to={`/trainer/sections/${firstSec.id}?tab=assignments&new=1`} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><FilePlus2 />إنشاء واجب</Link>
                <Link to={`/trainer/sections/${firstSec.id}?tab=announcements&new=1`} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Megaphone />نشر إعلان للشعبة</Link>
                <Link to={`/trainer/sections/${firstSec.id}?tab=content`} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><BookOpen />محتوى المقرر</Link>
                <Link to={`/trainer/sections/${firstSec.id}?tab=grades`} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><ClipboardCheck />سجل الدرجات</Link>
              </div>
            </div>
          )}
        </aside>
      </div>
      {live && <LiveRoom session={live} role="trainer" onClose={() => setLive(null)} />}
    </div>
  )
}
