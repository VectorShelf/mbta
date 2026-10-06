import { Link } from 'react-router-dom'
import { Clock, MonitorPlay, ArrowLeft } from 'lucide-react'
import type { Program } from '../data/types'
import { typeLabel } from '../lib/format'

const tops: Record<string, { bg: string; bars: string[] }> = {
  diploma: { bg: '#29282A', bars: ['#664E2A', '#B99A62', '#806339', '#C7AA73'] },
  recorded: { bg: '#F2EAD8', bars: ['#D6BF8F', '#B99A62', '#E5D5B3', '#C7AA73'] },
  live: { bg: '#664E2A', bars: ['#806339', '#B99A62', '#9B7D46', '#D6BF8F'] },
  short: { bg: '#FAF7F0', bars: ['#E5D5B3', '#D6BF8F', '#F2EAD8', '#C7AA73'] },
}

export function ProgramTop({ type, height = 112 }: { type: string; height?: number | string }) {
  const t = tops[type] ?? tops.short
  const hs = [0.55, 0.85, 0.7, 0.45]
  return (
    <div className="pc-top" style={{ background: t.bg, height }} aria-hidden="true">
      <svg viewBox="0 0 300 112" preserveAspectRatio="xMinYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {t.bars.map((c, i) => (
          <rect key={i} x={24 + i * 26} y={112 - hs[i] * 90} width="18" height={hs[i] * 90} rx="2" fill={c} />
        ))}
      </svg>
    </div>
  )
}

export default function ProgramCard({ p }: { p: Program }) {
  const dark = p.type === 'diploma' || p.type === 'live'
  return (
    <Link to={`/programs/${p.id}`} className="card card-link program-card">
      <div style={{ position: 'relative' }}>
        <ProgramTop type={p.type} />
        <span className={`badge plain ${dark ? '' : 'dark'}`} style={{ position: 'absolute', top: 14, insetInlineEnd: 14, background: dark ? 'rgba(255,255,255,.92)' : undefined }}>{typeLabel[p.type]}</span>
      </div>
      <div className="pc-body">
        <div className="eyebrow">{p.domain}</div>
        <h3>{p.title}</h3>
        <div className="meta">
          <span><MonitorPlay />{p.mode}</span>
          <span><Clock />{p.duration}</span>
        </div>
        <div className="pc-foot">
          <span className="small muted">التفاصيل والتقديم</span>
          <ArrowLeft size={18} color="var(--gold-800)" />
        </div>
      </div>
    </Link>
  )
}
