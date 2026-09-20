import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF, useTheme } from '../theme.jsx';
import { TopBar, EquipBar, Section, TabBar, Grade, Gauge, SensorTile, LineChart, DriverScore } from '../components.jsx';
import { Icon } from '../components/Icon.jsx';
import { useHICycleData } from '../hooks/useHICycleData';
import { OrbAI } from '../components/OrbAI.jsx';

/* ─── HI 수식 모달 ────────────────────────────────────────────────────── */
function HIFormulaModal({ info, onClose }) {
  return (
    <div className="info-modal-overlay" onClick={onClose} role="dialog" aria-label="HI 수식 정보">
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <Icon name="formula" size={20} /> HI 산출 수식
          </div>
          <button className="hf-pill" style={{ padding: '6px 10px' }} onClick={onClose} aria-label="닫기">
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* 기본 수식 */}
        <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: HF.text50, marginBottom: 6 }}>기본 HI 수식</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: HF.green, letterSpacing: -0.5 }}>
            {info?.base ?? 'HI = w1*FI_vibration + w2*FI_temp + ...'}
          </div>
        </div>

        {/* DS 반영 수식 */}
        <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: HF.text50, marginBottom: 6 }}>운전점수(DS) 반영</div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: HF.text, letterSpacing: -0.5 }}>
            {info?.withDS ?? 'HI_adj = HI × (1 + f(DS))'}
          </div>
          <div style={{ fontSize: 11, color: HF.text50, marginTop: 6 }}>
            DS=0.2 숙련 → HI ×1.06 | DS=0.8 비숙련 → HI ×1.24
          </div>
        </div>

        {/* 가중치 */}
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>FI 가중치 (FMEA RPN 기반)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {info?.weights && Object.entries(info.weights).map(([key, w]) => {
            const labels = {
              FI_contam: '오염도', FI_drain: '드레인', FI_pressure: '압력',
              FI_temp: '온도', FI_vibration: '진동',
            };
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: HF.text70 }}>{labels[key] ?? key}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600, width: 45, textAlign: 'right' }}>
                  {(w * 100).toFixed(1)}%
                </div>
                <div style={{ flex: 2, height: 6, borderRadius: 99, background: 'var(--hf-text-10)', overflow: 'hidden' }}>
                  <div style={{ width: `${w * 100 / 0.33 * 100}%`, maxWidth: '100%', height: '100%', borderRadius: 99, background: HF.gradGreen }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 등급 기준 */}
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>등급 기준</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {info?.gradeThresholds && Object.entries(info.gradeThresholds).map(([g, t]) => (
            <div key={g} style={{ background: 'var(--hf-soft-bg)', borderRadius: 12, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Grade grade={g} size={22} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: HF.text40 }}>{t.range}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: HF.text50, marginTop: 14, lineHeight: 1.6 }}>
          {info?.description}
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 대시보드 ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { current, loading, error, sensorSeries, gradeDStartIndex, data, HI_FORMULA_INFO } = useHICycleData();
  
  const [showFormula, setShowFormula] = useState(false);
  const [showOrb, setShowOrb] = useState(false);

  // 전역 테마 및 다크모드 바인딩
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  // 현재 활성화(선택)된 부품의 이름을 관리 (기본값: '유압 실린더')
  const [selectedComponent, setSelectedComponent] = useState('유압 펌프');

  // 차트용 라인 데이터 추정
  const hiScoreArr = useMemo(() => {
    if (!sensorSeries?.HI) return [];
    return sensorSeries.HI.map(r => r.value * 100);
  }, [sensorSeries]);

  // 부품별 가상 점수 및 등급 데이터 정의
  const componentScores = [
    { name: '유압 펌프', status: '실시간 분석', score: 4, grade: 'D', color: HF.bad, label: '위험' },
    { name: '유압 실린더', status: '회수 관찰', score: 78, grade: 'B', color: '#F2994A', label: '주의' }, 
    { name: '주행 모터', status: '재사용 가능', score: 86, grade: 'A', color: HF.green, label: '정상' }
  ];

  // 선택한 부품의 Object를 실시간으로 추출
  const currentActiveComp = useMemo(() => {
    return componentScores.find(c => c.name === selectedComponent) || componentScores[1];
  }, [selectedComponent, componentScores]);

  // 하단 게이지와 등급 뱃지가 선택한 부품의 데이터에 연동되도록 매핑
  const totalHiScore = currentActiveComp.score; 
  const totalGrade = currentActiveComp.grade;
  const totalLabel = currentActiveComp.label;

  const gradeColor = { A: HF.green, B: HF.warn, C: HF.warn, D: HF.bad };

  if (loading) return (
    <div className="flex-col-center full-screen">
      <div className="loading-spinner" />
      <div style={{ color: HF.text50, marginTop: 12, fontSize: 14 }}>센서 데이터 로딩 중...</div>
    </div>
  );

  if (error) return (
    <div className="flex-col-center full-screen" style={{ padding: 24 }}>
      <div style={{ color: HF.bad, fontWeight: 700, marginBottom: 8 }}>데이터 오류</div>
      <div style={{ color: HF.text50, fontSize: 13, textAlign: 'center' }}>{error}</div>
    </div>
  );

  function trend(key) {
    const d = data;
    if (!d || d.length < 2) return 'flat';
    const last = d[d.length - 1][key];
    const prev = d[Math.max(0, d.length - 10)][key];
    if (last > prev * 1.01) return 'up';
    if (last < prev * 0.99) return 'down';
    return 'flat';
  }

  return (
    <>
      {showFormula && <HIFormulaModal info={HI_FORMULA_INFO} onClose={() => setShowFormula(false)} />}

      <TopBar right={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* 다크모드 토글 */}
          <button className="hf-pill" style={{ padding: '10px 12px' }} onClick={toggle} aria-label="다크모드 전환">
            <Icon name={dark ? 'sun' : 'moon'} size={16} />
          </button>

          {/* 알림 배지 */}
          <button className="hf-pill" style={{ padding: '10px 12px', position: 'relative' }} onClick={() => navigate('/notifications')} aria-label="알림">
            <Icon name="bell" size={16} />
            <span className="notification-dot" />
          </button>
        </div>
      } />

      <EquipBar name="HD HX300L" id="#2018" status="운행중" />

      {/* 인프라 연동 상태 표시 패널 */}
      <div style={{ padding: '14px 24px 0' }}>
        <div className="hf-pill" style={{ padding: '4px 10px', fontSize: 10, background: 'rgba(0,102,51,0.08)', color: HF.green, width: 'fit-content' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: HF.green, display: 'inline-block', marginRight: 4, boxShadow: `0 0 6px ${HF.green}` }} />
          Hi-MATE 원격 관리 인프라 연동됨
        </div>
      </div>



      {/* ─── 1. 실시간 디지털 트윈 3D 배너 ────────────────────────────────── */}
      <div style={{ padding: '0 24px', marginTop: 14, marginBottom: 8 }}>
        <div
          onClick={() => navigate('/twin')}
          role="button"
          aria-label="실시간 3D 디지털 트윈 열기"
          style={{
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            borderRadius: 24, padding: 18,
            background: HF.gradGreen,
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 10px 30px rgba(0,102,51,0.28)',
          }}
        >
          {/* 배경 장식 */}
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', right: 20, bottom: -40, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0, color: '#fff',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="cube" size={28} strokeWidth={1.6} />
          </div>
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>실시간 디지털 트윈</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: HF.green, background: '#fff', padding: '2px 6px', borderRadius: 99, letterSpacing: 0.5 }}>3D</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3, lineHeight: 1.35 }}>
              부품 상태를 3D 모델로 바로 확인하기
            </div>
          </div>
          <div style={{ fontSize: 22, color: '#fff', zIndex: 1, fontWeight: 300 }}>›</div>
        </div>
      </div>

      {/* ─── 2. 부품별 HI Score 목록 ────────────────── */}
      <Section title="부품별 HI Score" action="전체 부품 보기" onAction={() => navigate('/sensor')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {componentScores.map((comp, idx) => {
            const isSelected = selectedComponent === comp.name;
            
            return (
              <div 
                key={idx} 
                className={isSelected ? "" : "hf-glass"}
                onClick={() => setSelectedComponent(comp.name)}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px 20px', 
                  borderRadius: 24,
                  background: 'var(--hf-bg)',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${comp.color}` : '1px solid var(--hf-text-10)',
                  boxShadow: isSelected ? `0 4px 12px ${comp.color}22` : 'none',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: HF.text }}>{comp.name}</div>
                  <div style={{ fontSize: 13, color: HF.text40, marginTop: 4 }}>{comp.status}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: comp.color, lineHeight: 1 }}>
                      {comp.score}
                    </div>
                    <div style={{ fontSize: 11, color: HF.text40, marginTop: 4 }}>Health Score</div>
                  </div>
                  <Grade grade={comp.grade} size={46} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─── 3. 종합 분석 추이 카드 ──────────────────── */}
      <Section title="종합 분석 추이">
        <div className="hf-glass" style={{ borderRadius: 28, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Gauge value={totalHiScore} max={100} size={110} label={`${selectedComponent} 지수`} color={gradeColor[totalGrade]} />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Grade grade={totalGrade} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: gradeColor[totalGrade], letterSpacing: -0.5, wordBreak: 'keep-all' }}>
                    {selectedComponent} {totalGrade}등급
                  </div>
                  <div style={{ fontSize: 12, color: HF.text50, marginTop: 2 }}>상태 요약: {totalLabel}</div>
                </div>
              </div>
              <div className="hf-glass-soft" style={{ borderRadius: 12, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: HF.text50 }}>현재 누적 가동 시간</span>
                <span style={{ fontWeight: 700 }}>{data[data.length - 1]?.time ?? 20000}h</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${HF.divider}`, paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: HF.text50, marginBottom: 8 }}>장비 건전성 추이 (실시간 인터랙티브 변동 이력)</div>
            <LineChart
              data={hiScoreArr}
              width={290} height={75}
              color={gradeColor[totalGrade]}
              fill
              dashedAfter={gradeDStartIndex > 0 ? gradeDStartIndex / hiScoreArr.length : null}
              threshold={25}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: HF.text40 }}>0</span>
              <span style={{ fontSize: 10, color: HF.bad }}>── 등급D 임계</span>
              <span style={{ fontSize: 10, color: HF.text40 }}>{data[data.length - 1]?.time}h</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 4. 실시간 센서 현황 ───────────────────────────────────────── */}
      <Section title="실시간 센서 현황" action="상세 분석" onAction={() => navigate('/sensor', { state: { sensor: 'pressure' } })}>
        <div className="sensor-grid">
          <SensorTile label="유압 압력" onClick={() => navigate('/sensor', { state: { sensor: 'pressure' } })} value={current?.pressure?.toFixed(1) ?? '27.0'} unit="bar" trend={trend('pressure')} />
          <SensorTile label="오염도 (ISO 4406)" onClick={() => navigate('/sensor', { state: { sensor: 'iso6' } })} value={current?.iso6?.toFixed(2) ?? '17.00'} unit="ISO" trend={trend('iso6')} alert={current?.iso6 > 16} />
          <SensorTile label="드레인 유량" onClick={() => navigate('/sensor', { state: { sensor: 'drain' } })} value={current?.drain?.toFixed(3) ?? '3.402'} unit="L/m" trend={trend('drain')} alert={current?.drain > 3.5} />
          <SensorTile label="작동유 온도" onClick={() => navigate('/sensor', { state: { sensor: 'temp' } })} value={current?.temp?.toFixed(1) ?? '102.0'} unit="°C" trend={trend('temp')} alert={current?.temp > 100} />
          <SensorTile label="펌프 진동" onClick={() => navigate('/sensor', { state: { sensor: 'vibration' } })} value={current?.vibration?.toFixed(2) ?? '7.10'} unit="mm/s" trend={trend('vibration')} alert={current?.vibration > 7} />
        </div>
      </Section>

      {/* ─── 5. 원격 제어 명령 (중복 3D 버튼 제거 완료) ─────────────────────────── */}
      <Section title="원격 제어 명령" style={{ marginBottom: 50 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="hf-btn" style={{ flex: 1 }} onClick={() => navigate('/sensor')}>정밀 진단</button>
          <button className="hf-btn hf-btn-primary" style={{ flex: 1 }} onClick={() => navigate('/recovery')}>회수 요청</button>
        </div>
      </Section>

      <div className="bottom-safe-spacer" />
      <TabBar />

      {/* 플로팅 AI 버튼 */}
      <div 
        onClick={() => setShowOrb(true)}
        style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%', cursor: 'pointer',
          background: 'linear-gradient(135deg, #00FF44, #006633)',
          boxShadow: '0 8px 24px rgba(0,230,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="AI 정비 어시스턴트 열기"
      >
        <Icon name="bot" size={28} />
      </div>

      {showOrb && <OrbAI onClose={() => setShowOrb(false)} />}
    </>
  );
}