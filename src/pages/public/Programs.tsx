import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { useStore } from '../../store/store'
import ProgramCard from '../../components/ProgramCard'
import { Empty } from '../../components/ui'

const types = [
  { id: 'all', label: 'الكل' }, { id: 'diploma', label: 'دبلومات' }, { id: 'live', label: 'دورات مباشرة' },
  { id: 'recorded', label: 'دورات مسجلة' }, { id: 'short', label: 'برامج قصيرة' },
]

export default function Programs() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [domain, setDomain] = useState('all')
  const published = state.programs.filter((p) => p.published)
  const domains = [...new Set(published.map((p) => p.domain))]
  const list = useMemo(() => published.filter((p) =>
    (type === 'all' || p.type === type) && (domain === 'all' || p.domain === domain) &&
    (!q.trim() || (p.title + p.summary + p.domain).includes(q.trim())),
  ), [published, type, domain, q])

  return (
    <section className="site-section" style={{ paddingTop: 48 }}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">كتالوج البرامج</span>
          <h1 style={{ fontSize: 36, marginTop: 8 }}>البرامج التدريبية</h1>
          <p>دبلومات ودورات مباشرة ومسجلة وبرامج قصيرة في مجالات التدريب المختلفة.</p>
        </div>
        <div className="card tight" style={{ marginBottom: 24 }}>
          <div className="row wrap" style={{ gap: 12 }}>
            <div className="search grow" style={{ minWidth: 220 }}>
              <Search />
              <input className="input" placeholder="ابحث باسم البرنامج أو المجال" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في البرامج" />
            </div>
            <select className="select" style={{ width: 'auto', minWidth: 220 }} value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="المجال">
              <option value="all">كل المجالات</option>
              {domains.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="segmented" style={{ marginTop: 12, flexWrap: 'wrap' }} role="group" aria-label="نوع البرنامج">
            {types.map((t) => <button key={t.id} aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.label}</button>)}
          </div>
        </div>
        <p className="small muted" style={{ marginBottom: 16 }}>{list.length} من {published.length} برامج</p>
        {list.length ? (
          <div className="grid grid-3">{list.map((p) => <ProgramCard key={p.id} p={p} />)}</div>
        ) : (
          <div className="card"><Empty icon={<SearchX />} title="لا توجد برامج مطابقة" text="جرّب كلمة بحث أخرى أو أزل عوامل التصفية." action={<button className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setType('all'); setDomain('all') }}>إزالة التصفية</button>} /></div>
        )}
        <p className="xs muted" style={{ marginTop: 24 }}>جميع البرامج والأسعار في هذا النموذج أمثلة للعرض وليست عروضًا معتمدة.</p>
      </div>
    </section>
  )
}
