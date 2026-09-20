import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar, Grade, ProgressBar, LineChart } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

// HI 0~1 배열을 역방향 RUL(1→0)로 변환
function toRulCurve(hiArr) {
  return hiArr.map(v => +(1 - v).toFixed(3));
}

/* ─── 예측 모델 정보 패널 ──────────────────────────────────────────── */
function ModelInfoPanel({ rul, onClose }) {
  if (!rul) return null;
  return (
    <div className="info-modal-overlay" onClick={onClose} role="dialog" aria-label="RUL 예측 모델 정보">
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>🔬 예측 모델 정보</div>
          <button className="hf-pill" style={{ padding: '6px 10px' }} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 현재 모델 */}
        <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: HF.text50, marginBottom: 4 }}>현재 사용 모델</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: HF.green }}>{rul.modelLabel}</div>
          <div className="mono" style={{ fontSize: 12, color: HF.text70, marginTop: 6, lineHeight: 1.6 }}>
            {rul.formula}
          </div>
        </div>

        {/* 모델 성능 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: HF.text50 }}>R² (결정계수)</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: rul.rSquared > 0.9 ? HF.green : HF.warn, marginTop: 4 }}>
              {rul.rSquared}
            </div>
          </div>
          <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: HF.text50 }}>신뢰수준</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: HF.text, marginTop: 4 }}>
              {(rul.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* 신뢰구간 */}
        <div style={{ background: 'var(--hf-soft-bg)', borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: HF.text50, marginBottom: 4 }}>RUL 신뢰구간 (90%)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 14, color: HF.text70 }}>{rul.ciHours.lower}h</span>
            <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--hf-text-10)', position: 'relative' }}>
              <div style={{
                position: 'absolute', height: '100%', borderRadius: 99,
                left: `${(rul.ciHours.lower / rul.ciHours.upper) * 30}%`,
                right: '0%',
                background: `linear-gradient(90deg, ${HF.green}80, ${HF.green})`,
              }} />
            </div>
            <span className="mono" style={{ fontSize: 14, color: HF.text70 }}>{rul.ciHours.upper}h</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: HF.green }}>
              {rul.remainingHours}h
            </span>
            <span style={{ fontSize: 11, color: HF.text50 }}> (중앙값)</span>
          </div>
        </div>

        {/* 모델 로드맵 */}
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>예측 모델 로드맵</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rul.roadmap.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 14,
              background: r.status === 'active' ? 'rgba(0,102,51,0.08)' : 'var(--hf-soft-bg)',
              border: r.status === 'active' ? `1px solid ${HF.green}44` : '1px solid transparent',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 99,
                background: r.status === 'active' ? HF.green : HF.text25,
                boxShadow: r.status === 'active' ? `0 0 8px ${HF.green}` : 'none',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: r.status === 'active' ? 700 : 400 }}>{r.model}</div>
                <div style={{ fontSize: 10, color: HF.text40 }}>{r.phase}</div>
              </div>
              <div style={{
                fontSize: 9, padding: '3px 8px', borderRadius: 99,
                background: r.status === 'active' ? HF.green : HF.text10,
                color: r.status === 'active' ? '#fff' : HF.text50,
                fontWeight: 600,
              }}>
                {r.status === 'active' ? '사용 중' : '계획'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RUL() {
  const navigate = useNavigate();
  const [part, setPart] = useState('유압실린더');
  const [showModel, setShowModel] = useState(false);
  const { data, loading, error, rul, current } = useHICycleData();

  const grade    = current?.stableGrade ?? 'A';
  const gradeColor = { A: HF.green, B: HF.warn, C: HF.warn, D: HF.bad };

  // RUL 곡선 (HI 역방향) — 다운샘플해서 LineChart에
  const rulCurve = React.useMemo(() => {
    if (!data.length) return [1];
    const step = Math.max(1, Math.floor(data.length / 30));
    return toRulCurve(data.filter((_, i) => i % step === 0).map(r => r.HI));
  }, [data]);

  // 신뢰구간
  const rulH    = rul?.remainingHours ?? 0;
  const rulLow  = rul?.ciHours?.lower ?? Math.round(rulH * 0.9);
  const rulHigh = rul?.ciHours?.upper ?? Math.round(rulH * 1.1);

  // 열화 기여도 (마지막 행 FI값 × 가중치)
  const contribs = React.useMemo(() => {
    if (!data.length) return [];
    const last = data[data.length - 1];
    return [
      { f: '오염도 (FI_contam)',   v: Math.round((last.FI_contam   ?? 0) * 0.330 * 100) },
      { f: '드레인 (FI_drain)',    v: Math.round((last.FI_drain    ?? 0) * 0.275 * 100) },
      { f: '압력 (FI_pressure)',   v: Math.round((last.FI_pressure ?? 0) * 0.165 * 100) },
      { f: '온도 (FI_temp)',       v: Math.round((last.FI_temp     ?? 0) * 0.161 * 100) },
      { f: '진동 (FI_vibration)',  v: Math.round((last.FI_vibration?? 0) * 0.069 * 100) },
    ].sort((a, b) => b.v - a.v);
  }, [data]);

  if (loading) return (
    <div className="flex-col-center full-screen">
      <div className="loading-spinner" />
    </div>
  );
  if (error) return (
    <div className="flex-col-center full-screen">
      <div style={{ color: HF.bad }}>{error}</div>
    </div>
  );

  return (
    <>
      {showModel && <ModelInfoPanel rul={rul} onClose={() => setShowModel(false)} />}

      <BackBar sub="잔여 수명" label="RUL" />

      {/* 부품 탭 */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {['유압실린더', '유압펌프', '엔진', '주행모터', '필터'].map(p => (
            <div key={p}
              className={`hf-pill ${p === part ? 'hf-pill-on' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setPart(p)}
              role="tab" aria-selected={p === part}>{p}</div>
          ))}
        </div>
      </div>

      {/* RUL 메인 카드 */}
      <div style={{ padding: '16px 20px 0' }}>
        <div className="hf-glass" style={{ borderRadius: 28, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: HF.text50 }}>예측 잔여수명 · {part}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, color: gradeColor[grade] }}>
                  {Math.round(rulH)}
                </span>
                <span style={{ fontSize: 18, color: HF.text40 }}>h</span>
              </div>
              <div style={{ fontSize: 12, color: HF.text50, marginTop: 4 }}>
                ≈ 약 {Math.round(rulH / 24)}일 (현재 HI 추세)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: HF.text40 }}>신뢰구간 {((rul?.confidence ?? 0.9) * 100).toFixed(0)}%</div>
              <div style={{ fontSize: 13, color: HF.text70, marginTop: 2 }}>{rulLow} – {rulHigh}h</div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <Grade grade={grade} size={32} />
              </div>
            </div>
          </div>

          {/* 모델 정보 버튼 */}
          <button className="hf-pill" style={{ marginTop: 10, padding: '6px 12px', fontSize: 11, width: '100%', justifyContent: 'center' }}
            onClick={() => setShowModel(true)} aria-label="예측 모델 정보">
            🔬 {rul?.modelLabel ?? '예측 모델'} · R²={rul?.rSquared ?? '--'}
          </button>

          {/* RUL 곡선 */}
          <div style={{ marginTop: 14 }}>
            <LineChart
              data={rulCurve}
              width={280} height={120}
              color={gradeColor[grade]}
              fill
              dashedAfter={0.85}
              threshold={0.3}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: HF.text40 }}>0h</span>
            <span style={{ fontSize: 10, color: HF.text50 }}>RUL 추세</span>
            <span style={{ fontSize: 10, color: HF.text40 }}>→ 예측</span>
          </div>
        </div>
      </div>

      {/* HI 수치 현황 */}
      <Section title="현재 HI 상태">
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { l: 'HI 현재값', v: ((current?.HI ?? 0) * 100).toFixed(1), u: '%', c: gradeColor[grade] },
              { l: '등급',      v: grade,                                  u: '',  c: gradeColor[grade] },
              { l: '측정 시각', v: `${current?.time ?? 0}`,               u: 's', c: HF.text },
            ].map(x => (
              <div key={x.l} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>{x.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: x.c, letterSpacing: -1 }}>{x.v}</span>
                  <span style={{ fontSize: 10, color: HF.text40 }}>{x.u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 열화 기여도 */}
      <Section title="열화 요인 · FMEA RPN">
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contribs.map(x => (
            <ProgressBar key={x.f} value={x.v} max={100}
              label={x.f}
              valueLabel={`${x.v}%`}
            />
          ))}
        </div>
      </Section>

      <div style={{ padding: '18px 24px 0', display: 'flex', gap: 10 }}>
        <button className="hf-btn" style={{ flex: 1 }} onClick={() => navigate('/sensor', { state: { sensor: 'HI' } })} aria-label="센서 보기">센서 보기</button>
        <button className="hf-btn" style={{ flex: 1 }} onClick={() => navigate('/report')} aria-label="진단 보고서">📄 보고서</button>
        <button className="hf-btn hf-btn-primary" style={{ flex: 1 }} onClick={() => navigate('/recovery')} aria-label="회수 요청">회수 요청</button>
      </div>

      <TabBar />
    </>
  );
}
