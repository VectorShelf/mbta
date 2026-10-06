export type ProgramType = 'diploma' | 'live' | 'recorded' | 'short'

export interface Lesson { id: string; title: string; minutes: number; kind: 'video' | 'reading'; summary: string; files: string[] }
export interface Unit { id: string; title: string; lessons: Lesson[] }
export interface Course { id: string; code: string; title: string; units: Unit[] }
export interface Term { id: string; title: string; courses: Course[] }

export interface Program {
  id: string
  title: string
  type: ProgramType
  domain: string
  mode: string
  duration: string
  summary: string
  description: string
  outcomes: string[]
  audience: string
  price: number
  trainerId: string
  featured: boolean
  published: boolean
  terms?: Term[]
  plan?: { title: string; items: string[] }[]
}

export interface Learner {
  id: string
  code: string
  name: string
  email: string
  phone: string
  sectionId: string | null
  status: 'active' | 'new' | 'archived'
  joined: string
  note?: string
}
export interface Trainer { id: string; code: string; name: string; title: string; bio: string; email: string }
export interface Staff { id: string; name: string; role: string; dept: string; email: string; work: 'office' | 'remote' | 'leave' | 'off' }

export interface Section {
  id: string
  code: string
  programId: string
  courseId?: string
  trainerId: string
  title: string
  start: string
  end: string
  days: string
  time: string
  learnerIds: string[]
  status: 'active' | 'upcoming'
}

export interface Session {
  id: string
  sectionId: string
  title: string
  at: string // ISO
  minutes: number
  status: 'held' | 'upcoming'
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'
export interface Attendance { sessionId: string; learnerId: string; status: AttendanceStatus }

export interface Assignment { id: string; sectionId: string; title: string; description: string; maxScore: number; due: string; createdAt: string }
export interface Submission {
  id: string
  assignmentId: string
  learnerId: string
  fileName: string
  fileSize: number
  submittedAt: string
  score?: number
  feedback?: string
  published: boolean
}
export interface Quiz { id: string; sectionId: string; title: string; at: string; minutes: number; maxScore: number; scores: Record<string, number> }

export interface Announcement { id: string; sectionId: string | null; title: string; body: string; at: string; author: string }
export interface Application { id: string; name: string; email: string; phone: string; programId: string; at: string; status: 'new' | 'review' | 'accepted' | 'rejected'; source: string }
export interface ServiceRequest { id: string; learnerId: string; type: string; details: string; at: string; status: 'pending' | 'approved' | 'rejected'; reply?: string }
export interface Excuse { id: string; learnerId: string; sessionId: string; reason: string; fileName?: string; at: string; status: 'pending' | 'accepted' | 'rejected' }
export interface Task { id: string; title: string; staffId: string; status: 'planned' | 'doing' | 'review' | 'done'; due: string; priority: 'high' | 'normal' | 'low' }
export interface Leave { id: string; staffId: string; type: string; from: string; to: string; days: number; status: 'pending' | 'approved' | 'rejected'; note: string }
export interface Activity { id: string; at: string; actor: string; text: string; kind: 'admission' | 'academic' | 'attendance' | 'content' | 'ops' }
export interface Material { id: string; sectionId: string; title: string; kind: string; at: string }

export interface SiteContent { heroTitle: string; heroSub: string; notice: string }

export interface DemoState {
  version: number
  seededAt: string
  programs: Program[]
  learners: Learner[]
  trainers: Trainer[]
  staff: Staff[]
  sections: Section[]
  sessions: Session[]
  attendance: Attendance[]
  assignments: Assignment[]
  submissions: Submission[]
  quizzes: Quiz[]
  announcements: Announcement[]
  applications: Application[]
  services: ServiceRequest[]
  excuses: Excuse[]
  tasks: Task[]
  leaves: Leave[]
  activity: Activity[]
  materials: Material[]
  progress: Record<string, string[]>
  notes: Record<string, string>
  settings: { absenceThreshold: number }
  site: SiteContent
}
