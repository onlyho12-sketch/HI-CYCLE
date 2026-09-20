import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar } from '../components.jsx';

/**
 * KonectIntegration — HD현대 KONECT 플랫폼 연동 아키텍처 시각화
 * 시스템 통합 다이어그램 + 연동 상태 시뮬레이션
 */

const MODULES = [
  { id: 'sensor',  name: '센서 모듈',      icon: '📡', desc: '압력/오염도/드레인/온도/진동 5채널 실시간 수집',   status: 'connected' },
  { id: 'edge',    name: '엣지 게이트웨이', icon: '🔗', desc: 'OBD 데이터 수집 + 전처리 + HI 실시간 산출',      status: 'connected' },
  { id: 'hicycle', name: 'HI-CYCLE 서버',   icon: '🖥️', desc: 'RUL 예측 + 등급 산출 + 바이백 크레딧 관리',       status: 'connected' },
  { id: 'konect',  name: 'HD KONECT',       icon: '☁️', desc: 'HD현대 통합 원격관제 플랫폼 (기존 인프라 활용)',  status: 'connected' },
  { id: 'reman',   name: '재제조 센터',     icon: '🏭', desc: '회수 부품 품질 검사 + 재제조 + 재출하',           status: 'standby' },
  { id: 'market',  name: '바이백 마켓',     icon: '💰', desc: '크레딧 거래 + 재제조 부품 구매 마켓플레이스',     status: 'planned' },
];

const STATUS_CONFIG = {
  connected: { label: '연결됨', color: HF.green, bg: 'rgba(0,102,51,0.08)' },
  standby:   { label: '대기',   color: '#F2994A', bg: 'rgba(242,153,74,0.08)' },
  planned:   { label: '계획',   color: HF.text50, bg: 'var(--hf-soft-bg)' },
};

const DATA_FLOW = [
  { from: '건설기계 센서', to: '엣지 게이트웨이', protocol: 'CAN / J1939', interval: '실시간' },
  { from: '엣지 게이트웨이', to: 'HI-CYCLE 서버', protocol: 'MQTT over LTE', interval: '1초' },
  { from: 'HI-CYCLE 서버', to: 'HD KONECT', protocol: 'REST API / gRPC', interval: '10초' },
  { from: 'HI-CYCLE 서버', to: '모바일 앱', protocol: 'WebSocket', interval: '실시간' },
  { from: 'HD KONECT', to: '재제조 센터', protocol: 'REST API', interval: '이벤트' },
];

export default function KonectIntegration() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <>
      <BackBar sub="시스템 통합" label="KONECT 연동 아키텍처" />

      {/* 연동 상태 요약 */}
      <Section>
        <div className="hf-glass" style={{ borderRadius: 28, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: HF.gradGreen,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: `0 4px 16px ${HF.green}60`,
            }}>☁️</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>HD현대 KONECT</div>
              <div style={{ fontSize: 12, color: HF.text50 }}>통합 원격관제 플랫폼 연동</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const cnt = MODULES.filter(m => m.status === status).length;
              return (
                <div key={status} style={{ flex: 1, background: cfg.bg, borderRadius: 14, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: HF.text50 }}>{cfg.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: cfg.color, marginTop: 2 }}>{cnt}</div>
                  <div style={{ fontSize: 9, color: HF.text40 }}>모듈</div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 아키텍처 다이어그램 */}
      <Section title="🏗️ 시스템 아키텍처">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MODULES.map((m, i) => {
            const cfg = STATUS_CONFIG[m.status];
            const isSelected = selectedModule === m.id;
            return (
              <React.Fragment key={m.id}>
                <div
                  className="fleet-card"
                  style={{
                    padding: 14,
                    border: isSelected ? `1px solid ${cfg.color}` : '1px solid transparent',
                    background: isSelected ? cfg.bg : 'var(--hf-soft-bg)',
                  }}
                  onClick={() => setSelectedModule(isSelected ? null : m.id)}
                  role="button" aria-label={m.name}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: cfg.bg, border: `1px solid ${cfg.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>{m.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: HF.text50, marginTop: 1 }}>{m.desc}</div>
                    </div>
                    <div style={{
                      fontSize: 9, padding: '3px 8px', borderRadius: 99,
                      background: `${cfg.color}20`, color: cfg.color, fontWeight: 600,
                    }}>{cfg.label}</div>
                  </div>
                </div>

                {/* 연결 화살표 */}
                {i < MODULES.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', color: HF.text25, fontSize: 14, padding: '0 0 0 20px' }}>
                    ↓
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Section>

      {/* 데이터 흐름 */}
      <Section title="📡 데이터 흐름">
        <div className="hf-glass-soft" style={{ borderRadius: 22, overflow: 'hidden' }}>
          {DATA_FLOW.map((flow, i) => (
            <div key={i} style={{
              padding: '12px 14px',
              borderBottom: i < DATA_FLOW.length - 1 ? `1px solid ${HF.divider}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: HF.green }}>{flow.from}</span>
                <span style={{ fontSize: 10, color: HF.text40 }}>→</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{flow.to}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: HF.text50, background: 'var(--hf-soft-bg)', padding: '2px 6px', borderRadius: 6 }}>
                  {flow.protocol}
                </span>
                <span style={{ fontSize: 10, color: HF.text40 }}>{flow.interval}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* HI-CYCLE × KONECT 차별점 */}
      <Section title="🔄 HI-CYCLE × KONECT 시너지">
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { existing: 'KONECT: 장비 위치/운행 모니터링', new: 'HI-CYCLE: 부품 수준 열화 진단', icon: '🔍' },
              { existing: 'KONECT: 고장 이력 관리', new: 'HI-CYCLE: RUL 예측 + 사전 회수', icon: '⏱️' },
              { existing: 'KONECT: 원격 서비스 연결', new: 'HI-CYCLE: 바이백 크레딧 순환경제', icon: '♻️' },
              { existing: 'KONECT: 정비 이력', new: 'HI-CYCLE: 운전점수(DS) 기반 가치 차등', icon: '📊' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 14, background: 'var(--hf-soft-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: HF.text50 }}>{item.existing}</span>
                </div>
                <div style={{ paddingLeft: 26, fontSize: 12, fontWeight: 600, color: HF.green }}>
                  + {item.new}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: HF.text50, lineHeight: 1.6 }}>
            HI-CYCLE은 기존 KONECT 인프라를 활용하면서, 부품 수준의 열화 진단과 순환경제 바이백 모델로 차별화합니다.
            KONECT의 장비 데이터 파이프라인(CAN → LTE → Cloud)을 그대로 활용하여 추가 하드웨어 투자 없이 구현 가능합니다.
          </div>
        </div>
      </Section>

      <TabBar />
    </>
  );
}
