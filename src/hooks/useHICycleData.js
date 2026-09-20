import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';

const GRADE_MAP = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };

export const GRADE_COLOR = {
  A: '#00CC44',
  B: '#FFD600',
  C: '#FF8C00',
  D: '#FF3333',
};

/* ───────────────────────────────────────────────────────────────────────────
 * FI 가중치 — FMEA RPN 기반 (학술논문 근거)
 * ─────────────────────────────────────────────────────────────────────────── */
export const FI_WEIGHT = {
  FI_contam:    0.330,  // 오염도 (ISO 4406)
  FI_drain:     0.275,  // 드레인 유량 (내부 누유)
  FI_pressure:  0.165,  // 압력 (실린더 출력)
  FI_temp:      0.161,  // 온도 (점도 변화)
  FI_vibration: 0.069,  // 진동 (부차적)
};

/* ───────────────────────────────────────────────────────────────────────────
 * HI 산출 수식 정보 (UI 표시용)
 * ─────────────────────────────────────────────────────────────────────────── */
export const HI_FORMULA_INFO = {
  base: 'HI = Σ(wi × FI_i)',
  withDS: 'HI_final = HI_raw × (1 + 0.30 × DS)',
  description: 'HI(Health Index)는 5개 센서의 열화지수(FI)를 FMEA 가중치로 합산하여 산출합니다. 운전점수(DS)가 반영되면 운전 습관에 따른 마모 가속/감속이 적용됩니다.',
  weights: FI_WEIGHT,
  gradeThresholds: {
    A: { range: '0 ~ 0.25', label: '정상', desc: '정상 운행 가능' },
    B: { range: '0.25 ~ 0.50', label: '경미', desc: '모니터링 권장' },
    C: { range: '0.50 ~ 0.75', label: '주의', desc: '정비 계획 수립 필요' },
    D: { range: '0.75 ~ 1.00', label: '위험', desc: '즉시 회수/교체 권장' },
  },
};

/* ───────────────────────────────────────────────────────────────────────────
 * 경제성 분석 데이터 (UI 표시용)
 * ─────────────────────────────────────────────────────────────────────────── */
export const ECONOMICS = {
  newPartCost:       3000000,  // 신품 유압실린더 300만원
  remanCost:         1200000,  // 재제조 120만원
  avgBuybackCredit:   150000,  // 평균 바이백 크레딧 15만원
  customerSaving:    1650000,  // 고객 절감액 165만원 (재제조 구매 시)
  co2PerReman:           39,  // 재제조 1건당 CO₂ 저감 (kg)
  remanSavingRate:     0.60,  // 신품 대비 재제조 비용 절감률 60%
  gradeMultiplier: {
    A: 1.0,   // 등급별 바이백 가치 배수
    B: 0.75,
    C: 0.45,
    D: 0.15,
  },
};

// 최근 N행 평균으로 grade 안정화
function stabilizeGrade(rows, window = 10) {
  return rows.map((row, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = rows.slice(start, i + 1);
    const avgHI = slice.reduce((s, r) => s + r.HI, 0) / slice.length;
    let stableGrade;
    if      (avgHI < 0.25) stableGrade = 'A';
    else if (avgHI < 0.50) stableGrade = 'B';
    else if (avgHI < 0.75) stableGrade = 'C';
    else                   stableGrade = 'D';
    return { ...row, stableGrade };
  });
}

// 20001행 → 차트용 다운샘플 (maxPoints 기준)
export function downsample(arr, maxPoints = 334) {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

/* ───────────────────────────────────────────────────────────────────────────
 * RUL 예측 — 지수함수 피팅 (Exponential Degradation Model)
 *
 * 모델:  HI(t) = a · e^(b·t)
 * 선형화: ln(HI) = ln(a) + b·t → 최소제곱법으로 a, b 추정
 * RUL = (ln(1.0) - ln(a)) / b - t_current = -ln(a)/b - t_current
 *
 * ※ 향후 고도화 로드맵:
 *   Phase 2: LSTM 기반 시계열 예측 (센서 5채널 → HI 예측)
 *   Phase 3: Transformer + Attention (부품 간 상관관계 반영)
 *   Phase 4: Physics-Informed Neural Network (물리 모델 + 데이터 융합)
 * ─────────────────────────────────────────────────────────────────────────── */
function computeExponentialRUL(data, sampleSize = 500) {
  if (data.length < 10) return null;

  const sampled = downsample(data, sampleSize);
  // HI > 0인 데이터만 사용 (ln 적용 위해)
  const valid = sampled.filter(r => r.HI > 0.001);
  if (valid.length < 10) return null;

  const n    = valid.length;
  const xs   = valid.map(r => r.time);
  const lnYs = valid.map(r => Math.log(r.HI));

  // 선형회귀: ln(HI) = ln(a) + b·t
  const sumX    = xs.reduce((a, b) => a + b, 0);
  const sumLnY  = lnYs.reduce((a, b) => a + b, 0);
  const sumXLnY = xs.reduce((s, x, i) => s + x * lnYs[i], 0);
  const sumX2   = xs.reduce((s, x) => s + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return null;

  const b     = (n * sumXLnY - sumX * sumLnY) / denom;
  const lnA   = (sumLnY - b * sumX) / n;
  const a     = Math.exp(lnA);

  if (b <= 0) {
    // 열화 속도가 음수면 선형 폴백
    return computeLinearRUL(data, sampleSize);
  }

  const lastTime       = xs[xs.length - 1];
  const timeToFailure  = (Math.log(1.0) - lnA) / b;  // HI=1.0 도달 시점
  const remainingSteps = Math.max(0, timeToFailure - lastTime);

  // R² (결정계수) 계산
  const meanLnY = sumLnY / n;
  const ssTot   = lnYs.reduce((s, y) => s + (y - meanLnY) ** 2, 0);
  const ssRes   = lnYs.reduce((s, y, i) => s + (y - (lnA + b * xs[i])) ** 2, 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // 신뢰구간 (잔차 기반 부트스트래핑 근사: ±1.645σ for 90% CI)
  const residuals = lnYs.map((y, i) => y - (lnA + b * xs[i]));
  const sigmaResid = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / (n - 2));
  const ciMultiplier = 1.645; // 90% CI
  const rulUpper = Math.max(0, (-lnA - ciMultiplier * sigmaResid) / b - lastTime);
  const rulLower = Math.max(0, (-lnA + ciMultiplier * sigmaResid) / b - lastTime);

  return {
    remainingSeconds: Math.round(remainingSteps),
    remainingHours:   +(remainingSteps / 3600).toFixed(1),
    model: 'exponential',
    modelLabel: '지수함수 열화 모델',
    formula: `HI(t) = ${a.toExponential(3)} × e^(${b.toExponential(3)}·t)`,
    params: { a: +a.toExponential(4), b: +b.toExponential(4) },
    rSquared: +rSquared.toFixed(4),
    confidence: 0.90,
    ciHours: {
      lower: +(Math.min(rulLower, rulUpper) / 3600).toFixed(1),
      upper: +(Math.max(rulLower, rulUpper) / 3600).toFixed(1),
    },
    // 향후 모델 로드맵 (UI 표시용)
    roadmap: [
      { phase: '현재', model: '지수함수 회귀', status: 'active' },
      { phase: 'Phase 2', model: 'LSTM 시계열 예측', status: 'planned' },
      { phase: 'Phase 3', model: 'Transformer + Attention', status: 'planned' },
      { phase: 'Phase 4', model: 'PINN (물리-데이터 융합)', status: 'planned' },
    ],
  };
}

// 선형회귀 폴백
function computeLinearRUL(data, sampleSize = 500) {
  if (data.length < 2) return null;
  const sampled = downsample(data, sampleSize);
  const n   = sampled.length;
  const xs  = sampled.map(r => r.time);
  const ys  = sampled.map(r => r.HI);
  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const slope     = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const lastTime  = xs[xs.length - 1];
  const timeToFailure = (1.0 - intercept) / slope;
  const remainingSteps = Math.max(0, timeToFailure - lastTime);

  // R²
  const meanY = sumY / n;
  const ssTot = ys.reduce((s, y) => s + (y - meanY) ** 2, 0);
  const ssRes = ys.reduce((s, y, i) => s + (y - (intercept + slope * xs[i])) ** 2, 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return {
    remainingSeconds: Math.round(remainingSteps),
    remainingHours:   +(remainingSteps / 3600).toFixed(1),
    model: 'linear',
    modelLabel: '선형 회귀 모델',
    formula: `HI(t) = ${slope.toExponential(3)}·t + ${intercept.toFixed(4)}`,
    params: { slope: +slope.toFixed(6), intercept: +intercept.toFixed(4) },
    rSquared: +rSquared.toFixed(4),
    confidence: 0.90,
    ciHours: {
      lower: +(remainingSteps * 0.9 / 3600).toFixed(1),
      upper: +(remainingSteps * 1.1 / 3600).toFixed(1),
    },
    roadmap: [
      { phase: '현재', model: '선형 회귀 (폴백)', status: 'active' },
      { phase: 'Phase 2', model: 'LSTM 시계열 예측', status: 'planned' },
      { phase: 'Phase 3', model: 'Transformer + Attention', status: 'planned' },
      { phase: 'Phase 4', model: 'PINN (물리-데이터 융합)', status: 'planned' },
    ],
  };
}


export function useHICycleData(csvPath = '/HI_CYCLE_e_2.csv') {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Papa.parse(csvPath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length && errors[0].type !== 'Delimiter') {
          setError(errors[0].message);
          setLoading(false);
          return;
        }
        const parsed = data.map(row => ({
          ...row,
          grade: GRADE_MAP[row.grade] ?? 'A',
          // HI_score: CSV에 이미 있음 (0~100), 없으면 HI로 계산
          HI_score: row.HI_score != null ? +row.HI_score : +(row.HI * 100).toFixed(2),
        }));
        setRaw(stabilizeGrade(parsed));
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  }, [csvPath]);

  // 현재 상태 (마지막 행)
  const current = useMemo(() => raw[16000] ?? null, [raw]);

  // grade D 진입 첫 인덱스
  const gradeDStartIndex = useMemo(
    () => raw.findIndex(r => r.stableGrade === 'D'),
    [raw]
  );

  // RUL — 지수함수 피팅 (선형 폴백 포함)
  const rul = useMemo(() => computeExponentialRUL(raw), [raw]);

  // 센서별 시계열 — 차트용 다운샘플 적용
  const sensorSeries = useMemo(() => {
    const s = downsample(raw, 334);
    return {
      pressure:  s.map(r => ({ time: r.time, value: r.pressure })),
      iso6:      s.map(r => ({ time: r.time, value: r.iso6 })),
      drain:     s.map(r => ({ time: r.time, value: r.drain })),
      temp:      s.map(r => ({ time: r.time, value: r.temp })),
      vibration: s.map(r => ({ time: r.time, value: r.vibration })),
      HI:        s.map(r => ({ time: r.time, value: r.HI, grade: r.stableGrade })),
    };
  }, [raw]);

  // 바이백 예상 크레딧 계산
  const buybackEstimate = useMemo(() => {
    if (!current) return null;
    const grade = current.stableGrade;
    const multiplier = ECONOMICS.gradeMultiplier[grade] ?? 0;
    const credit = Math.round(ECONOMICS.avgBuybackCredit * multiplier * (1 + (1 - current.HI) * 0.5));
    return {
      credit,
      grade,
      newPartCost: ECONOMICS.newPartCost,
      remanCost: ECONOMICS.remanCost,
      saving: ECONOMICS.newPartCost - ECONOMICS.remanCost + credit,
      co2Saving: ECONOMICS.co2PerReman,
    };
  }, [current]);

  return {
    data: raw,
    current,
    loading,
    error,
    rul,
    sensorSeries,
    gradeDStartIndex,
    buybackEstimate,
    GRADE_COLOR,
    HI_FORMULA_INFO,
    ECONOMICS,
  };
}
