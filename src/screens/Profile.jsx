import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF, useTheme } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar } from '../components.jsx';
import { Icon } from '../components/Icon.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const { data, current, rul, loading } = useHICycleData();

  // 실데이터 기반 통계
  const stats = useMemo(() => {
    if (!data.length) return { opHours: '--', avgHI: '--', recovCount: 14 };
    const lastTime   = data[data.length - 1]?.time ?? 0;
    const opHours    = Math.round(lastTime / 3600 * 10) / 10;   // 초 → 시간
    const avgHI      = Math.round((data.reduce((s, r) => s + (r.HI ?? 0), 0) / data.length) * 100);
    return { opHours, avgHI, recovCount: 14 };
  }, [data]);

  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '10px 12px' }}><Icon name="gear" size={16} /></div>} />
      <TitleBlock title="내 정보" />



      {/* 프로필 카드 */}
      <div style={{ padding: '14px 24px 0' }}>
        <div className="hf-glass" style={{ borderRadius: 28, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 99,
            background: HF.gradGreen,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#001500',
            border: `2px solid ${HF.text25}`,
            boxShadow: `0 8px 24px ${HF.green}66`,
            flexShrink: 0,
          }}>김</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>김재선</div>
            <div style={{ fontSize: 12, color: HF.text50, marginTop: 2 }}>혁신건설 · 대표이사 · 12대 관리</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="hf-pill" style={{ padding: '4px 8px', fontSize: 10, background: HF.greenDim, color: HF.green, borderColor: HF.greenBd }}>HD-EX-2018</span>
              <span className="hf-pill" style={{ padding: '4px 8px', fontSize: 10, background: HF.text10, color: HF.text, borderColor: HF.text25 }}>ESG 우수</span>
            </div>
          </div>
          <span style={{ color: HF.text40, fontSize: 18 }}>›</span>
        </div>
      </div>

      {/* 실데이터 통계 */}
      <Section>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: '관리 장비',  v: 12,                              u: '대' },
            { l: '회수 누계',  v: stats.recovCount,                  u: 'EA', c: HF.green },
          ].map(x => (
            <div key={x.l} className="hf-glass-soft" style={{ flex: 1, borderRadius: 20, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: HF.text50 }}>{x.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.8, color: x.c || HF.text }}>{x.v}</span>
                <span className="mono" style={{ fontSize: 10, color: HF.text40 }}>{x.u}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 부품 순환 현황 */}
      <Section title="부품 순환 현황">
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { l: '재사용 가능', v: 2, u: '개', c: HF.green },
              { l: '회수 권장',   v: 1, u: '개', c: HF.bad },
              { l: '재제조 검토', v: 1, u: '개', c: HF.warn },
            ].map(x => (
              <div key={x.l} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: HF.text50 }}>{x.l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: x.c, marginTop: 4 }}>
                  {x.v}<span style={{ fontSize: 10, color: HF.text40, marginLeft: 2 }}>{x.u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 유지비 리포트 */}
      <div style={{ padding: '0 24px' }}>
        <div className="hf-glass-soft" style={{ borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', border: `1px solid var(--hf-divider)` }}>
          <div style={{ fontSize: 11, color: HF.text50, fontWeight: 600, marginBottom: 6 }}>
            이번 달 아낀 유지비
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: HF.green, letterSpacing: -0.5 }}>
            ₩350,000
          </div>
        </div>
      </div>  

      {/* 정비 캘린더 */}
      <Section title="정비 캘린더" action="전체 보기" onAction={() => navigate('/rul')}>
        <div className="hf-glass-soft" style={{ borderRadius: 20, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 1st Schedule */}
            <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 15, top: 28, bottom: -20, width: 2, background: 'var(--hf-text-10)' }}></div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(235,87,87,0.16)', color: HF.bad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1, fontWeight: 700 }}>
                14
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <div style={{ fontSize: 11, color: HF.bad, fontWeight: 700 }}>이번 주 금요일 (수명 임박)</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>유압실린더 교체 필요</div>
              </div>
            </div>
            {/* 2nd Schedule */}
            <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--hf-bg-deep)', color: HF.text50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1, fontWeight: 700 }}>
                29
              </div>
              <div style={{ flex: 1, paddingTop: 6 }}>
                <div style={{ fontSize: 11, color: HF.text50, fontWeight: 700 }}>다음 주 금요일</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>엔진오일 교환 (500h)</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 설정 목록 */}
      <Section title="설정">
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 0 }}>
          {[
            { i: 'truck', t: '장비 관리',  s: '12대',          toggle: false },
            { i: 'bell', t: '알림 설정',  s: '이상/RUL/회수', toggle: false },
            { i: 'globe', t: '언어',       s: '한국어',         toggle: false },
            { i: 'ruler', t: '단위',       s: 'bar / °C',       toggle: false },
            { i: 'moon', t: '다크 모드',  s: isDark ? '켜짐' : '꺼짐', toggle: true, on: isDark },
          ].map((r, i, arr) => (
            <div key={r.t} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12,
              borderBottom: i < arr.length - 1 ? `1px solid ${HF.divider}` : 'none',
              cursor: r.toggle ? 'default' : 'pointer',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: HF.text10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.text70 }}><Icon name={r.i} size={17} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</div>
                <div style={{ fontSize: 11, color: HF.text40, marginTop: 1 }}>{r.s}</div>
              </div>
              {r.toggle
                ? <div className={`hf-switch ${r.on ? 'on' : ''}`} onClick={toggle}></div>
                : <span style={{ color: HF.text40 }}>›</span>}
            </div>
          ))}
        </div>
      </Section>

      {/* 기타 메뉴 */}
      <Section>
        <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 0 }}>
          {[
            { t: '고객 지원' },
            { t: '앱 정보',  sub: 'v1.0.0 · HI-CYCLE' },
            { t: '로그아웃', a: '/login', danger: true },
          ].map((r, i, arr) => (
            <div key={r.t}
                 onClick={() => r.a && navigate(r.a)}
                 style={{ display: 'flex', alignItems: 'center', padding: '14px 18px',
                          borderBottom: i < arr.length - 1 ? `1px solid ${HF.divider}` : 'none', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, color: r.danger ? HF.bad : HF.text }}>{r.t}</span>
                {r.sub && <div style={{ fontSize: 11, color: HF.text40, marginTop: 2 }}>{r.sub}</div>}
              </div>
              <span style={{ color: HF.text40 }}>›</span>
            </div>
          ))}
        </div>
      </Section>

      <TabBar />
      <div className="bottom-safe-spacer" />
    </>
  );
}
