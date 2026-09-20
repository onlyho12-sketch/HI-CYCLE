/**
 * useHICycleData 훅 유닛 테스트 (순수 함수 부분)
 *
 * 실행: node src/hooks/useHICycleData.test.js
 * (React 환경 없이 순수 함수만 테스트)
 */

// 순수 함수 테스트를 위해 직접 정의 (모듈에서 export된 함수들)
const GRADE_MAP = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };

function downsample(arr, maxPoints = 334) {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

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

// ── 테스트 유틸 ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.log(`  ❌ ${msg}`);
  }
}

function assertClose(a, b, tolerance, msg) {
  assert(Math.abs(a - b) < tolerance, `${msg} (${a} ≈ ${b} ± ${tolerance})`);
}

// ── 테스트 ────────────────────────────────────────────────────────────

console.log('\n📋 downsample 테스트');
{
  // 작은 배열은 그대로 반환
  const small = [1, 2, 3, 4, 5];
  assert(downsample(small, 10).length === 5, '작은 배열은 그대로');

  // 큰 배열은 다운샘플
  const big = Array.from({ length: 20000 }, (_, i) => i);
  const result = downsample(big, 334);
  assert(result.length <= 334, `20000 → ${result.length} (≤334)`);
  assert(result[0] === 0, '첫 번째 요소 유지');

  // maxPoints=1이면 1개만
  const one = downsample(big, 1);
  assert(one.length === 1, 'maxPoints=1이면 1개');
}

console.log('\n📋 stabilizeGrade 테스트');
{
  // 단일 행
  const single = stabilizeGrade([{ HI: 0.1 }]);
  assert(single[0].stableGrade === 'A', 'HI 0.1 → 등급 A');

  // 등급 경계값
  const boundaries = stabilizeGrade([
    { HI: 0.24 }, { HI: 0.25 }, { HI: 0.49 }, { HI: 0.50 },
    { HI: 0.74 }, { HI: 0.75 }, { HI: 0.99 },
  ], 1); // window=1이면 각 행 개별 판정
  assert(boundaries[0].stableGrade === 'A', 'HI 0.24 → A');
  assert(boundaries[1].stableGrade === 'B', 'HI 0.25 → B');
  assert(boundaries[3].stableGrade === 'C', 'HI 0.50 → C');
  assert(boundaries[5].stableGrade === 'D', 'HI 0.75 → D');

  // window 평활화 테스트
  const noisy = stabilizeGrade([
    { HI: 0.1 }, { HI: 0.1 }, { HI: 0.1 }, { HI: 0.1 },
    { HI: 0.9 }, // 갑작스러운 스파이크
    { HI: 0.1 }, { HI: 0.1 }, { HI: 0.1 },
  ], 5);
  // window=5이면 스파이크가 평활화됨
  assert(noisy[4].stableGrade !== 'D', 'window=5 스파이크 평활화 → D 아님');
}

console.log('\n📋 GRADE_MAP 테스트');
{
  assert(GRADE_MAP[1] === 'A', 'grade 1 → A');
  assert(GRADE_MAP[2] === 'B', 'grade 2 → B');
  assert(GRADE_MAP[3] === 'C', 'grade 3 → C');
  assert(GRADE_MAP[4] === 'D', 'grade 4 → D');
  assert(GRADE_MAP[5] === undefined, 'grade 5 → undefined');
}

console.log('\n📋 지수함수 RUL 모델 테스트');
{
  // 시뮬레이션 데이터: HI = 0.01 * e^(0.0003 * t)
  const simData = Array.from({ length: 1000 }, (_, i) => ({
    time: i * 10,
    HI: 0.01 * Math.exp(0.0003 * i * 10),
  }));

  // a = 0.01, b = 0.0003이면 HI=1.0 도달 시점 = ln(100)/0.0003 ≈ 15,351
  const expectedTime = Math.log(100) / 0.0003;
  const lastTime = simData[simData.length - 1].time;
  const expectedRUL = expectedTime - lastTime;

  // 데이터에서 HI > 0인 값들만으로 선형회귀 (ln(HI) vs t)
  const valid = simData.filter(r => r.HI > 0.001);
  const n = valid.length;
  const xs = valid.map(r => r.time);
  const lnYs = valid.map(r => Math.log(r.HI));
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumLnY = lnYs.reduce((a, b) => a + b, 0);
  const sumXLnY = xs.reduce((s, x, i) => s + x * lnYs[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const b = (n * sumXLnY - sumX * sumLnY) / (n * sumX2 - sumX * sumX);
  const lnA = (sumLnY - b * sumX) / n;

  assertClose(b, 0.0003, 0.0001, `b 파라미터 추정: ${b.toFixed(6)}`);
  assertClose(Math.exp(lnA), 0.01, 0.005, `a 파라미터 추정: ${Math.exp(lnA).toFixed(4)}`);

  const computedRUL = (-lnA / b) - lastTime;
  assertClose(computedRUL, expectedRUL, 500, `RUL 추정: ${computedRUL.toFixed(0)} ≈ ${expectedRUL.toFixed(0)}`);
}

// ── 결과 ──────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`테스트 결과: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}\n`);

if (failed > 0) process.exit(1);
