import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar, Grade, Hotspot, LineChart } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';

/* ─────────────────────────────────────────────────────────────────────────
 * react-unity-webgl 동적 로드 (패키지 없어도 앱이 터지지 않게 처리)
 * npm install react-unity-webgl 이후 unityWebglAvailable = true 로 변경
 * ───────────────────────────────────────────────────────────────────────── */
let unityWebglAvailable = false;
let UnityComp = null;
let useUnityCtx = null;

import { Unity, useUnityContext } from 'react-unity-webgl';
UnityComp = Unity;
useUnityCtx = useUnityContext;
unityWebglAvailable = true;

/* ─────────────────────────────────────────────────────────────────────────
 * 유니티 WebGL 뷰어 (react-unity-webgl 있을 때만 렌더)
 * ───────────────────────────────────────────────────────────────────────── */
function UnityViewer({ hiValue, grade, onReady, current }) {
  if (!useUnityCtx) return null;
  const { unityProvider, sendMessage, isLoaded, loadingProgression } = useUnityCtx({
    loaderUrl:     '/HD퓨처건설기계.loader.js',
    dataUrl:       '/HD퓨처건설기계.data',
    frameworkUrl:  '/HD퓨처건설기계.framework.js',
    codeUrl:       '/HD퓨처건설기계.wasm',
  });

  // "Made with Unity" 스플래시 커버: 로딩 완료 후 0.5s 딜레이 뒤 페이드아웃
  const [coverVisible, setCoverVisible] = useState(true);
  const [coverOpacity, setCoverOpacity] = useState(1);

  useEffect(() => {
    if (!isLoaded) return;
    onReady?.();
    // Unity 스플래시 재생 시간(~3s) 이후 페이드아웃
    setTimeout(() => {
      setCoverOpacity(0);
      setTimeout(() => setCoverVisible(false), 600);
    }, 3500);
    try {
      sendMessage('HICycleManager', 'ReceiveHIData', JSON.stringify({
        hi:           hiValue,
        grade,
        fi_pressure:  current?.FI_pressure  ?? 0,
        fi_contam:    current?.FI_contam     ?? 0,
        fi_drain:     current?.FI_drain      ?? 0,
        fi_temp:      current?.FI_temp       ?? 0,
        fi_vibration: current?.FI_vibration  ?? 0,
      }));
    } catch (e) {
      console.warn('[HI-CYCLE] sendMessage 실패 — 유니티 오브젝트 확인:', e.message);
    }
  }, [isLoaded, hiValue, grade]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <UnityComp
        unityProvider={unityProvider}
        style={{ width: '100%', height: '250px', borderRadius: 24 }}
      />
      {/* Made with Unity 스플래시 커버 */}
      {coverVisible && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 24,
          background: '#050807',
          opacity: coverOpacity,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          {/* 초록 스피너 */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(0,168,89,0.2)',
            borderTop: '3px solid #00A859',
            animation: 'spin 0.9s linear infinite',
          }} />
          {/* 로딩 바 */}
          <div style={{ width: 120, height: 3, borderRadius: 99, background: 'rgba(0,168,89,0.2)', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.round(loadingProgression * 100)}%`,
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #006633, #00A859)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px #00A859',
            }} />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#00A859', letterSpacing: 1 }}>
            {Math.round(loadingProgression * 100)}%
          </div>
          <div style={{ fontSize: 11, color: 'rgba(0,168,89,0.6)', marginTop: -6 }}>
            3D 모델 로딩 중...
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * SVG 폴백 뷰어 (react-unity-webgl 없거나 로딩 전)
 * ───────────────────────────────────────────────────────────────────────── */
function FallbackViewer({ selected, onSelect, gradeColor }) {
  const hotspots = [
    { top: 170, left: '38%', color: HF.bad,   label: 'P-03', id: 'P-03' },
    { top: 100, left: '68%', color: HF.warn,  label: 'P-06', id: 'P-06' },
    { top: 130, left: '50%', color: HF.green, label: 'OK',   id: 'OK' },
  ];

  return (
    <div className="hf-glass" style={{
      borderRadius: 28, height: 320, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 80% at 50% 30%, rgba(0,230,0,0.1), transparent 70%), rgba(0,0,0,0.5)`,
    }}>
      {/* 그리드 배경 */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="hfgrid" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="skewX(-20) skewY(8)">
            <circle cx="2" cy="2" r="0.8" fill="rgba(0,230,0,0.18)" />
          </pattern>
        </defs>
        <rect x="0" y="160" width="100%" height="180" fill="url(#hfgrid)" opacity="0.7" />
      </svg>

      {/* 굴삭기 SVG */}
      <svg width="280" height="220" viewBox="0 0 280 220"
           style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -45%)',
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }}>
        <defs>
          <linearGradient id="hxb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a4458" /><stop offset="100%" stopColor="#1a2030" /></linearGradient>
          <linearGradient id="hxc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a6578" /><stop offset="100%" stopColor="#2a3548" /></linearGradient>
          <linearGradient id="hxa" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6a7588" /><stop offset="100%" stopColor="#3a4558" /></linearGradient>
        </defs>
        <ellipse cx="100" cy="180" rx="90" ry="16" fill="#0d1220" stroke="rgba(0,230,0,0.3)" strokeWidth="1" />
        <ellipse cx="100" cy="178" rx="80" ry="10" fill="none" stroke="rgba(0,230,0,0.18)" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 20 140 L 180 140 L 195 115 L 35 115 Z" fill="url(#hxb)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        <path d="M 60 115 L 140 115 L 150 70 L 90 60 L 55 90 Z" fill="url(#hxc)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
        <path d="M 73 110 L 138 110 L 142 78 L 95 70 L 70 92 Z" fill="rgba(0,230,0,0.25)" stroke="rgba(0,230,0,0.5)" strokeWidth="1" />
        <path d="M 150 90 L 230 30 L 240 42 L 165 105 Z" fill="url(#hxa)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
        <path d="M 235 36 L 268 80 L 258 90 L 225 50 Z" fill="url(#hxa)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
        <path d="M 255 80 L 268 80 L 272 100 L 252 102 Z" fill="#1a2030" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      </svg>

      {hotspots.map(h => (
        <Hotspot key={h.id} {...h} active={selected === h.id} onClick={() => onSelect(h.id)} />
      ))}

      {/* 상태 배지 */}
      <div className="hf-pill" style={{ position: 'absolute', top: 14, left: 14, padding: '6px 10px', fontSize: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: HF.green, boxShadow: `0 0 6px ${HF.green}`, display: 'inline-block', marginRight: 6 }}></span>
        3D · LIVE
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="hf-pill" style={{ padding: '6px 10px', minWidth: 32 }}>+</button>
        <button className="hf-pill" style={{ padding: '6px 10px', minWidth: 32 }}>−</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 메인 화면
 * ───────────────────────────────────────────────────────────────────────── */
export default function DigitalTwin() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('P-03');
  const [unityReady, setUnityReady] = useState(false);

  // CSV 실데이터
  const { current, loading, error, rul, sensorSeries, data, gradeDStartIndex, GRADE_COLOR } = useHICycleData();

  const grade      = current?.stableGrade ?? 'A';
  const hiValue    = current?.HI ?? 0;
  const gradeColor = { A: HF.green, B: HF.warn, C: HF.warn, D: HF.bad };

  // 부품별 데이터 (유압펌프 = CSV 실데이터 / 나머지 = 하드코딩)
  const hiArr = React.useMemo(() => sensorSeries.HI.map(r => r.value), [sensorSeries]);
  const downsampled = React.useMemo(() => {
    const step = Math.max(1, Math.floor(hiArr.length / 14));
    return hiArr.filter((_, i) => i % step === 0);
  }, [hiArr]);

  const parts = {
    'P-03': {
      name: '유압펌프',
      grade: grade,
      rul: `${rul?.remainingHours ?? '--'}h`,
      state: grade === 'D' ? '회수 권장' : grade === 'C' ? '정비 예고' : '모니터링',
      data: downsampled.length ? downsampled : [0.95,0.9,0.85,0.78,0.7,0.62,0.55,0.48,0.42,0.36,0.3,0.25,0.21,0.18],
      color: gradeColor[grade],
      live: true,
    },
    'P-06': {
      name: '버킷 핀',
      grade: 'B',
      rul: '1,200h',
      state: '모니터링',
      data: [0.95,0.93,0.9,0.87,0.84,0.81,0.78,0.75,0.72,0.69,0.66,0.63,0.6,0.57],
      color: HF.warn,
      live: false,
    },
    'OK': {
      name: '엔진 모듈',
      grade: 'B',
      rul: '2,200h',
      state: '양호',
      data: [0.98,0.97,0.96,0.95,0.94,0.93,0.92,0.91,0.9,0.89,0.88,0.87,0.86,0.85],
      color: HF.green,
      live: false,
    },
  };
  const s = parts[selected];

  // grade D 경보
  const showAlert = grade === 'D' && selected === 'P-03';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: HF.bg }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${HF.text10}`, borderTop: `3px solid ${HF.green}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <BackBar
        sub="HD HX300L #2018"
        label="실시간 3D"
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  
            <button className="hf-pill" style={{ padding: '10px 12px' }}>↻</button>
          </div>
        }
      />


      {/* grade D 긴급 배너 + 회수 버튼 */}
      {showAlert && (
        <div
          style={{
            margin: '10px 24px 0',
            padding: '14px 16px',
            borderRadius: 20,
            background: 'rgba(255,51,51,0.12)',
            border: `1px solid ${HF.bad}55`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>🚨</span>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: HF.bad,
              }}
            >
              등급 D로 긴급 회수 권장
            </div>

            <div
              style={{
                fontSize: 11,
                color: HF.bad,
                marginTop: 2,
              }}
            >
              유압펌프 HI {((current?.HI ?? 0) * 100).toFixed(1)} · RUL{' '}
              {rul?.remainingHours ?? '--'}h
            </div>
          </div>

          <button
            className="hf-pill"
            style={{
              padding: '8px 10px',
              color: HF.bad,
              borderColor: `${HF.bad}66`,
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
            onClick={() => navigate('/recovery')}
          >
            회수 →
          </button>
        </div>
      )}

      {/* 3D 뷰어 영역 */}
      <div style={{ padding: '14px 16px 0' }}>
        {unityWebglAvailable ? (
          <ErrorBoundary fallbackTitle="Unity 3D 뷰어 로딩 실패">
            <div style={{ height: 250, borderRadius: 28, overflow: 'hidden' }}>
              <UnityViewer
                hiValue={hiValue}
                grade={grade}
                current={current}
                onReady={() => setUnityReady(true)}
              />
            </div>
          </ErrorBoundary>
        ) : (
          <FallbackViewer
            selected={selected}
            onSelect={setSelected}
            gradeColor={gradeColor}
          />
        )}
      </div>

      {/* 부품 선택 탭 */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8 }}>
        {Object.entries(parts).map(([id, p]) => (
          <div key={id}
            className={`hf-pill ${selected === id ? 'hf-pill-on' : ''}`}
            style={{
              whiteSpace: 'nowrap', flex: 1, textAlign: 'center',
              borderColor: selected === id ? HF.green : undefined,
              color: selected === id ? HF.green : undefined,
              background: selected === id ? HF.greenDim : undefined,
            }}
            onClick={() => setSelected(id)}>
            {p.name}{p.live ? ' 🔴' : ''}
          </div>
        ))}
      </div>

      {/* 선택 부품 상세 카드 */}
      <Section title="부품">
        <div className="hf-glass-hi" style={{ borderRadius: 24, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Grade grade={s.grade} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                {s.live && (
                  <span className="hf-pill" style={{ padding: '2px 7px', fontSize: 9, color: HF.green, borderColor: HF.greenBd, background: HF.greenDim }}>
                    LIVE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: HF.text70, marginTop: 2 }}>
                RUL <span className="mono" style={{ color: HF.text, fontWeight: 600 }}>{s.rul}</span> · {s.state}
              </div>
            </div>
            <button
              className="hf-btn hf-btn-primary"
              style={{ padding: '10px 16px', fontSize: 13 }}
              onClick={() => navigate('/recovery', { state: { partId: selected, partName: s.name, grade: s.grade } })}
            >
              회수
            </button>
          </div>

          {/* HI 트렌드 미니차트 */}
          <div style={{ marginTop: 14 }}>
            {s.live && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: HF.text50 }}>HI 추세 (유압펌프 · 실시간)</span>
                <span style={{ fontSize: 10, color: gradeColor[grade], fontWeight: 600 }}>
                  현재 {(hiValue * 100).toFixed(1)}
                </span>
              </div>
            )}
            <LineChart data={s.data} width={290} height={50} color={s.color} fill />
          </div>

          {/* LIVE 부품 추가 센서 정보 */}
          {s.live && current && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
              {[
                { l: '압력',  v: current.pressure?.toFixed(1), u: 'bar' },
                { l: '온도',  v: current.temp?.toFixed(1),     u: '°C' },
                { l: '드레인', v: current.drain?.toFixed(3),  u: 'L/m' },
              ].map(x => (
                <div key={x.l} className="hf-glass-soft" style={{ borderRadius: 12, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: HF.text50 }}>{x.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: HF.text, marginTop: 2 }}>
                    {x.v ?? '--'}<span style={{ fontSize: 9, color: HF.text40, marginLeft: 2 }}>{x.u}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* 범례 */}
      <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'center', gap: 18 }}>
        {[['양호', HF.green], ['주의', HF.warn], ['회수', HF.bad]].map(([n, c]) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: HF.text50 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: c, boxShadow: `0 0 10px ${c}` }}></span>{n}
          </span>
        ))}
      </div>

      <div className="bottom-safe-spacer" />
      <TabBar />
      
    </>
  );
}
