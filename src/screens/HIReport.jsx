import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar, Grade, ProgressBar, LineChart } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

/**
 * HIReport — HI 진단 보고서 화면
 * 장비 정보, HI/등급/RUL 요약, 센서 차트, FMEA 기여도, 권고 사항 표시
 * 향후 html2canvas + jsPDF 연동으로 PDF 다운로드 지원 예정
 */
export default function HIReport() {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const { current, data, loading, error, rul, sensorSeries, HI_FORMULA_INFO, buybackEstimate, ECONOMICS } = useHICycleData();

  const grade      = current?.stableGrade ?? 'A';
  const gradeColor = { A: HF.green, B: HF.warn, C: HF.warn, D: HF.bad };
  const gradeLabel = { A: '정상', B: '경미', C: '주의', D: '위험' };

  // HI 추이 다운샘플
  const hiArr = React.useMemo(() => {
    const step = Math.max(1, Math.floor(data.length / 50));
    return data.filter((_, i) => i % step === 0).map(r => r.HI * 100);
  }, [data]);

  // FMEA 기여도
  const contribs = React.useMemo(() => {
    if (!data.length) return [];
    const last = data[data.length - 1];
    return [
      { f: '오염도', v: Math.round((last.FI_contam ?? 0) * 0.330 * 100) },
      { f: '드레인', v: Math.round((last.FI_drain ?? 0) * 0.275 * 100) },
      { f: '압력',   v: Math.round((last.FI_pressure ?? 0) * 0.165 * 100) },
      { f: '온도',   v: Math.round((last.FI_temp ?? 0) * 0.161 * 100) },
      { f: '진동',   v: Math.round((last.FI_vibration ?? 0) * 0.069 * 100) },
    ].sort((a, b) => b.v - a.v);
  }, [data]);

  // 권고 사항 자동 생성
  const recommendations = React.useMemo(() => {
    const rec = [];
    if (!current) return rec;
    if (grade === 'D') rec.push({ level: 'danger', text: '즉시 부품 회수/교체를 권장합니다. HI가 위험 수준에 도달했습니다.' });
    if (grade === 'C') rec.push({ level: 'warn', text: '정비 계획 수립이 필요합니다. 2주 이내 점검을 권장합니다.' });
    if (current.iso6 > 16) rec.push({ level: 'warn', text: `오염도(ISO) ${current.iso6.toFixed(2)} — ISO 4406 목표치(16) 초과. 유압유 교체 권장.` });
    if (current.temp > 90) rec.push({ level: 'warn', text: `온도 ${current.temp.toFixed(1)}°C — 정상 범위(90°C) 초과. 냉각 시스템 점검 필요.` });
    if (current.drain > 3.5) rec.push({ level: 'danger', text: `드레인 유량 ${current.drain.toFixed(3)} L/m — 내부 누유 의심. 씰 교체 권장.` });
    if (current.vibration > 7) rec.push({ level: 'warn', text: `진동 ${current.vibration.toFixed(2)} mm/s — 정상 범위 초과. 베어링 점검.` });
    if (rec.length === 0) rec.push({ level: 'ok', text: '현재 모든 센서값이 정상 범위입니다. 정기 점검 일정을 유지하세요.' });
    return rec;
  }, [current, grade]);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  // PDF 다운로드 (간이 구현 — 브라우저 print 활용)
  function handleDownload() {
    window.print();
  }

  if (loading) return (
    <div className="flex-col-center full-screen">
      <div className="loading-spinner" />
      <div style={{ color: HF.text50, marginTop: 12, fontSize: 14 }}>보고서 생성 중...</div>
    </div>
  );

  return (
    <>
      <BackBar sub="진단 보고서" label="HI 진단 보고서"
        action={
          <button className="hf-pill" style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={handleDownload} aria-label="PDF 다운로드">
            📄 PDF
          </button>
        }
      />

      <div ref={reportRef}>
        {/* 보고서 헤더 */}
        <div style={{ padding: '16px 24px 0' }}>
          <div className="hf-glass" style={{ borderRadius: 28, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: HF.text50 }}>HI-CYCLE 진단 보고서</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>HD HX300L · #2018</div>
                <div style={{ fontSize: 12, color: HF.text50, marginTop: 4 }}>발행일: {dateStr}</div>
              </div>
              <Grade grade={grade} size={56} />
            </div>

            {/* 핵심 지표 */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {[
                { l: 'HI 점수', v: ((current?.HI ?? 0) * 100).toFixed(1), u: '%', c: gradeColor[grade] },
                { l: '등급', v: grade, u: gradeLabel[grade], c: gradeColor[grade] },
                { l: 'RUL', v: rul?.remainingHours ?? '--', u: 'h', c: HF.text },
                { l: '측정 시각', v: current?.time ?? '--', u: 'h', c: HF.text },
              ].map(x => (
                <div key={x.l} style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: HF.text50 }}>{x.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: x.c, marginTop: 2 }}>{x.v}</div>
                  <div style={{ fontSize: 9, color: HF.text40 }}>{x.u}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HI 추이 */}
        <Section title="📈 HI 추이 (전체 구간)">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
            <LineChart data={hiArr} width={310} height={100} color={gradeColor[grade]} fill dashedAfter={0.85} threshold={75} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: HF.text40 }}>t=0</span>
              <span style={{ fontSize: 10, color: HF.bad }}>── 등급D 임계 (75%)</span>
              <span style={{ fontSize: 10, color: HF.text40 }}>t={data[data.length - 1]?.time}h</span>
            </div>
          </div>
        </Section>

        {/* 센서 현황 */}
        <Section title="📊 센서 현황">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: '압력', v: current?.pressure?.toFixed(1), u: 'bar', ok: (current?.pressure ?? 0) < 50 },
                { l: '오염도', v: current?.iso6?.toFixed(2), u: 'ISO', ok: (current?.iso6 ?? 0) < 16 },
                { l: '드레인', v: current?.drain?.toFixed(3), u: 'L/m', ok: (current?.drain ?? 0) < 3.5 },
                { l: '온도', v: current?.temp?.toFixed(1), u: '°C', ok: (current?.temp ?? 0) < 90 },
                { l: '진동', v: current?.vibration?.toFixed(2), u: 'mm/s', ok: (current?.vibration ?? 0) < 7 },
              ].map(x => (
                <div key={x.l} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 12,
                  background: x.ok ? 'transparent' : 'rgba(255,51,51,0.06)',
                  border: x.ok ? 'none' : '1px solid rgba(255,51,51,0.2)',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: x.ok ? HF.green : HF.bad }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: HF.text50 }}>{x.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{x.v ?? '--'}<span style={{ fontSize: 9, color: HF.text40, marginLeft: 2 }}>{x.u}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* FMEA 기여도 */}
        <Section title="🔧 열화 요인 · FMEA RPN">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contribs.map(x => (
              <ProgressBar key={x.f} value={x.v} max={100} label={x.f} valueLabel={`${x.v}%`} />
            ))}
          </div>
        </Section>

        {/* RUL 예측 모델 */}
        <Section title="🔬 RUL 예측 모델">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>사용 모델</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{rul?.modelLabel ?? '--'}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>R²</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: (rul?.rSquared ?? 0) > 0.9 ? HF.green : HF.warn, marginTop: 2 }}>
                  {rul?.rSquared ?? '--'}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>신뢰구간 90%</div>
                <div className="mono" style={{ fontSize: 13, marginTop: 2 }}>
                  {rul?.ciHours?.lower ?? '--'} ~ {rul?.ciHours?.upper ?? '--'}h
                </div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 11, color: HF.text50, marginTop: 8, wordBreak: 'break-all' }}>
              {rul?.formula ?? '--'}
            </div>
          </div>
        </Section>

        {/* 경제성 */}
        <Section title="💰 경제성 분석">
          <div className="econ-card">
            <div className="econ-row">
              <span className="econ-label">신품 구매 비용</span>
              <span className="econ-value" style={{ color: HF.bad }}>₩{ECONOMICS.newPartCost.toLocaleString()}</span>
            </div>
            <div className="econ-row">
              <span className="econ-label">재제조 비용</span>
              <span className="econ-value">₩{ECONOMICS.remanCost.toLocaleString()}</span>
            </div>
            <div className="econ-row">
              <span className="econ-label">바이백 크레딧 (예상)</span>
              <span className="econ-value" style={{ color: HF.green }}>+₩{(buybackEstimate?.credit ?? 0).toLocaleString()}</span>
            </div>
            <div className="econ-row" style={{ borderTop: `2px solid ${HF.green}44`, paddingTop: 10, borderBottom: 'none' }}>
              <span className="econ-label" style={{ fontWeight: 600 }}>총 절감액</span>
              <span className="econ-value" style={{ fontSize: 16, color: HF.green }}>₩{(buybackEstimate?.saving ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </Section>

        {/* 권고 사항 */}
        <Section title="📋 권고 사항">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recommendations.map((r, i) => (
              <div key={i} className={`alert-banner ${r.level === 'danger' ? 'alert-danger' : r.level === 'warn' ? 'alert-danger' : 'alert-success'}`}
                style={{ margin: 0 }}>
                <span className="alert-icon">{r.level === 'danger' ? '🚨' : r.level === 'warn' ? '⚠️' : '✅'}</span>
                <div style={{ flex: 1, fontSize: 12, color: HF.text, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 수식 참고 */}
        <Section title="📐 HI 산출 수식">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: HF.green, marginBottom: 4 }}>
              {HI_FORMULA_INFO.base}
            </div>
            <div className="mono" style={{ fontSize: 12, color: HF.text70, marginBottom: 8 }}>
              {HI_FORMULA_INFO.withDS}
            </div>
            <div style={{ fontSize: 11, color: HF.text50, lineHeight: 1.6 }}>
              {HI_FORMULA_INFO.description}
            </div>
          </div>
        </Section>
      </div>

      {/* 하단 액션 */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 10 }}>
        <button className="hf-btn" style={{ flex: 1 }} onClick={handleDownload} aria-label="PDF 다운로드">📄 PDF 다운로드</button>
        <button className="hf-btn hf-btn-primary" style={{ flex: 1 }} onClick={() => navigate('/recovery')} aria-label="회수 요청">회수 요청</button>
      </div>

      <TabBar />
    </>
  );
}
