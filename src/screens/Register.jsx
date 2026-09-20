import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    equipId:  '',
    staffId:  '',
    password: '',
    passwordConfirm: '',
  });
  const [showPw,        setShowPw]        = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.equipId.trim())
      e.equipId = '장비 ID를 입력해주세요.';
    else if (!/^HD-[A-Z]{2}-\d{4}$/.test(form.equipId.trim()))
      e.equipId = '형식이 올바르지 않습니다. (예: HD-EX-2018)';

    if (!form.staffId.trim())
      e.staffId = '사번을 입력해주세요.';
    else if (form.staffId.trim().length < 4)
      e.staffId = '사번은 4자리 이상이어야 합니다.';

    if (!form.password)
      e.password = '비밀번호를 입력해주세요.';
    else if (form.password.length < 4)
      e.password = '비밀번호는 4자 이상이어야 합니다.';

    if (!form.passwordConfirm)
      e.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    else if (form.password !== form.passwordConfirm)
      e.passwordConfirm = '비밀번호가 일치하지 않습니다.';

    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
  }

  // 가입 완료 화면
  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '40px 28px', gap: 20, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 99,
        background: HF.gradGreen,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, boxShadow: `0 8px 32px ${HF.green}66`,
      }}>✓</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>가입 완료!</div>
        <div style={{ fontSize: 14, color: HF.text50, marginTop: 8 }}>
          {form.equipId} 으로 가입되었습니다.
        </div>
      </div>
      <button className="hf-btn hf-btn-primary" style={{ width: '100%', marginTop: 12 }}
        onClick={() => navigate('/login')}>
        로그인하러 가기
      </button>
    </div>
  );

  return (
    <div style={{ padding: '52px 28px 80px', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button className="hf-pill" style={{ padding: '10px 14px' }} onClick={() => navigate('/login')}>‹</button>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>회원가입</div>
          <div style={{ fontSize: 13, color: HF.text50, marginTop: 2 }}>HI-CYCLE 계정을 만들어요</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 장비 ID */}
        <Field
          label="장비 ID"
          placeholder="HD-EX-2018"
          value={form.equipId}
          onChange={v => set('equipId', v)}
          error={errors.equipId}
          hint="HD-XX-0000 형식"
        />

        {/* 사번 */}
        <Field
          label="사번"
          placeholder="사번 입력"
          value={form.staffId}
          onChange={v => set('staffId', v)}
          error={errors.staffId}
        />

        {/* 비밀번호 */}
        <Field
          label="비밀번호"
          placeholder="4자 이상"
          value={form.password}
          onChange={v => set('password', v)}
          error={errors.password}
          type={showPw ? 'text' : 'password'}
          rightEl={
            <span style={{ fontSize: 18, color: HF.text40, cursor: 'pointer' }}
              onClick={() => setShowPw(v => !v)}>
              {showPw ? '🙈' : '👁'}
            </span>
          }
        />

        {/* 비밀번호 확인 */}
        <Field
          label="비밀번호 확인"
          placeholder="비밀번호 재입력"
          value={form.passwordConfirm}
          onChange={v => set('passwordConfirm', v)}
          error={errors.passwordConfirm}
          type={showPwConfirm ? 'text' : 'password'}
          success={form.passwordConfirm && form.password === form.passwordConfirm}
          rightEl={
            <span style={{ fontSize: 18, color: HF.text40, cursor: 'pointer' }}
              onClick={() => setShowPwConfirm(v => !v)}>
              {showPwConfirm ? '🙈' : '👁'}
            </span>
          }
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {/* 비밀번호 일치 표시 */}
        {form.passwordConfirm && form.password === form.passwordConfirm && (
          <div style={{ fontSize: 12, color: HF.green, marginTop: -6 }}>✓ 비밀번호가 일치합니다</div>
        )}

        {/* 가입 버튼 */}
        <button
          className="hf-btn hf-btn-primary"
          style={{ marginTop: 8, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '처리 중...' : '가입하기'}
        </button>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 24 }}>
        <span style={{ fontSize: 13, color: HF.text50 }}>이미 계정이 있으신가요? </span>
        <span style={{ fontSize: 13, color: HF.green, fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate('/login')}>
          로그인
        </span>
      </div>
    </div>
  );
}

// ─── 재사용 입력 필드 컴포넌트 ───────────────────────────────────────────────
function Field({ label, placeholder, value, onChange, error, hint, type = 'text', rightEl, success, onKeyDown }) {
  const { HF: _hf } = { HF };
  const borderColor = error ? HF.bad : success ? HF.green : 'transparent';
  return (
    <div>
      <div
        className="hf-glass-soft"
        style={{
          borderRadius: 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${borderColor}`,
          transition: 'border-color .2s',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: HF.text40, fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontSize: 16, fontWeight: 600, color: HF.text,
              fontFamily: 'inherit',
            }}
          />
        </div>
        {rightEl}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: HF.bad, marginTop: 5, paddingLeft: 4 }}>⚠ {error}</div>
      )}
      {!error && hint && (
        <div style={{ fontSize: 11, color: HF.text40, marginTop: 4, paddingLeft: 4 }}>{hint}</div>
      )}
    </div>
  );
}
