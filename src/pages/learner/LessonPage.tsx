import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Play, Pause, CheckCircle2, Circle, ChevronLeft, ArrowLeft, ArrowRight, FileText, Download, Lock, NotebookPen, Check } from 'lucide-react'
import { useStore } from '../../store/store'
import { Tabs, Empty, Badge, Progress } from '../../components/ui'
import { allLessons, lessonProgress } from '../../lib/calc'
import { MAIN_LEARNER, MAIN_PROGRAM } from '../../data/seed'

export default function LessonPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, mutate, toast } = useStore()
  const program = state.programs.find((p) => p.id === MAIN_PROGRAM)!
  const lessons = allLessons(program)
  const idx = lessons.findIndex((l) => l.id === id)
  const lesson = lessons[idx]
  const me = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const [tab, setTab] = useState<'overview' | 'files' | 'notes'>('overview')
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [note, setNote] = useState(state.notes[id ?? ''] ?? '')

  useEffect(() => { setPlaying(false); setPos(0); setNote(state.notes[id ?? ''] ?? ''); setTab('overview') }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setPos((p) => Math.min(100, p + 1)), 120)
    return () => clearInterval(t)
  }, [playing])
  useEffect(() => { if (pos >= 100) setPlaying(false) }, [pos])

  if (!lesson) return <Empty title="الدرس غير موجود" action={<Link to={`/learner/program/${MAIN_PROGRAM}`} className="btn btn-primary">العودة للبرنامج</Link>} />

  const prog = lessonProgress(state, me.id, program.id)
  const done = new Set(prog.doneIds)
  const isDone = done.has(lesson.id)
  const term = program.terms!.find((t) => t.courses.some((c) => c.id === lesson.courseId))!
  const termStarted = term.courses.some((c) => c.units.some((u) => u.lessons.some((l) => done.has(l.id))))
  const section = state.sections.find((s) => s.id === me.sectionId)!
  const isCurrentTerm = term.courses.some((c) => c.id === section.courseId)
  if (!isCurrentTerm && !termStarted) {
    return <div className="card"><Empty icon={<Lock />} title="هذا الدرس يُتاح في الفصل التدريبي القادم" text={`${lesson.courseTitle} — ${term.title}`} action={<Link to={`/learner/program/${MAIN_PROGRAM}`} className="btn btn-primary">العودة للبرنامج</Link>} /></div>
  }
  const course = term.courses.find((c) => c.id === lesson.courseId)!
  const prev = lessons[idx - 1]
  const currentTerm = program.terms!.find((t) => t.courses.some((c) => c.id === section.courseId))!
  const accessible = (lid: string) => {
    const t = program.terms!.find((x) => x.courses.some((c) => c.units.some((u) => u.lessons.some((l) => l.id === lid))))!
    return t.id === currentTerm.id || t.courses.some((c) => c.units.some((u) => u.lessons.some((l) => done.has(l.id))))
  }
  const next = lessons[idx + 1] && accessible(lessons[idx + 1].id) ? lessons[idx + 1] : undefined

  const toggleComplete = () => {
    const willBeDone = !isDone
    mutate((d) => {
      const list = d.progress[me.id] ?? []
      d.progress[me.id] = willBeDone ? [...new Set([...list, lesson.id])] : list.filter((x) => x !== lesson.id)
    }, willBeDone ? { actor: me.name, text: `إكمال درس «${lesson.title}»`, kind: 'academic' } : undefined)
    const newDone = prog.done + (willBeDone ? 1 : -1)
    toast(willBeDone
      ? `اكتمل الدرس — تقدمك في البرنامج الآن ${Math.round((newDone / prog.total) * 100)}% (${newDone} من ${prog.total})`
      : 'أُلغي إكمال الدرس')
  }
  const saveNote = () => {
    mutate((d) => { d.notes[lesson.id] = note })
    toast('حُفظت ملاحظتك على هذا الدرس')
  }

  return (
    <div>
      <nav className="row small muted wrap" style={{ gap: 6, marginBottom: 16 }} aria-label="مسار التنقل">
        <Link to={`/learner/program/${MAIN_PROGRAM}`}>{program.title}</Link><ChevronLeft size={14} />
        <span>{course.title}</span><ChevronLeft size={14} />
        <span style={{ color: 'var(--text)' }}>{lesson.title}</span>
      </nav>
      <div className="main-aside">
        <div className="stack lg">
          <div className="player">
            <div className="stack sm" style={{ alignItems: 'center', textAlign: 'center', padding: 16 }}>
              <button className="play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'إيقاف المعاينة' : 'تشغيل المعاينة'}>{playing ? <Pause /> : <Play />}</button>
              <div style={{ marginTop: 10, fontWeight: 600 }}>{lesson.title}</div>
              <div className="xs" style={{ color: '#BDB7AD' }}>مساحة معاينة — لا يوجد ملف فيديو مرفق في هذا النموذج</div>
            </div>
            <div className="bar">
              <span className="ltr">{String(Math.floor((pos / 100) * lesson.minutes)).padStart(2, '0')}:00</span>
              <div className="grow" style={{ height: 4, background: 'rgba(255,255,255,.25)', borderRadius: 4 }}><div style={{ width: `${pos}%`, height: '100%', background: 'var(--gold-400)', borderRadius: 4 }} /></div>
              <span className="ltr">{lesson.minutes}:00</span>
            </div>
          </div>

          <div className="row between wrap" style={{ gap: 16 }}>
            <div>
              <div className="eyebrow">{lesson.unitTitle}</div>
              <h1 style={{ fontSize: 26, marginTop: 4 }}>{lesson.title}</h1>
            </div>
            <div className="row wrap">
              <button className={`btn ${isDone ? 'btn-secondary' : 'btn-success'}`} onClick={toggleComplete}>
                {isDone ? <><CheckCircle2 color="var(--success)" />مكتمل — إلغاء</> : <><Check />إكمال الدرس</>}
              </button>
              {next && <button className="btn btn-primary" onClick={() => nav(`/learner/lesson/${next.id}`)}>الدرس التالي<ArrowLeft /></button>}
            </div>
          </div>

          <div className="card">
            <Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'نظرة عامة' }, { id: 'files', label: 'الملفات', count: lesson.files.length }, { id: 'notes', label: 'ملاحظاتي' }]} />
            {tab === 'overview' && (
              <div className="stack">
                <p>{lesson.summary}</p>
                <dl className="kv"><dt>المقرر</dt><dd>{course.title} <span className="ltr muted">({course.code})</span></dd><dt>المدة</dt><dd>{lesson.minutes} دقيقة</dd><dt>النوع</dt><dd>{lesson.kind === 'video' ? 'درس مرئي' : 'قراءة موجهة'}</dd></dl>
              </div>
            )}
            {tab === 'files' && (lesson.files.length ? (
              <div className="list">
                {lesson.files.map((f) => (
                  <div key={f} className="list-item">
                    <div className="icon-tile"><FileText /></div>
                    <div className="grow"><div className="bold small">{f}</div><div className="xs muted">ملف مرفق للدرس (عيّنة)</div></div>
                    <button className="btn btn-secondary btn-sm" onClick={() => toast('ملفات الدروس غير مرفقة في نموذج العرض', 'error')}><Download />تنزيل</button>
                  </div>
                ))}
              </div>
            ) : <Empty title="لا توجد ملفات لهذا الدرس" icon={<FileText />} />)}
            {tab === 'notes' && (
              <div className="stack">
                <label className="label" htmlFor="lesson-note">ملاحظاتك الخاصة على الدرس</label>
                <textarea id="lesson-note" className="textarea" rows={5} value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب أبرز النقاط التي تريد الرجوع إليها…" />
                <div className="row"><button className="btn btn-primary btn-sm" onClick={saveNote} disabled={note === (state.notes[lesson.id] ?? '')}><NotebookPen />حفظ الملاحظة</button><span className="xs muted">تُحفظ على هذا المتصفح فقط</span></div>
              </div>
            )}
          </div>
          <div className="row between">
            {prev ? <Link to={`/learner/lesson/${prev.id}`} className="btn btn-ghost"><ArrowRight />{prev.title}</Link> : <span />}
            {next ? <Link to={`/learner/lesson/${next.id}`} className="btn btn-ghost">{next.title}<ArrowLeft /></Link> : <span className="small muted">آخر دروس الفصل الحالي</span>}
          </div>
        </div>

        <aside className="card" style={{ position: 'sticky', top: 96, padding: 18 }}>
          <div className="stack sm" style={{ marginBottom: 12 }}>
            <div className="eyebrow ltr" style={{ textAlign: 'right' }}>{course.code}</div>
            <div className="bold">{course.title}</div>
            <div className="row small muted" style={{ gap: 8 }}><div className="grow"><Progress value={prog.pct} dark label="تقدم البرنامج" /></div>{prog.done}/{prog.total}</div>
          </div>
          {course.units.map((u) => (
            <div key={u.id} style={{ marginTop: 12 }}>
              <div className="unit-title" style={{ paddingInline: 12 }}>{u.title}</div>
              {u.lessons.map((l) => (
                <Link key={l.id} to={`/learner/lesson/${l.id}`} className={`lesson-nav-item${l.id === lesson.id ? ' current' : ''}`} aria-current={l.id === lesson.id ? 'page' : undefined}>
                  {done.has(l.id) ? <CheckCircle2 className="done" /> : <Circle />}
                  <span className="grow">{l.title}</span>
                  <span className="xs muted">{l.minutes} د</span>
                </Link>
              ))}
            </div>
          ))}
          <div className="divider" style={{ margin: '14px 0' }} />
          <Link to={`/learner/program/${MAIN_PROGRAM}`} className="btn btn-secondary btn-sm btn-block">كل مقررات البرنامج</Link>
          {isDone && <div style={{ marginTop: 10, textAlign: 'center' }}><Badge tone="success">أكملت هذا الدرس</Badge></div>}
        </aside>
      </div>
    </div>
  )
}
