import { useState } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Upload, FileCheck2, Radio, Clock, Users } from 'lucide-react'
import type { Assignment, Session } from '../data/types'
import { useStore, newId } from '../store/store'
import { Modal, Callout, Avatar, Badge } from './ui'
import { fDay, fTime, fDateTime, fSize, relDay } from '../lib/format'
import { MAIN_LEARNER } from '../data/seed'

export function LiveRoom({ session, role, onClose }: { session: Session; role: 'learner' | 'trainer'; onClose: () => void }) {
  const { state } = useStore()
  const [joined, setJoined] = useState(false)
  const [mic, setMic] = useState(false)
  const [cam, setCam] = useState(role === 'trainer')
  const section = state.sections.find((s) => s.id === session.sectionId)
  const trainer = state.trainers.find((t) => t.id === section?.trainerId)
  const others = (section?.learnerIds ?? []).slice(0, 4).map((id) => state.learners.find((l) => l.id === id)!).filter(Boolean)
  return (
    <Modal wide title={session.title} sub={`${section?.code} · ${fDay(session.at)} · ${fTime(session.at)} بتوقيت الرياض`} onClose={onClose}
      footer={joined ? (
        <>
          <button className="btn btn-secondary" onClick={() => setMic(!mic)} aria-pressed={mic}>{mic ? <Mic /> : <MicOff />}{mic ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}</button>
          <button className="btn btn-secondary" onClick={() => setCam(!cam)} aria-pressed={cam}>{cam ? <Video /> : <VideoOff />}{cam ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}</button>
          <button className="btn btn-danger" onClick={onClose}><PhoneOff />مغادرة الجلسة</button>
        </>
      ) : (
        <>
          <button className="btn btn-primary" onClick={() => setJoined(true)}><Radio />{role === 'trainer' ? 'بدء الجلسة' : 'الانضمام إلى الجلسة'}</button>
          <button className="btn btn-secondary" onClick={onClose}>لاحقًا</button>
        </>
      )}>
      {!joined ? (
        <div className="stack">
          <div className="live-stage" style={{ gridTemplateColumns: '1fr' }}>
            <div className="live-tile" style={{ flexDirection: 'column', gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={32} color="var(--gold-400)" />
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 17 }}>غرفة الانتظار</div>
              <div>تبدأ الجلسة {relDay(session.at)} الساعة {fTime(session.at)}</div>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 16 }}>
            <span className="row small" style={{ gap: 6 }}><Users size={16} />{section?.learnerIds.length} متدربين في الشعبة</span>
            <span className="row small" style={{ gap: 6 }}><Clock size={16} />{session.minutes} دقيقة</span>
          </div>
          <Callout tone="warning">جلسة محاكاة داخل الديمو: لا يوجد اتصال فعلي بـ Zoom أو Teams، ولا يُسجَّل الحضور آليًا — يرصده المدرب يدويًا.</Callout>
        </div>
      ) : (
        <div className="stack">
          <div className="live-stage">
            <div className="live-tile" style={{ gridRow: 'span 2' }}>
              <Avatar name={trainer?.name ?? 'م'} size="lg" dark />
              <span className="nm">{trainer?.name} — المدربة</span>
              <span className="badge danger" style={{ position: 'absolute', top: 10, insetInlineEnd: 10 }}>مباشر (محاكاة)</span>
            </div>
            <div className="live-tile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 6, background: 'transparent' }}>
              {others.slice(0, 4).map((o) => (
                <div key={o.id} className="live-tile" style={{ minHeight: 0 }}>
                  <Avatar name={o.name} dark />
                  <span className="nm" style={{ fontSize: 10 }}>{o.id === MAIN_LEARNER && role === 'learner' ? 'أنت' : o.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="small muted">أنت الآن داخل معاينة الجلسة. الميكروفون {mic ? 'مفعّل' : 'مكتوم'}، والكاميرا {cam ? 'مفعّلة' : 'متوقفة'}.</p>
        </div>
      )}
    </Modal>
  )
}

export function SubmitModal({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const { mutate, toast, state } = useStore()
  const [file, setFile] = useState<File | null>(null)
  const learner = state.learners.find((l) => l.id === MAIN_LEARNER)!
  const submit = () => {
    if (!file) return
    const now = new Date().toISOString()
    mutate((d) => {
      d.submissions = d.submissions.filter((s) => !(s.assignmentId === assignment.id && s.learnerId === MAIN_LEARNER))
      d.submissions.push({ id: newId('SUB'), assignmentId: assignment.id, learnerId: MAIN_LEARNER, fileName: file.name, fileSize: file.size, submittedAt: now, published: false })
    }, { actor: learner.name, text: `تسليم واجب «${assignment.title}»`, kind: 'academic' })
    toast(`سُلّم الواجب «${assignment.title}» — يظهر الآن في تسليمات المدرب`)
    onClose()
  }
  return (
    <Modal title="تسليم الواجب" sub={assignment.title} onClose={onClose} footer={<>
      <button className="btn btn-primary" disabled={!file} onClick={submit}><Upload />تأكيد التسليم</button>
      <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
    </>}>
      <p className="small muted">{assignment.description}</p>
      <div className="row wrap small" style={{ gap: 16 }}>
        <span>الدرجة القصوى: <b>{assignment.maxScore}</b></span>
        <span>آخر موعد: <b>{relDay(assignment.due)} — {fTime(assignment.due)}</b></span>
      </div>
      <label className="file-drop" style={{ position: 'relative' }}>
        <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div className="stack sm" style={{ alignItems: 'center' }}>
            <FileCheck2 size={28} color="var(--success)" />
            <div className="bold" style={{ wordBreak: 'break-all' }}>{file.name}</div>
            <div className="xs muted">{fSize(file.size)} · تاريخ التسليم: {fDateTime(new Date().toISOString())}</div>
            <span className="xs" style={{ color: 'var(--gold-800)', fontWeight: 600 }}>اختيار ملف آخر</span>
          </div>
        ) : (
          <div className="stack sm" style={{ alignItems: 'center' }}>
            <Upload size={26} color="var(--gold-700)" />
            <div className="bold">اختر ملفًا من جهازك</div>
            <div className="xs muted">PDF أو Word أو PowerPoint</div>
          </div>
        )}
      </label>
      <p className="xs muted">يُحفظ اسم الملف وتاريخ التسليم داخل الديمو فقط؛ لا يُرفع الملف إلى أي خادم.</p>
    </Modal>
  )
}

export function SubmissionStatus({ assignmentId, learnerId }: { assignmentId: string; learnerId: string }) {
  const { state } = useStore()
  const a = state.assignments.find((x) => x.id === assignmentId)!
  const sub = state.submissions.find((s) => s.assignmentId === assignmentId && s.learnerId === learnerId)
  if (sub?.published && sub.score !== undefined) return <Badge tone="success">الدرجة {sub.score}/{a.maxScore}</Badge>
  if (sub) return <Badge tone="info">مُسلّم — بانتظار التصحيح</Badge>
  if (new Date(a.due).getTime() < Date.now()) return <Badge tone="danger">فات الموعد</Badge>
  return <Badge tone="warning">لم يُسلَّم</Badge>
}
