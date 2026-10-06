import type { DemoState, Program, Learner, Session, Attendance, AttendanceStatus, Submission } from './types'

/** تاريخ نسبي ليوم العرض — كل التواريخ تُحسب عند إنشاء البيانات أو إعادة ضبطها */
function at(dayOffset: number, hour = 19, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const MAIN_LEARNER = 'L01'
export const MAIN_TRAINER = 'T01'
export const MAIN_ADMIN = 'ST01'
export const MAIN_PROGRAM = 'pm-diploma'
export const MAIN_SECTION = 'PM-01'

const programs: Program[] = [
  {
    id: 'pm-diploma',
    title: 'دبلوم إدارة المشاريع',
    type: 'diploma',
    domain: 'إدارة المشاريع والأعمال',
    mode: 'مدمج: لقاءات مباشرة ومحتوى ذاتي',
    duration: 'فصلان تدريبيان',
    summary: 'مسار متدرج يبني مهارات تخطيط المشاريع وتنفيذها ومتابعة مخاطرها عبر تطبيقات عملية.',
    description:
      'يجمع الدبلوم بين المعرفة النظرية والممارسة العملية في إدارة المشاريع، بدءًا من المفاهيم الأساسية ودورة حياة المشروع، مرورًا بتخطيط النطاق والجدولة، وصولًا إلى إدارة المخاطر وتطبيق مشروع متكامل.',
    outcomes: [
      'فهم دورة حياة المشروع وأدوار فريق العمل',
      'إعداد بيان نطاق وهيكل تقسيم عمل لمشروع فعلي',
      'بناء جدول زمني وتقدير المدد والموارد',
      'تحديد المخاطر وتحليلها ووضع خطط الاستجابة',
    ],
    audience: 'الموظفون والقياديون الراغبون في إدارة المشاريع بمنهجية واضحة.',
    price: 9800,
    trainerId: 'T01',
    featured: true,
    published: true,
    terms: [
      {
        id: 'term-1',
        title: 'الفصل التدريبي الأول',
        courses: [
          {
            id: 'PM101', code: 'PM101', title: 'مبادئ إدارة المشاريع',
            units: [
              { id: 'u1', title: 'الوحدة 1: أساسيات المشروع', lessons: [
                { id: 'l01', title: 'ما هو المشروع؟', minutes: 14, kind: 'video', summary: 'تعريف المشروع وخصائصه والفرق بينه وبين العمليات التشغيلية.', files: ['ملخص-الدرس-1.pdf'] },
                { id: 'l02', title: 'دورة حياة المشروع', minutes: 18, kind: 'video', summary: 'مراحل البدء والتخطيط والتنفيذ والمراقبة والإغلاق.', files: ['دورة-حياة-المشروع.pdf'] },
              ] },
              { id: 'u2', title: 'الوحدة 2: الأدوار والحوكمة', lessons: [
                { id: 'l03', title: 'دور مدير المشروع وفريق العمل', minutes: 16, kind: 'video', summary: 'المسؤوليات والصلاحيات وأنماط التواصل داخل الفريق.', files: ['مصفوفة-الأدوار.xlsx'] },
              ] },
            ],
          },
          {
            id: 'PM102', code: 'PM102', title: 'تخطيط المشروع',
            units: [
              { id: 'u3', title: 'الوحدة 1: النطاق والمتطلبات', lessons: [
                { id: 'l04', title: 'مدخل إلى تخطيط المشروع', minutes: 12, kind: 'video', summary: 'لماذا نخطط؟ ومكونات خطة إدارة المشروع.', files: ['مدخل-التخطيط.pdf'] },
                { id: 'l05', title: 'تحديد أصحاب المصلحة ومتطلباتهم', minutes: 20, kind: 'video', summary: 'أدوات تحليل أصحاب المصلحة وجمع المتطلبات.', files: ['نموذج-تحليل-أصحاب-المصلحة.docx'] },
                { id: 'l06', title: 'بيان نطاق المشروع', minutes: 22, kind: 'video', summary: 'صياغة بيان النطاق وحدوده والافتراضات والقيود.', files: ['قالب-بيان-النطاق.docx'] },
              ] },
              { id: 'u4', title: 'الوحدة 2: الهيكلة والجدولة', lessons: [
                { id: 'l07', title: 'هيكل تقسيم العمل WBS', minutes: 19, kind: 'video', summary: 'تفكيك المخرجات إلى حزم عمل قابلة للإدارة.', files: ['مثال-WBS.pdf'] },
                { id: 'l08', title: 'الجدولة الزمنية وتقدير المدد', minutes: 24, kind: 'video', summary: 'تسلسل الأنشطة، المسار الحرج، وتقنيات تقدير المدد.', files: ['قالب-الجدول-الزمني.xlsx', 'تمرين-المسار-الحرج.pdf'] },
              ] },
            ],
          },
        ],
      },
      {
        id: 'term-2',
        title: 'الفصل التدريبي الثاني',
        courses: [
          {
            id: 'PM201', code: 'PM201', title: 'إدارة المخاطر',
            units: [
              { id: 'u5', title: 'الوحدة 1: تحديد المخاطر وتحليلها', lessons: [
                { id: 'l09', title: 'تحديد مخاطر المشروع', minutes: 17, kind: 'video', summary: 'أساليب تحديد المخاطر وسجل المخاطر.', files: ['سجل-المخاطر.xlsx'] },
                { id: 'l10', title: 'الاستجابة للمخاطر ومتابعتها', minutes: 21, kind: 'video', summary: 'استراتيجيات الاستجابة وخطط الطوارئ.', files: [] },
              ] },
            ],
          },
          {
            id: 'PM202', code: 'PM202', title: 'تطبيقات عملية',
            units: [
              { id: 'u6', title: 'الوحدة 1: المشروع التطبيقي', lessons: [
                { id: 'l11', title: 'إطلاق المشروع التطبيقي', minutes: 15, kind: 'reading', summary: 'متطلبات المشروع التطبيقي ومعايير التقييم.', files: ['دليل-المشروع-التطبيقي.pdf'] },
                { id: 'l12', title: 'عرض المشروع وإغلاقه', minutes: 18, kind: 'video', summary: 'تقرير الإغلاق والدروس المستفادة.', files: [] },
              ] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ai-work',
    title: 'الذكاء الاصطناعي في بيئة العمل',
    type: 'recorded',
    domain: 'الذكاء الاصطناعي والتحول الرقمي',
    mode: 'دورة مسجلة بوتيرة ذاتية',
    duration: '6 ساعات تدريبية',
    summary: 'تطبيقات عملية لأدوات الذكاء الاصطناعي في المهام اليومية وصناعة القرار.',
    description: 'دورة مسجلة تتناول الاستخدام المسؤول لأدوات الذكاء الاصطناعي في الكتابة والتحليل وتنظيم العمل، مع أمثلة تطبيقية وتمارين قصيرة.',
    outcomes: ['فهم قدرات أدوات الذكاء الاصطناعي وحدودها', 'صياغة طلبات فعالة للأدوات التوليدية', 'تطبيق مبادئ الاستخدام المسؤول وحماية البيانات'],
    audience: 'الموظفون في الإدارات المختلفة دون اشتراط خلفية تقنية.',
    price: 1200,
    trainerId: 'T02',
    featured: true,
    published: true,
    plan: [
      { title: 'الوحدة 1: مدخل إلى الذكاء الاصطناعي', items: ['المفاهيم الأساسية', 'أمثلة من بيئة العمل'] },
      { title: 'الوحدة 2: الأدوات التوليدية', items: ['صياغة الطلبات', 'التلخيص والكتابة', 'تحليل البيانات'] },
      { title: 'الوحدة 3: الاستخدام المسؤول', items: ['الخصوصية وحماية البيانات', 'التحقق من المخرجات'] },
    ],
  },
  {
    id: 'leadership',
    title: 'مهارات القيادة',
    type: 'live',
    domain: 'القيادة والإدارة',
    mode: 'دورة مباشرة عن بُعد',
    duration: '5 لقاءات مباشرة',
    summary: 'لقاءات تفاعلية لتطوير مهارات قيادة الفرق والتأثير واتخاذ القرار.',
    description: 'دورة مباشرة تركّز على الممارسات القيادية اليومية: بناء الفريق، التفويض، التغذية الراجعة، وإدارة الأداء، عبر حالات عملية ونقاشات موجهة.',
    outcomes: ['بناء رؤية مشتركة للفريق', 'تطبيق أساليب التفويض الفعال', 'تقديم تغذية راجعة بناءة'],
    audience: 'المشرفون والقادة الجدد ومسؤولو الفرق.',
    price: 2400,
    trainerId: 'T01',
    featured: true,
    published: true,
    plan: [
      { title: 'اللقاء 1–2', items: ['القائد وبناء الرؤية', 'أنماط القيادة'] },
      { title: 'اللقاء 3–4', items: ['التفويض والمتابعة', 'التغذية الراجعة'] },
      { title: 'اللقاء 5', items: ['خطة تطوير الفريق'] },
    ],
  },
  {
    id: 'hr-basics',
    title: 'أساسيات الموارد البشرية',
    type: 'short',
    domain: 'الموارد البشرية',
    mode: 'برنامج قصير حضوري أو عن بُعد',
    duration: 'يومان تدريبيان',
    summary: 'مدخل مركّز لوظائف الموارد البشرية: الاستقطاب، التهيئة، وإدارة الأداء.',
    description: 'برنامج قصير يعرّف المشاركين بالوظائف الأساسية للموارد البشرية وأدواتها العملية، مناسب للمنضمين حديثًا إلى الإدارة أو المسؤولين عن الفرق الصغيرة.',
    outcomes: ['فهم دورة الموظف داخل المنظمة', 'إعداد خطة تهيئة للموظف الجديد', 'استخدام نماذج تقييم الأداء'],
    audience: 'المنضمون حديثًا لإدارات الموارد البشرية ومديرو الفرق.',
    price: 900,
    trainerId: 'T03',
    featured: false,
    published: true,
    plan: [
      { title: 'اليوم الأول', items: ['الاستقطاب والاختيار', 'التهيئة والإدماج'] },
      { title: 'اليوم الثاني', items: ['إدارة الأداء', 'التطوير والاحتفاظ بالكفاءات'] },
    ],
  },
]

const names = [
  'محمد العتيبي', 'عبدالله الشهري', 'سارة المطيري', 'فيصل الغامدي', 'ريم السبيعي', 'تركي الدوسري', 'نوف الحربي', 'إبراهيم القحطاني',
  'لمى العنزي', 'خالد الزهراني', 'أسماء الشمري', 'بندر العمري', 'هند الرشيدي', 'ماجد البقمي', 'جواهر الأحمدي', 'سلطان الجهني',
  'دانة المالكي', 'يزيد الحارثي', 'العنود السهلي', 'عمر الشهراني', 'رهف القرشي', 'نايف العسيري', 'شهد الخالدي', 'مشعل الرويلي',
]
const sectionFor = (i: number) => (i < 8 ? 'PM-01' : i < 16 ? 'AI-01' : 'LD-01')
const learners: Learner[] = names.map((name, i) => ({
  id: `L${String(i + 1).padStart(2, '0')}`,
  code: `S2026${String(i + 1).padStart(3, '0')}`,
  name,
  email: `learner${String(i + 1).padStart(2, '0')}@demo.fgti.sa`,
  phone: `05${String(50000000 + i * 137911).slice(0, 8)}`,
  sectionId: sectionFor(i),
  status: 'active',
  joined: at(-60 + (i % 5), 10),
}))
learners.push(
  { id: 'A01', code: 'S2025014', name: 'وليد الفيفي', email: 'archive01@demo.fgti.sa', phone: '0551203344', sectionId: null, status: 'archived', joined: at(-300, 10), note: 'أتم دورة سابقة — سجل مؤرشف' },
  { id: 'A02', code: 'S2025022', name: 'منيرة الحمدان', email: 'archive02@demo.fgti.sa', phone: '0559087765', sectionId: null, status: 'archived', joined: at(-280, 10), note: 'انسحاب بطلب شخصي — سجل مؤرشف' },
)

const pmIds = learners.slice(0, 8).map((l) => l.id)
const aiIds = learners.slice(8, 16).map((l) => l.id)
const ldIds = learners.slice(16, 24).map((l) => l.id)

const pmHeldTitles = ['تعارف وأهداف المقرر', 'أصحاب المصلحة', 'جمع المتطلبات', 'بيان النطاق', 'ورشة: هيكل تقسيم العمل', 'مراجعة منتصف المقرر']
const sessions: Session[] = [
  ...pmHeldTitles.map((title, i) => ({ id: `S-PM-${i + 1}`, sectionId: 'PM-01', title, at: at(-42 + i * 7, 19), minutes: 90, status: 'held' as const })),
  { id: 'S-PM-7', sectionId: 'PM-01', title: 'تخطيط نطاق المشروع', at: at(0, 19), minutes: 90, status: 'upcoming' },
  { id: 'S-PM-8', sectionId: 'PM-01', title: 'الجدولة الزمنية والمسار الحرج', at: at(7, 19), minutes: 90, status: 'upcoming' },
  { id: 'S-PM-9', sectionId: 'PM-01', title: 'ورشة تطبيقية: خطة المشروع', at: at(14, 19), minutes: 90, status: 'upcoming' },
  ...['القائد وبناء الرؤية', 'أنماط القيادة', 'التفويض والمتابعة', 'التغذية الراجعة'].map((title, i) => ({ id: `S-LD-${i + 1}`, sectionId: 'LD-01', title, at: at(-24 + i * 7, 20), minutes: 75, status: 'held' as const })),
  { id: 'S-LD-5', sectionId: 'LD-01', title: 'خطة تطوير الفريق', at: at(4, 20), minutes: 75, status: 'upcoming' },
]

// الحضور الابتدائي للشعبة الرئيسية — محمد: 5 حاضر و1 غائب (اللقاء السادس)
const pmPattern: Record<string, AttendanceStatus[]> = {
  L01: ['present', 'present', 'present', 'present', 'present', 'absent'],
  L02: ['present', 'absent', 'present', 'late', 'absent', 'present'],
  L03: ['present', 'present', 'late', 'present', 'present', 'present'],
  L04: ['present', 'present', 'present', 'excused', 'present', 'present'],
  L05: ['late', 'present', 'present', 'present', 'absent', 'present'],
  L06: ['present', 'present', 'present', 'present', 'present', 'present'],
  L07: ['present', 'late', 'present', 'present', 'present', 'late'],
  L08: ['present', 'present', 'absent', 'present', 'present', 'present'],
}
const ldPattern: AttendanceStatus[][] = [
  ['present', 'present', 'present', 'present'], ['present', 'late', 'present', 'present'], ['present', 'present', 'absent', 'present'],
  ['present', 'present', 'present', 'late'], ['absent', 'present', 'present', 'present'], ['present', 'present', 'present', 'present'],
  ['late', 'present', 'present', 'present'], ['present', 'present', 'present', 'absent'],
]
const attendance: Attendance[] = [
  ...pmIds.flatMap((id) => pmPattern[id].map((status, i) => ({ sessionId: `S-PM-${i + 1}`, learnerId: id, status }))),
  ...ldIds.flatMap((id, li) => ldPattern[li].map((status, i) => ({ sessionId: `S-LD-${i + 1}`, learnerId: id, status }))),
]

const stakeholderScores = [17, 14, 18, 16, 15, 19, 13, 16]
const submissions: Submission[] = [
  ...pmIds.map((id, i) => ({
    id: `SUB-A1-${id}`, assignmentId: 'A1', learnerId: id, fileName: `تحليل-أصحاب-المصلحة-${i + 1}.pdf`, fileSize: 240000 + i * 9000,
    submittedAt: at(-11, 21), score: stakeholderScores[i], feedback: i === 0 ? 'تحليل جيد ومنظم، أضف مصفوفة التأثير والاهتمام في الأعمال القادمة.' : 'عمل جيد.', published: true,
  })),
  ...['L03', 'L04', 'L06'].map((id, i) => ({ id: `SUB-A2-${id}`, assignmentId: 'A2', learnerId: id, fileName: `وثيقة-النطاق-${id}.docx`, fileSize: 180000 + i * 12000, submittedAt: at(-1, 15 + i), published: false })),
  ...['L17', 'L19'].map((id) => ({ id: `SUB-A4-${id}`, assignmentId: 'A4', learnerId: id, fileName: `خطة-تطوير-الفريق-${id}.pdf`, fileSize: 210000, submittedAt: at(-1, 13), published: false })),
]

const progressCounts = [7, 9, 6, 8, 5, 10, 7, 4]
const lessonOrder = ['l01', 'l02', 'l03', 'l04', 'l05', 'l06', 'l07', 'l08', 'l09', 'l10', 'l11', 'l12']
const progress: Record<string, string[]> = Object.fromEntries(pmIds.map((id, i) => [id, lessonOrder.slice(0, progressCounts[i])]))

export function createSeed(): DemoState {
  return {
    version: 1,
    seededAt: new Date().toISOString(),
    programs: structuredClone(programs),
    learners: structuredClone(learners),
    trainers: [
      { id: 'T01', code: 'T2026001', name: 'نورة القحطاني', title: 'مدربة إدارة المشاريع والقيادة', bio: 'خبرة تدريبية في تخطيط المشاريع وقيادة الفرق — ملف تجريبي للعرض.', email: 'trainer01@demo.fgti.sa' },
      { id: 'T02', code: 'T2026002', name: 'فهد الشمري', title: 'مدرب التحول الرقمي', bio: 'متخصص في تطبيقات الذكاء الاصطناعي في بيئة العمل — ملف تجريبي.', email: 'trainer02@demo.fgti.sa' },
      { id: 'T03', code: 'T2026003', name: 'سارة البلوي', title: 'مدربة الموارد البشرية', bio: 'خبرة في التطوير المؤسسي وإدارة الأداء — ملف تجريبي.', email: 'trainer03@demo.fgti.sa' },
    ],
    staff: [
      { id: 'ST01', name: 'خالد الحربي', role: 'المشرف الأكاديمي', dept: 'الشؤون الأكاديمية', email: 'staff01@demo.fgti.sa', work: 'office' },
      { id: 'ST02', name: 'منى السبيعي', role: 'أخصائية شؤون المتدربين', dept: 'القبول والتسجيل', email: 'staff02@demo.fgti.sa', work: 'office' },
      { id: 'ST03', name: 'ياسر المالكي', role: 'أخصائي المحتوى الرقمي', dept: 'الحلول التعليمية', email: 'staff03@demo.fgti.sa', work: 'remote' },
      { id: 'ST04', name: 'لمى الزهراني', role: 'أخصائية الموارد البشرية', dept: 'الموارد البشرية والعمليات', email: 'staff04@demo.fgti.sa', work: 'office' },
    ],
    sections: [
      { id: 'PM-01', code: 'PM-01', programId: 'pm-diploma', courseId: 'PM102', trainerId: 'T01', title: 'تخطيط المشروع', start: at(-45, 9), end: at(30, 9), days: 'الأحد أسبوعيًا', time: '7:00 م', learnerIds: pmIds, status: 'active' },
      { id: 'AI-01', code: 'AI-01', programId: 'ai-work', trainerId: 'T02', title: 'الذكاء الاصطناعي في بيئة العمل', start: at(-20, 9), end: at(40, 9), days: 'وتيرة ذاتية', time: 'مرن', learnerIds: aiIds, status: 'active' },
      { id: 'LD-01', code: 'LD-01', programId: 'leadership', trainerId: 'T01', title: 'مهارات القيادة', start: at(-25, 9), end: at(5, 9), days: 'أسبوعيًا', time: '8:00 م', learnerIds: ldIds, status: 'active' },
    ],
    sessions,
    attendance,
    assignments: [
      { id: 'A1', sectionId: 'PM-01', title: 'تحليل أصحاب المصلحة', description: 'حدد أصحاب المصلحة لمشروع من اختيارك وصنّفهم حسب التأثير والاهتمام.', maxScore: 20, due: at(-10, 23, 59), createdAt: at(-17, 10) },
      { id: 'A2', sectionId: 'PM-01', title: 'إعداد وثيقة نطاق مشروع', description: 'أعد وثيقة نطاق لمشروع تطبيقي تتضمن الأهداف والمخرجات والحدود والافتراضات والقيود. الصيغة: PDF أو Word.', maxScore: 20, due: at(1, 23, 59), createdAt: at(-6, 10) },
      { id: 'A3', sectionId: 'PM-01', title: 'مخطط هيكل تقسيم العمل', description: 'ارسم هيكل تقسيم العمل لمشروعك حتى مستوى حزم العمل.', maxScore: 10, due: at(9, 23, 59), createdAt: at(-1, 10) },
      { id: 'A4', sectionId: 'LD-01', title: 'خطة تطوير فريق', description: 'صمم خطة تطوير لفريقك لمدة ثلاثة أشهر.', maxScore: 20, due: at(3, 23, 59), createdAt: at(-8, 10) },
    ],
    submissions,
    quizzes: [
      { id: 'Q1', sectionId: 'PM-01', title: 'اختبار قصير: مبادئ التخطيط', at: at(-12, 19, 30), minutes: 20, maxScore: 10, scores: Object.fromEntries(pmIds.map((id, i) => [id, [8, 7, 9, 8, 6, 10, 7, 8][i]])) },
      { id: 'Q2', sectionId: 'PM-01', title: 'اختبار منتصف المقرر', at: at(10, 19), minutes: 45, maxScore: 30, scores: {} },
    ],
    announcements: [
      { id: 'N1', sectionId: 'PM-01', title: 'ملخص اللقاء السادس متاح', body: 'تمت إضافة ملخص لقاء المراجعة إلى محتوى الشعبة. راجعوه قبل لقاء تخطيط النطاق.', at: at(-6, 21), author: 'نورة القحطاني' },
      { id: 'N2', sectionId: null, title: 'مواعيد الفصل التدريبي الثاني', body: 'يبدأ الفصل التدريبي الثاني للدبلوم بعد اكتمال تقييمات الفصل الأول. ستُعلن التفاصيل عبر المنصة.', at: at(-3, 10), author: 'الشؤون الأكاديمية' },
    ],
    applications: [
      { id: 'AP1', name: 'ريان الدوسري', email: 'applicant01@demo.fgti.sa', phone: '0553401122', programId: 'pm-diploma', at: at(-2, 11), status: 'new', source: 'الموقع' },
      { id: 'AP2', name: 'هيا العنزي', email: 'applicant02@demo.fgti.sa', phone: '0558904433', programId: 'leadership', at: at(-4, 14), status: 'review', source: 'الموقع' },
      { id: 'AP3', name: 'سلمان القرني', email: 'applicant03@demo.fgti.sa', phone: '0556702211', programId: 'hr-basics', at: at(-1, 9), status: 'new', source: 'جهة' },
    ],
    services: [
      { id: 'SR1', learnerId: 'L03', type: 'إفادة انتظام', details: 'لتقديمها إلى جهة العمل', at: at(-5, 10), status: 'approved', reply: 'تم إصدار الإفادة (معاينة تجريبية).' },
      { id: 'SR2', learnerId: 'L08', type: 'كشف درجات', details: 'كشف درجات الفصل الحالي', at: at(-1, 12), status: 'pending' },
      { id: 'SR3', learnerId: 'L18', type: 'طلب تأجيل', details: 'تأجيل حضور اللقاء الأخير لظرف عمل', at: at(-2, 16), status: 'pending' },
    ],
    excuses: [
      { id: 'EX1', learnerId: 'L01', sessionId: 'S-PM-6', reason: 'ظرف صحي طارئ', fileName: 'تقرير-طبي.pdf', at: at(-6, 10), status: 'pending' },
      { id: 'EX2', learnerId: 'L05', sessionId: 'S-PM-5', reason: 'مهمة عمل خارج المدينة', fileName: 'خطاب-جهة-العمل.pdf', at: at(-13, 11), status: 'pending' },
    ],
    tasks: [
      { id: 'TK1', title: 'مراجعة طلبات القبول الجديدة', staffId: 'ST02', status: 'doing', due: at(1, 12), priority: 'high' },
      { id: 'TK2', title: 'رفع محتوى وحدة إدارة المخاطر', staffId: 'ST03', status: 'planned', due: at(6, 12), priority: 'normal' },
      { id: 'TK3', title: 'تجهيز تقرير الحضور الشهري', staffId: 'ST01', status: 'review', due: at(2, 12), priority: 'normal' },
      { id: 'TK4', title: 'تحديث صفحة البرامج في الموقع', staffId: 'ST03', status: 'doing', due: at(3, 12), priority: 'low' },
      { id: 'TK5', title: 'اعتماد جدول الفصل الثاني', staffId: 'ST01', status: 'planned', due: at(8, 12), priority: 'high' },
      { id: 'TK6', title: 'إعداد خطة تهيئة الموظفين الجدد', staffId: 'ST04', status: 'planned', due: at(10, 12), priority: 'normal' },
      { id: 'TK7', title: 'التواصل مع متدربي شعبة القيادة', staffId: 'ST02', status: 'done', due: at(-2, 12), priority: 'normal' },
      { id: 'TK8', title: 'مراجعة سياسة الإجازات', staffId: 'ST04', status: 'done', due: at(-5, 12), priority: 'low' },
    ],
    leaves: [
      { id: 'LV1', staffId: 'ST04', type: 'إجازة سنوية', from: at(12, 8), to: at(15, 8), days: 4, status: 'pending', note: 'ظرف عائلي' },
      { id: 'LV2', staffId: 'ST03', type: 'إجازة اضطرارية', from: at(-9, 8), to: at(-9, 8), days: 1, status: 'approved', note: '' },
    ],
    activity: [
      { id: 'AC1', at: at(-1, 9, 12), actor: 'النظام', text: 'طلب قبول جديد من سلمان القرني — أساسيات الموارد البشرية', kind: 'admission' },
      { id: 'AC2', at: at(-1, 15, 40), actor: 'سارة المطيري', text: 'تسليم واجب «إعداد وثيقة نطاق مشروع»', kind: 'academic' },
      { id: 'AC3', at: at(-6, 21, 5), actor: 'نورة القحطاني', text: 'نشر إعلان «ملخص اللقاء السادس متاح» لشعبة PM-01', kind: 'content' },
      { id: 'AC4', at: at(-7, 21, 0), actor: 'نورة القحطاني', text: 'رصد حضور لقاء «مراجعة منتصف المقرر»', kind: 'attendance' },
    ],
    materials: [
      { id: 'M1', sectionId: 'PM-01', title: 'عرض لقاء بيان النطاق', kind: 'عرض تقديمي', at: at(-21, 21) },
      { id: 'M2', sectionId: 'PM-01', title: 'ملخص لقاء المراجعة', kind: 'ملف PDF', at: at(-6, 21) },
      { id: 'M3', sectionId: 'PM-01', title: 'قالب وثيقة النطاق', kind: 'قالب Word', at: at(-6, 21) },
    ],
    progress,
    notes: {},
    settings: { absenceThreshold: 25 },
    site: {
      heroTitle: 'نحو مستقبل مهني واعد',
      heroSub: 'برامج تدريبية وتجارب تعلم تجمع المعرفة بالتطبيق، لتطوير قدرات الأفراد ورفع كفاءة المؤسسات.',
      notice: '',
    },
  }
}
