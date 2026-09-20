import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/onboard'), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div onClick={() => navigate('/onboard')}
         style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 24, gap: 16, cursor: 'pointer' }}>
      <div style={{
        width: 120, height: 120, borderRadius: 99, position: 'relative',
        background: 'radial-gradient(circle at 30% 25%, #fff 0%, transparent 28%), radial-gradient(circle at 70% 70%, #b3ffb3 0%, transparent 50%), linear-gradient(135deg, #00ff44, #00a800 60%, #006600)',
        boxShadow: '0 20px 80px rgba(0,230,0,0.6), 0 0 60px rgba(0,230,0,0.4), inset 0 -8px 24px rgba(0,0,0,0.5)',
      }}></div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5, background: HF.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HI-CYCLE</div>
        <div style={{ fontSize: 13, color: HF.text50, marginTop: 6, letterSpacing: 0.5 }}>건설기계 유압실린더 상태 모니터링</div>
      </div>
      <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 200, height: 3, background: HF.text10, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '60%', height: '100%', background: HF.gradGreen, boxShadow: `0 0 12px ${HF.green}` }}></div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: HF.text40 }}>v 1.0.0 · 연결 중...</div>
      </div>
    </div>
  );
}
