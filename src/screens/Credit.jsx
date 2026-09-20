import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar, LineChart } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

export default function Credit() {
  const navigate = useNavigate();
  const { buybackEstimate, ECONOMICS } = useHICycleData();

  const txs = [
    { d: '5/24', t: '주행 모터 회수', v: '+85,000',  c: HF.green, icon: '♻' },
    { d: '5/18', t: '필터 6EA 회수',  v: '+18,000',  c: HF.green, icon: '♻' },
    { d: '5/12', t: '정비비 차감',    v: '-42,000',  c: HF.bad,   icon: '🔧' },
    { d: '5/02', t: '유압펌프 회수',  v: '+160,000', c: HF.green, icon: '♻' },
  ];

  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '10px 12px' }}>···</div>} />
      <TitleBlock title="바이백 크레딧" subtitle="이번 달 적립 +103,000원" />

      <div style={{ padding: '14px 24px 0' }}>
        <div className="hf-glass-hi" style={{ borderRadius: 32, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 99,
                        background: `radial-gradient(circle, ${HF.green}50, transparent 70%)`, filter: 'blur(20px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: HF.text70, fontWeight: 500 }}>가용 크레딧</span>
              <div className="hf-pill" style={{ padding: '4px 10px', fontSize: 10, color: HF.green, borderColor: HF.greenBd, background: HF.greenDim }}>↑ +103K</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
              <span style={{ fontSize: 14, color: HF.text70 }}>₩</span>
              <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1, color: HF.text, textShadow: HF.heroShadow }}>142,000</span>
            </div>
            <div style={{ fontSize: 11, color: HF.text50, marginTop: 6 }}>누계 ₩1,820,000</div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="hf-btn" style={{ flex: 1, fontSize: 13, padding: '12px' }} onClick={() => alert('출금 기능은 준비 중입니다')} aria-label="출금">출금</button>
              <button className="hf-btn hf-btn-primary" style={{ flex: 1, fontSize: 13, padding: '12px' }} onClick={() => navigate('/recovery')} aria-label="부품 구매">부품 구매</button>
            </div>
          </div>
        </div>
      </div>

      {/* 경제성 분석 섹션 */}
      <Section title="얼마나 이득인지 분석해요">
        <div className="econ-card">
          <div style={{ fontSize: 12, color: HF.text50, marginBottom: 12 }}>신품 vs 재제조 비용 비교</div>

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
            <span className="econ-value" style={{ color: HF.green }}>
              +₩{(buybackEstimate?.credit ?? ECONOMICS.avgBuybackCredit).toLocaleString()}
            </span>
          </div>
          <div className="econ-row" style={{ borderTop: `2px solid ${HF.green}44`, paddingTop: 12, marginTop: 4, borderBottom: 'none' }}>
            <span className="econ-label" style={{ fontWeight: 600, color: HF.text }}>총 절감액</span>
            <span className="econ-value" style={{ fontSize: 18, color: HF.green }}>
              ₩{(buybackEstimate?.saving ?? ECONOMICS.customerSaving).toLocaleString()}
            </span>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>절감률</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: HF.green, marginTop: 2 }}>
                {((ECONOMICS.remanSavingRate) * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>ROI</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: HF.green, marginTop: 2 }}>
                {((ECONOMICS.newPartCost / ECONOMICS.remanCost - 1) * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ flex: 1, background: 'var(--hf-soft-bg)', borderRadius: 14, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: HF.text50 }}>등급 배수</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: HF.text, marginTop: 2 }}>
                ×{ECONOMICS.gradeMultiplier[buybackEstimate?.grade ?? 'A']}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: HF.text50, lineHeight: 1.6 }}>
            등급이 높을수록(A~D) 바이백 가치가 높아요! 숙련된 운전자의 부품은 열화가 적어 재제조 효율이 높기 때문에 더 높은 크레딧이 지급돼요.
          </div>
        </div>
      </Section>

      <Section title="ESG 임팩트 · 누적">
        <div className="hf-glass" style={{ borderRadius: 24, padding: 18 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { n: 'CO₂ 저감',     v: '312', u: 'kg' },
              { n: '재제조',        v: '8',   u: 'EA' },
              { n: '자원 순환율',   v: '74',  u: '%'  },
            ].map(x => (
              <div key={x.n} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>{x.n}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: HF.green, letterSpacing: -1, textShadow: `0 0 10px ${HF.green}60` }}>{x.v}</span>
                  <span className="mono" style={{ fontSize: 10, color: HF.text40 }}>{x.u}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <LineChart data={[20,28,36,40,52,58,70,85,100,120,135,150,180,210,250,290,312]} width={290} height={50} color={HF.green} fill />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: HF.text40 }}>1월</span>
            <span className="mono" style={{ fontSize: 10, color: HF.text40 }}>지금</span>
          </div>
        </div>
      </Section>

      <Section title="거래 내역" action="전체 보기" onAction={() => {}}>
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 6 }}>
          {txs.map((tx, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer',
                                  borderBottom: i < txs.length - 1 ? `1px solid ${HF.divider}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12,
                            background: tx.c === HF.green ? HF.greenDim : 'rgba(255,77,77,0.15)',
                            color: tx.c, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, border: `1px solid ${tx.c}44` }}>{tx.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.t}</div>
                <div className="mono" style={{ fontSize: 10, color: HF.text40, marginTop: 2 }}>{tx.d}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tx.c, letterSpacing: -0.3 }}>{tx.v}</div>
            </div>
          ))}
        </div>
      </Section>

      <TabBar />
    </>
  );
}
