import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

// 4단계 진행 바
const STEPS = [
  { label: '회수 신청', icon: '📋' },
  { label: '회수 중',   icon: '🚛' },
  { label: '회수 완료', icon: '✅' },
  { label: '크레딧 지급', icon: '💰' },
];

export default function Recovery() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingPart = location.state ?? null;

  const { current, rul, data, loading, buybackEstimate, ECONOMICS } = useHICycleData();
  const grade = current?.stableGrade ?? 'A';
  const isUrgent = grade === 'D';

  // 현재 진행 단계 (0-based, 2 = 회수 완료 진행 중)
  const currentStep = 2;

  const estimatedCredit = buybackEstimate?.credit ?? 97000;

  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '10px 12px' }}>+ 새 요청</div>} />
      <TitleBlock title="회수 현황" subtitle="진행 중 1건 · 완료 6건" />

      {/* grade D 긴급 배너 */}
      {isUrgent && (
        <div style={{ margin: '10px 24px 0', padding: '14px 16px', borderRadius: 20,
          background: 'rgba(255,51,51,0.12)', border: `1px solid ${HF.bad}55`,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: HF.bad }}>등급 D로 긴급 회수 권장</div>
            <div style={{ fontSize: 11, color: HF.bad, marginTop: 2 }}>
              유압 펌프 HI 4 · RUL 0h
            </div>
          </div>
          <div className="hf-pill" style={{ padding: '6px 10px', fontSize: 12, color: HF.bad, borderColor: `${HF.bad}66` }}>긴급</div>
        </div>
      )}

      {/* 진행 중 카드 */}
      <Section title="진행 중">
        <div className="hf-glass" style={{ borderRadius: 28, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: HF.green }}>REQ-0418</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                {incomingPart?.partName ?? '주행 모터'} 외 1건
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: HF.text50 }}>예상 크레딧</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: HF.green, letterSpacing: -0.5 }}>
                ₩ {estimatedCredit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 4단계 진행 바 */}
          <div style={{ position: 'relative', padding: '0 8px', marginBottom: 20 }}>
            {/* 배경 선 */}
            <div style={{ position: 'absolute', top: 20, left: 24, right: 24, height: 2, background: HF.text10, borderRadius: 99 }} />
            {/* 진행 선 */}
            <div style={{
              position: 'absolute', top: 20, left: 24,
              width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 48px * ${currentStep / (STEPS.length - 1)})`,
              height: 2, background: HF.gradGreen, borderRadius: 99,
              boxShadow: `0 0 8px ${HF.green}`,
              transition: 'width 0.5s ease',
            }} />

            {/* 단계 노드 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {STEPS.map((step, i) => {
                const done    = i < currentStep;
                const active  = i === currentStep;
                const waiting = i > currentStep;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                    <div style={{
                      width: active ? 42 : 34, height: active ? 42 : 34,
                      borderRadius: 99,
                      background: waiting ? HF.text10 : done ? HF.green : HF.text,
                      border: active ? `3px solid ${HF.green}` : `1px solid ${HF.text25}`,
                      boxShadow: active ? `0 0 16px ${HF.green}` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: active ? 18 : 14,
                      transition: 'all 0.3s',
                    }}>
                      {done ? '✓' : step.icon}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: active ? 700 : 400,
                      color: waiting ? HF.text40 : active ? HF.green : HF.text70,
                      textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 현재 단계 상세 */}
          <div className="hf-glass-soft" style={{ borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: HF.gradGreen,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${HF.green}80` }}>🚛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>수거 완료 진행 중</div>
              <div style={{ fontSize: 11, color: HF.text50, marginTop: 2 }}>예정 05/27 10:00 · 박ㅇㅇ 기사</div>
            </div>
            <button className="hf-pill" style={{ padding: '8px 10px' }}>💬</button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="hf-btn" style={{ flex: 1, fontSize: 13, padding: '12px' }}>일정 변경</button>
            <button className="hf-btn hf-btn-primary" style={{ flex: 1, fontSize: 13, padding: '12px' }}
              onClick={() => navigate('/credit')}>크레딧 보기</button>
          </div>
        </div>
      </Section>

      {/* 최근 완료 */}
      <Section title="최근 완료" action="전체 보기" onAction={() => navigate('/credit')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: 'REQ-0417', t: '유압 호스', v: '+18,000', d: '5/24' },
            { id: 'REQ-0416', t: '필터 6EA',  v: '+12,000', d: '5/18' },
          ].map(x => (
            <div key={x.id} className="hf-glass-soft"
                 style={{ borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                 onClick={() => navigate('/credit')}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: HF.green, boxShadow: `0 0 8px ${HF.green}` }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{x.t}</div>
                <div className="mono" style={{ fontSize: 10, color: HF.text40, marginTop: 2 }}>{x.id} · {x.d}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: HF.green }}>{x.v}</div>
            </div>
          ))}
        </div>
      </Section>
      
      {/* 경제성 요약 */}
      <Section title="💰 바이백 경제성 요약">
        <div className="econ-card">
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>예상 크레딧</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: HF.green, marginTop: 2 }}>
                ₩{estimatedCredit.toLocaleString()}
              </div>
            </div>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>재제조 절감</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: HF.text, marginTop: 2 }}>
                ₩{((ECONOMICS?.newPartCost ?? 3000000) - (ECONOMICS?.remanCost ?? 1200000)).toLocaleString()}
              </div>
            </div>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>CO₂ 저감</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: HF.green, marginTop: 2 }}>
                {ECONOMICS?.co2PerReman ?? 39}kg
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: HF.text50, marginTop: 10, lineHeight: 1.6 }}>
            회수된 부품은 HD현대 재제조 센터에서 품질 검증 후 재사용됩니다. 등급 {grade} 기준 바이백 배수 ×{ECONOMICS?.gradeMultiplier?.[grade] ?? 1} 적용.
          </div>
        </div>
      </Section>

      <TabBar />
    </>
  );
}
