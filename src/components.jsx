import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HF, useTheme } from './theme.jsx';
import { Icon } from './components/Icon.jsx';

/* ───────────────────────────────────────────────────────────────────────────
 * Layout / chrome
 * ─────────────────────────────────────────────────────────────────────────── */

export function TitleBlock({ greeting, title, subtitle, style }) {
  return (
    <div style={{ padding: '4px 24px 0', ...style }}>
      {greeting && <div style={{ fontSize: 13, color: HF.text50, marginBottom: 4, fontWeight: 500 }}>{greeting}</div>}
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, whiteSpace: 'pre-line' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: HF.text50, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

export function TopBar({ left, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 4px' }}>
      {left ?? (
        /* 💡 '···김' 형태의 하드코딩 레이아웃을 '김'만 깔끔하게 나오도록 수정 */
        <div className="hf-avatarpill" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>김</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {right}
      </div>
    </div>
  );
}

export function BackBar({ label, sub, action }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button className="hf-pill" style={{ padding: '10px 14px' }} onClick={() => navigate(-1)}>‹</button>
      <div style={{ flex: 1 }}>
        {sub && <div style={{ fontSize: 11, color: HF.text40 }}>{sub}</div>}
        <div style={{ fontSize: 17, fontWeight: 700 }}>{label}</div>
      </div>
      {action}
    </div>
  );
}

export function ThemeToggle() {
  return null;
}

export function Section({ title, action, onAction, children, style }) {
  return (
    <div style={{ padding: '0 24px', marginTop: 18, ...style }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: HF.text70, letterSpacing: -0.2 }}>{title}</span>
          {action && <span style={{ fontSize: 12, color: HF.green, cursor: 'pointer' }} onClick={onAction}>{action}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function EquipBar({ name = 'HD HX300L', id = '#2018', status = '운행중' }) {
  return (
    <div style={{ padding: '0 24px', marginTop: 6 }}>
      <div className="hf-glass-soft" style={{ borderRadius: 999, padding: '8px 12px 8px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 99,
          background: HF.greenDim,
          border: `1px solid ${HF.greenBd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.green,
        }}><Icon name="truck" size={18} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{name} · <span style={{ color: HF.text50 }}>{id}</span></div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: HF.green, boxShadow: `0 0 8px ${HF.green}` }}></span>
            <span style={{ fontSize: 11, color: HF.text50 }}>현장 A · {status}</span>
          </div>
        </div>
        <span style={{ display: 'flex', color: HF.text40 }}><Icon name="swap" size={16} /></span>
      </div>
    </div>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', ...style }}>
      {options.map(o => (
        <div key={o} className={`hf-pill ${o === value ? 'hf-pill-on' : ''}`} onClick={() => onChange && onChange(o)}>{o}</div>
      ))}
      <div className="hf-pill" style={{ padding: '8px 12px' }}>···</div>
    </div>
  );
}

const TAB_ICONS = {
  home:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z"/></svg>,
  rank:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 1 4 4v6H8V6a4 4 0 0 1 4-4z"/></svg>,
  recov:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5"/></svg>,
  me:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0114 0v1"/></svg>,
};

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = [
    { id: 'home',   to: '/dashboard', label: '홈',    match: ['/dashboard'] },
    { id: 'rank',   to: '/ranking',   label: '랭킹',  match: ['/ranking'] },
    { id: 'recov',  to: '/recovery',  label: '회수',  match: ['/recovery', '/credit'] },
    { id: 'me',     to: '/profile',   label: '내정보', match: ['/profile'] },
  ];
  return (
    <div className="hf-tabbar-wrap">
      <div className="hf-tabbar">
        {tabs.map(t => {
          const active = t.match.includes(pathname);
          return (
            <button key={t.id} className={`hf-tab ${active ? 'on' : ''}`} onClick={() => navigate(t.to)}>
              <span style={{ width: 22, height: 22, display: 'block' }}>
                {React.cloneElement(TAB_ICONS[t.id], { width: 22, height: 22 })}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OrbAI({ onTap }) {
  return <div className="hf-orb" onClick={onTap} role="button" aria-label="AI assistant"></div>;
}

/* ───────────────────────────────────────────────────────────────────────────
 * Charts / visuals
 * ─────────────────────────────────────────────────────────────────────────── */

export function Gauge({ value = 82, max = 100, size = 180, label = 'HI Score', color }) {
  const r = (size - 24) / 2;
  const cx = size / 2, cy = size / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / max) * c * 0.78;
  const arcLen = c * 0.78;
  const id = React.useId();
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: 'visible', transform: 'rotate(126deg)' }}>
        <defs>
          <linearGradient id={`g${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"    stopColor={color || HF.greenHi} />
            <stop offset="100%" stopColor={color || HF.green} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} stroke="var(--hf-text-10)" strokeWidth="10" fill="none"
          strokeDasharray={`${arcLen} ${c}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} stroke={`url(#g${id})`} strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: -4 }}>
          <span style={{ fontSize: size * 0.35, fontWeight: 800, letterSpacing: -2, color: HF.text }}>{Math.round(value)}</span>
          <span style={{ fontSize: size * 0.16, fontWeight: 600, color: HF.text40 }}>/{max}</span>
        </div>
        <div style={{ fontSize: size * 0.09, color: HF.text50, fontWeight: 600, marginTop: -4, letterSpacing: 1 }}>{label}</div>
      </div>
    </div>
  );
}

export function Waveform({ width = 280, height = 60, bars = 48, seed = 1, peak = 0.7 }) {
  const id = React.useId();
  const data = React.useMemo(() => Array.from({ length: bars }, (_, i) => {
    const t = i / (bars - 1);
    const env = Math.sin(t * Math.PI);
    const noise = Math.abs(Math.sin(seed * (i + 1) * 1.7) + Math.cos(seed * i * 0.9)) * 0.5;
    return Math.max(0.06, env * peak * noise + 0.08);
  }), [bars, seed, peak]);
  const bw = width / bars - 1;
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`wf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"    stopColor={HF.greenHi} />
          <stop offset="100%" stopColor={HF.green} />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = v * height;
        return (
          <rect key={i} x={i * (width / bars)} y={height - h} width={bw} height={h} rx={bw/2}
            fill={`url(#wf${id})`} opacity={0.7 + v * 0.3} />
        );
      })}
    </svg>
  );
}

export function LineChart({ data, width = 280, height = 100, color = '#00E600', fill = true, dashedAfter = null, threshold = null }) {
  const id = React.useId();
  const pad = 6;
  const max = Math.max(...data), min = Math.min(...data);
  if (!data || data.length < 2) return <svg width={width} height={height} />;

  const range = max - min || 1;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * w,
    pad + h - ((v - min) / range) * h,
  ]);
  const buildPath = (arr) => {
    if (arr.length < 2) return '';
    const cmds = ['M ' + arr[0].join(' ')];
    for (let i = 1; i < arr.length; i++) {
      const [x0, y0] = arr[i-1];
      const [x1, y1] = arr[i];
      const cx0 = x0 + (x1 - x0) / 2;
      cmds.push(`C ${cx0} ${y0} ${cx0} ${y1} ${x1} ${y1}`);
    }
    return cmds.join(' ');
  };
  const splitIdx = dashedAfter != null ? Math.floor(data.length * dashedAfter) : data.length;
  const solid = pts.slice(0, splitIdx + 1);
  const dashed = pts.slice(splitIdx);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`lc${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"    stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && (
        <path d={`${buildPath(solid)} L ${solid[solid.length-1][0]} ${height-pad} L ${pad} ${height-pad} Z`}
              fill={`url(#lc${id})`} />
      )}
      {threshold != null && (
        <line x1={pad} y1={pad + h - threshold * h} x2={pad + w} y2={pad + h - threshold * h}
              stroke={HF.bad} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="4 4" />
      )}
      <path d={buildPath(solid)} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {dashed.length > 1 && (
        <path d={buildPath(dashed)} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round"
              strokeDasharray="5 5" opacity="0.65" />
      )}
      {dashedAfter != null && pts[splitIdx] && (
        <circle cx={pts[splitIdx][0]} cy={pts[splitIdx][1]} r="5" fill="var(--hf-bg-deep)" stroke={color} strokeWidth="2" />
      )}
    </svg>
  );
}

export function Grade({ grade = 'A', size = 36 }) {
  const map = {
    A: { fg: '#00A859', bg: '#eaf8f0', bd: 'rgba(0,168,89,0.1)' },
    B: { fg: '#333333', bg: '#f2f3f6', bd: 'rgba(0,0,0,0.05)' },
    C: { fg: '#b25e00', bg: '#fff4e6', bd: 'rgba(178,94,0,0.1)' },
    D: { fg: '#cc2222', bg: '#ffebe6', bd: 'rgba(204,34,34,0.1)' },
  };
  const m = map[grade] || map.B;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: m.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: m.fg, fontWeight: 800, fontSize: size * 0.55, letterSpacing: -1,
      border: `1px solid ${m.bd}`,
      flexShrink: 0,
    }}>{grade}</div>
  );
}

export function ProgressBar({ value = 50, max = 100, height = 12, color, label, valueLabel }) {
  const pct = (value / max) * 100;
  return (
    <div>
      {(label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: HF.text50, marginBottom: 6 }}>
          <span>{label}</span>
          <span className="mono" style={{ color: HF.text, fontWeight: 600 }}>{valueLabel ?? `${value}%`}</span>
        </div>
      )}
      <div style={{ height, borderRadius: 99, background: HF.text10, position: 'relative', overflow: 'hidden', border: `1px solid ${HF.softBd}` }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: pct + '%', borderRadius: 99,
          background: color || HF.green,
        }}>
          <div style={{ position: 'absolute', right: 1, top: 1, bottom: 1, width: 6, borderRadius: 99, background: '#fff', opacity: 0.6 }}></div>
        </div>
      </div>
    </div>
  );
}

export function SensorTile({ label, value, unit, trend = 'flat', alert, onClick }) {
  const trendIcon = { up: '↗', down: '↘', flat: '→' }[trend];
  const c = alert ? HF.bad : trend === 'up' ? HF.green : HF.text70;
  return (
    <div
      style={{ padding: '4px 0', cursor: onClick ? 'pointer' : 'default',
               borderBottom: `1px solid ${HF.divider}`,
               transition: 'opacity .15s' }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.opacity = '0.5')}
      onMouseLeave={e => onClick && (e.currentTarget.style.opacity = '1')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: HF.text50, fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: alert ? HF.bad : HF.text, letterSpacing: -1, lineHeight: 1 }}>{value}</span>
            <span className="mono" style={{ fontSize: 13, color: HF.text40, fontWeight: 500 }}>{unit}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 16, color: c, fontWeight: 600 }}>{trendIcon}</span>
          {alert && <div style={{ fontSize: 10, color: HF.bad, marginTop: 4, fontWeight: 600 }}>⚠ 경고</div>}
        </div>
      </div>
    </div>
  );
}

export function Hotspot({ top, left, color, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ position: 'absolute', top, left, transform: 'translate(-50%, -50%)', cursor: 'pointer' }}>
      <div style={{
        width: active ? 20 : 16, height: active ? 20 : 16, borderRadius: 99, background: color,
        boxShadow: `0 0 0 ${active ? 6 : 4}px ${color}33, 0 0 20px ${color}, 0 0 40px ${color}88`,
        border: '2px solid #fff',
        transition: 'all .2s',
      }}></div>
      <div className="hf-pill" style={{ position: 'absolute', top: -10, left: 22, padding: '4px 8px', fontSize: 10, whiteSpace: 'nowrap', color: '#fff', borderColor: color }}>{label}</div>
    </div>
  );
}

/* ── Driver Score ─────────────────────────────────────────────────────── */
export function DriverScore({ score = 36.5 }) {
  let color = HF.green;
  let emoji = '🙂';
  if (score >= 60) { color = '#F2994A'; emoji = '🔥'; }
  else if (score >= 45) { color = '#00A859'; emoji = '👏'; }
  else if (score < 36.5) { color = HF.text40; emoji = '🤔'; }
  
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 12, color: HF.text50, fontWeight: 600 }}>운전 마스터 온도 {emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: color, letterSpacing: -0.5 }}>{score.toFixed(1)}°C</div>
      </div>
      <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'var(--hf-text-10)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s ease-out' }}></div>
      </div>
    </div>
  );
}