import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar, Grade, LineChart } from '../components.jsx';

/* ─── 장비 목 데이터 ──────────────────────────────────────────────── */
const FLEET = [
  {
    id: 'HD-EX-2018', name: 'HD HX300L', site: '현장 A', status: '운행중',
    grade: 'D', hi: 82, rul: 340, hiTrend: [10,15,22,30,40,50,58,65,72,78,82],
    sensors: { pressure: 48.2, temp: 88.1, vibration: 6.8 },
    operator: '김기사', opHours: 5556,
  },
  {
    id: 'HD-EX-2021', name: 'HD HW210', site: '현장 B', status: '운행중',
    grade: 'B', hi: 38, rul: 2800, hiTrend: [5,8,12,16,20,24,28,32,35,37,38],
    sensors: { pressure: 35.1, temp: 72.3, vibration: 3.2 },
    operator: '박기사', opHours: 3120,
  },
  {
    id: 'HD-EX-2023', name: 'HD HX220A', site: '현장 A', status: '정비중',
    grade: 'A', hi: 12, rul: 6200, hiTrend: [2,3,4,5,6,7,8,9,10,11,12],
    sensors: { pressure: 30.5, temp: 65.0, vibration: 1.8 },
    operator: '이기사', opHours: 1250,
  },
];

const GRADE_COLORS = { A: HF.green, B: HF.warn, C: HF.warn, D: HF.bad };

export default function FleetDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('전체');
  const filters = ['전체', 'A', 'B', 'C', 'D'];

  const filtered = filter === '전체' ? FLEET : FLEET.filter(e => e.grade === filter);

  // 통계
  const gradeCount = { A: 0, B: 0, C: 0, D: 0 };
  FLEET.forEach(e => gradeCount[e.grade]++);
  const urgent = FLEET.filter(e => e.grade === 'D').length;

  return (
    <>
      <TopBar right={
        <button className="hf-pill" style={{ padding: '10px 12px', position: 'relative' }}
          onClick={() => navigate('/notifications')} aria-label="알림">
          🔔{urgent > 0 && <span className="notification-dot" />}
        </button>
      } />
      <TitleBlock
        title="장비 관리"
        subtitle={`총 ${FLEET.length}대 · ${urgent > 0 ? `긴급 ${urgent}건` : '이상 없음'}`}
      />

      {/* 등급별 요약 */}
      <Section>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(gradeCount).map(([g, cnt]) => (
            <div key={g} style={{
              flex: 1, borderRadius: 16, padding: '10px 8px', textAlign: 'center',
              background: cnt > 0 && g === 'D' ? 'rgba(255,51,51,0.08)' : 'var(--hf-soft-bg)',
              border: cnt > 0 && g === 'D' ? '1px solid rgba(255,51,51,0.3)' : '1px solid transparent',
              cursor: 'pointer',
            }} onClick={() => setFilter(filter === g ? '전체' : g)}>
              <Grade grade={g} size={24} />
              <div style={{ fontSize: 20, fontWeight: 700, color: GRADE_COLORS[g], marginTop: 4 }}>{cnt}</div>
              <div style={{ fontSize: 9, color: HF.text40 }}>대</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 필터 탭 */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 8 }}>
        {filters.map(f => (
          <div key={f}
            className={`hf-pill ${f === filter ? 'hf-pill-on' : ''}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
            onClick={() => setFilter(f)}
            role="tab" aria-selected={f === filter}
          >{f}</div>
        ))}
      </div>

      {/* 장비 카드 목록 */}
      <Section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(eq => (
            <div key={eq.id} className="fleet-card"
              onClick={() => navigate('/dashboard')} aria-label={`${eq.name} 상세보기`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <Grade grade={eq.grade} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{eq.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: HF.text40 }}>{eq.id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: 99,
                      background: eq.status === '운행중' ? HF.green : HF.warn,
                      boxShadow: eq.status === '운행중' ? `0 0 6px ${HF.green}` : 'none',
                    }} />
                    <span style={{ fontSize: 11, color: HF.text50 }}>{eq.site} · {eq.status}</span>
                    <span style={{ fontSize: 11, color: HF.text40 }}>· {eq.operator}</span>
                  </div>
                </div>
                <span style={{ color: HF.text40 }}>›</span>
              </div>

              {/* 미니 데이터 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 2, background: 'var(--hf-soft-bg)', borderRadius: 12, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: HF.text50 }}>HI 추이</div>
                  <div style={{ marginTop: 4 }}>
                    <LineChart data={eq.hiTrend} width={120} height={28} color={GRADE_COLORS[eq.grade]} fill={false} />
                  </div>
                </div>
                {[
                  { l: 'HI', v: eq.hi, u: '%', c: GRADE_COLORS[eq.grade] },
                  { l: 'RUL', v: eq.rul, u: 'h', c: HF.text },
                  { l: '운행', v: eq.opHours.toLocaleString(), u: 'h', c: HF.text },
                ].map(x => (
                  <div key={x.l} style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: HF.text50 }}>{x.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: x.c, marginTop: 2 }}>{x.v}</div>
                    <div style={{ fontSize: 8, color: HF.text40 }}>{x.u}</div>
                  </div>
                ))}
              </div>

              {/* 등급 D 긴급 표시 */}
              {eq.grade === 'D' && (
                <div style={{
                  marginTop: 8, padding: '6px 10px', borderRadius: 12,
                  background: 'rgba(255,51,51,0.08)', border: '1px solid rgba(255,51,51,0.2)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 12 }}>⚠️</span>
                  <span style={{ fontSize: 11, color: HF.bad, fontWeight: 600 }}>즉시 점검 필요 — RUL {eq.rul}h</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 현장 요약 */}
      <Section title="현장별 요약">
        <div style={{ display: 'flex', gap: 8 }}>
          {['현장 A', '현장 B'].map(site => {
            const cnt = FLEET.filter(e => e.site === site).length;
            const dCnt = FLEET.filter(e => e.site === site && e.grade === 'D').length;
            return (
              <div key={site} className="hf-glass-soft" style={{ flex: 1, borderRadius: 18, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{site}</div>
                <div style={{ fontSize: 11, color: HF.text50, marginTop: 2 }}>{cnt}대 배치</div>
                {dCnt > 0 && (
                  <div style={{ fontSize: 10, color: HF.bad, fontWeight: 600, marginTop: 4 }}>
                    ⚠ 긴급 {dCnt}건
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <TabBar />
    </>
  );
}
