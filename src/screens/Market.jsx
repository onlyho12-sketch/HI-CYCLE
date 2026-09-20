import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar } from '../components.jsx';
import { Icon } from '../components/Icon.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

const PRODUCTS = [
  { id: 'p1', type: 'reman', name: 'HD 정품 유압실린더 (Reman)', grade: 'A', price: 1200000, creditPrice: 1200000, img: 'recycle' },
  { id: 'p2', type: 'reman', name: '주행 모터 어셈블리 (Reman)', grade: 'B', price: 850000, creditPrice: 850000, img: 'gear' },
  { id: 'p3', type: 'consumable', name: '고성능 유압유 20L', price: 85000, creditPrice: 85000, img: 'drum' },
  { id: 'p4', type: 'consumable', name: '에어필터 세트 (6EA)', price: 42000, creditPrice: 42000, img: 'filter' },
  { id: 'p5', type: 'safety', name: '안전모 (HD현대 에디션)', price: 35000, creditPrice: 35000, img: 'hardhat' },
];

const GROUP_BUYS = [
  { id: 'gb1', name: '고성능 유압유 20L 10명 공구', originalPrice: 85000, price: 55000, maxGroup: 10, currGroup: 7, timeLeft: '12:45:00', img: 'drum' },
  { id: 'gb2', name: '에어필터 세트 50명 박스떼기', originalPrice: 42000, price: 29000, maxGroup: 50, currGroup: 48, timeLeft: '02:15:00', img: 'filter' }
];

const RENTALS = [
  { id: 'r1', name: '비 오는 날 굴착기(HX300L) 하루 빌려드립니다.', price: 300000, author: '김동현 기사', site: '현장 A', time: '10분 전', img: 'truck' },
  { id: 'r2', name: '주말 2일간 미니 굴착기 단기 렌탈 구해요!', price: 450000, author: '최현우 기사', site: '현장 C', time: '1시간 전', img: 'truck' }
];

export default function Market() {
  const navigate = useNavigate();
  const { buybackEstimate } = useHICycleData();
  const [filter, setFilter] = useState('전체');

  // 모의 크레딧 (기존 적립된 1,820,000원에 현재 회수 시 예상 크레딧 더함)
  const currentCredit = 1820000 + (buybackEstimate?.credit ?? 0);

  const filtered = filter === '전체' ? PRODUCTS : PRODUCTS.filter(p => p.type === filter);

  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '8px 12px', fontSize: 12 }}>내 쿠폰</div>} />

      {/* 정품 NFC 인증 배너 */}
      <div style={{ padding: '0 24px 16px' }} onClick={() => alert('🎉 HD현대 정품 인증 완료! 무상 A/S 기간이 6개월 연장되며, 5,000 크레딧이 지급되었습니다.')}>
        <div style={{ background: 'linear-gradient(90deg, #1A1A1A, #333333)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 700, border: '1px solid #FFD700', padding: '2px 6px', borderRadius: 4 }}>NFC</span>
              <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 700 }}>정품 인증하고 혜택 받기</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>부품 상자에 스마트폰을 터치하세요</div>
          </div>
          <div style={{ display: 'flex', color: '#fff' }}><Icon name="phone" size={24} /></div>
        </div>
      </div>

      {/* 내 크레딧 현황 */}
      <div style={{ padding: '0 24px' }}>
        <div className="hf-glass-hi" style={{ borderRadius: 24, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: HF.text50 }}>보유 크레딧</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: HF.green, marginTop: 4 }}>
              ₩{currentCredit.toLocaleString()}
            </div>
          </div>
          <button className="hf-btn" style={{ fontSize: 12, padding: '8px 12px' }} onClick={() => navigate('/credit')}>내역 보기</button>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div style={{ padding: '20px 24px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { id: '전체', label: '전체' },
          { id: 'reman', label: '재제조 부품', icon: 'recycle' },
          { id: 'consumable', label: '소모품', icon: 'drum' },
          { id: 'safety', label: '안전/기타', icon: 'hardhat' },
          { id: 'groupbuy', label: '공동구매', icon: 'users' },
          { id: 'rental', label: '장비 렌탈', icon: 'truck' },
        ].map(f => (
          <div key={f.id}
            className={`hf-pill ${f.id === filter ? 'hf-pill-on' : ''}`}
            style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap', gap: 5 }}
            onClick={() => setFilter(f.id)}
            role="tab" aria-selected={f.id === filter}
          >{f.icon && <Icon name={f.icon} size={13} />}{f.label}</div>
        ))}
      </div>

      {/* 상품 목록 */}
      <Section>
        {filter === 'groupbuy' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {GROUP_BUYS.map(gb => (
              <div key={gb.id} className="hf-glass-soft" style={{ borderRadius: 16, padding: 16, display: 'flex', gap: 16 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--hf-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.green, flexShrink: 0 }}>
                  <Icon name={gb.img} size={40} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, color: HF.bad, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={12} /> {gb.timeLeft} 남음</div>
                    <div style={{ fontSize: 11, color: HF.green, fontWeight: 700 }}>{gb.currGroup}/{gb.maxGroup}명 달성</div>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'var(--hf-text-10)', marginTop: 6, marginBottom: 8 }}>
                    <div style={{ width: `${(gb.currGroup/gb.maxGroup)*100}%`, height: '100%', borderRadius: 99, background: HF.green }}></div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{gb.name}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: HF.green, letterSpacing: -0.5 }}>₩{gb.price.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: HF.text40, textDecoration: 'line-through', marginBottom: 2 }}>{gb.originalPrice.toLocaleString()}</div>
                  </div>
                  <button className="hf-btn hf-btn-primary" style={{ marginTop: 12, width: '100%', fontSize: 13, padding: '8px 0' }} onClick={() => alert('공동구매에 참여했습니다!')}>
                    공동구매 참여하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : filter === 'rental' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RENTALS.map(r => (
              <div key={r.id} className="hf-glass-soft" style={{ borderRadius: 16, padding: 16, display: 'flex', gap: 16, border: `1px solid var(--hf-divider)` }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--hf-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.green, flexShrink: 0 }}>
                  <Icon name={r.img} size={30} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: HF.text50, marginBottom: 8 }}>{r.author} · {r.site} · {r.time}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: HF.text, letterSpacing: -0.5 }}>₩{r.price.toLocaleString()}</div>
                    <button className="hf-btn" style={{ padding: '6px 12px', fontSize: 11, background: HF.green, color: '#fff', borderRadius: 99, border: 'none' }} onClick={() => alert('채팅을 시작합니다.')}>채팅하기</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="hf-btn hf-btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={() => alert('내 장비 렌탈글을 작성합니다.')}>
              + 내 유휴 장비 대여하기
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="fleet-card" style={{ padding: 14, display: 'flex', flexDirection: 'column' }}>
                {/* 이미지 영역 (모의) */}
                <div style={{ height: 100, borderRadius: 12, background: 'var(--hf-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.green, marginBottom: 12 }}>
                  <Icon name={p.img} size={44} strokeWidth={1.5} />
                </div>
                
                {/* 상품 정보 */}
                <div style={{ flex: 1 }}>
                  {p.grade && (
                    <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: HF.text10, color: HF.text70, display: 'inline-block', marginBottom: 4 }}>
                      검증 등급 {p.grade}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, height: 36 }}>{p.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: HF.green, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: HF.text50, fontWeight: 400, marginRight: 2 }}>C</span>
                    {p.creditPrice.toLocaleString()}
                  </div>
                </div>

                {/* 구매 버튼 */}
                <button className="hf-pill" style={{ marginTop: 12, width: '100%', justifyContent: 'center', padding: '8px', fontSize: 12 }}
                  onClick={() => {
                    if (currentCredit >= p.creditPrice) {
                      alert(`${p.name} 구매가 완료되었습니다.\n잔여 크레딧: ${(currentCredit - p.creditPrice).toLocaleString()}원`);
                    } else {
                      alert('크레딧이 부족합니다.');
                    }
                  }}>
                  구매하기
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <TabBar />
      <TabBar />
      <div className="bottom-safe-spacer" />
    </>
  );
}
