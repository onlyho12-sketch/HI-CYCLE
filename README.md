# HI-CYCLE — 건설기계 유압실린더 상태 모니터링 + 바이백 플랫폼

[![시연 영상](docs/demo-thumb.jpg)](https://github.com/onlyho12-sketch/HI-CYCLE/releases/download/demo/demo.mp4)

<sub>▶ 이미지를 클릭하면 시연 영상(1분 5초)을 내려받아 볼 수 있습니다.</sub>

> **2026 HD 퓨처 건설기계 챌린지 · Track 2: 지속가능성**

센서 데이터 기반 Health Index(HI) → 등급 산출 → RUL 예측 → 바이백 크레딧 순환경제 플랫폼.  
React 18 + Vite + Unity WebGL + Simulink 시뮬레이션 데이터(20,001행).

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production 빌드 → dist/
```

> **참고 — Unity WebGL 빌드는 이 저장소에 포함되어 있지 않습니다.**
> 빌드 산출물(`.wasm` / `.data`, 약 130MB)은 저장소 용량 문제로 제외했습니다.
> `/twin` 화면은 Unity 빌드가 없으면 **SVG 폴백**으로 자동 전환되어 정상 동작하며,
> 나머지 화면(대시보드 · RUL · 센서 상세 등)은 `public/HI_CYCLE_e_2.csv` 기반으로
> 모두 그대로 실행됩니다.
>
> 3D 디지털 트윈까지 보려면 Unity WebGL 빌드 결과를 `public/` 에 넣어주세요:
> ```
> public/HICYCLE.{loader.js,framework.js,data,wasm}
> ```

**데모 계정**: `HD-EX-2018` / `1234` (프런트엔드 전용 목업 — 백엔드 인증 없음)

## HI 산출 수식

```
기본: HI = Σ(wi × FI_i)
DS 반영: HI_final = HI_raw × (1 + 0.30 × DS)
```

### FI 가중치 (FMEA RPN 기반)

| 센서 | FI | 가중치 | 근거 |
|------|-----|--------|------|
| 오염도 | FI_contam | 0.330 | ISO 4406 기준, 가장 큰 열화 기여 |
| 드레인 유량 | FI_drain | 0.275 | 내부 누유 = 직접적 성능 저하 |
| 압력 | FI_pressure | 0.165 | 실린더 출력 직결 |
| 온도 | FI_temp | 0.161 | 점도 변화 → 간접 마모 |
| 진동 | FI_vibration | 0.069 | 부차적 지표 |

### 등급 기준

| 등급 | HI 범위 | 상태 | 조치 |
|------|---------|------|------|
| A | 0 ~ 0.25 | 정상 | 정상 운행 |
| B | 0.25 ~ 0.50 | 경미 | 모니터링 |
| C | 0.50 ~ 0.75 | 주의 | 정비 계획 수립 |
| D | 0.75 ~ 1.00 | 위험 | 즉시 회수/교체 |

### RUL 예측 모델

**현재**: 지수함수 열화 모델 `HI(t) = a · e^(b·t)` → 선형화 후 최소제곱법
- R², 90% 신뢰구간 제공
- 선형 폴백 포함

**로드맵**:
1. Phase 2: LSTM 시계열 예측
2. Phase 3: Transformer + Attention
3. Phase 4: PINN (물리-데이터 융합)

## 폴더 구조

```
hicycle/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── HI_CYCLE_e_2.csv        # 시뮬레이션 데이터 (20,001행)
│   └── HD퓨처건설기계.*          # Unity WebGL 빌드
└── src/
    ├── main.jsx                  # 엔트리 — ThemeProvider + BrowserRouter
    ├── App.jsx                   # 라우트 + 폰 셸
    ├── styles.css                # CSS 변수 (라이트/다크) + 유틸리티 클래스
    ├── theme.jsx                 # ThemeProvider / useTheme + HF 토큰
    ├── components.jsx            # UI 프리미티브 (Gauge, Chart, TabBar, ...)
    ├── components/
    │   └── ErrorBoundary.jsx     # React 에러 바운더리
    ├── hooks/
    │   ├── useHICycleData.js     # CSV 파싱 + HI/RUL 계산 + 경제성 분석
    │   ├── useStreamingDemo.js   # 실시간 데모 모드 (시연용)
    │   └── useHICycleData.test.js # 유닛 테스트
    └── screens/
        ├── Splash.jsx            # 스플래시
        ├── Onboard.jsx           # 온보딩
        ├── Login.jsx             # 로그인
        ├── Register.jsx          # 회원가입
        ├── Dashboard.jsx         # 홈 대시보드 + HI 수식 모달 + 데모 모드
        ├── SensorDetail.jsx      # 센서 상세 (Recharts)
        ├── RUL.jsx               # RUL 예측 + 모델 정보 + 신뢰구간
        ├── DigitalTwin.jsx       # 디지털 트윈 (Unity + SVG 폴백)
        ├── Recovery.jsx          # 회수 현황 + 경제성 요약
        ├── Credit.jsx            # 바이백 크레딧 + 경제성 분석
        ├── Profile.jsx           # 내 정보
        ├── FleetDashboard.jsx    # [NEW] 다중 장비 관리
        ├── HIReport.jsx          # [NEW] HI 진단 보고서 (PDF)
        ├── NotificationPanel.jsx # [NEW] 알림 시스템
        └── KonectIntegration.jsx # [NEW] KONECT 연동 아키텍처
```

## 라우트 매핑

| 경로 | 화면 |
|---|---|
| `/` → `/login` | 자동 리다이렉트 |
| `/splash` | 스플래시 (1.6s 후 onboard) |
| `/onboard` | 온보딩 |
| `/login` | 로그인 |
| `/register` | 회원가입 |
| `/dashboard` | 홈 대시보드 + HI 수식 + 데모 모드 |
| `/sensor` | 센서 상세 |
| `/rul` | RUL 예측 + 모델 정보 |
| `/twin` | 디지털 트윈 |
| `/recovery` | 회수 현황 + 경제성 |
| `/credit` | 바이백 크레딧 + 경제성 분석 |
| `/profile` | 내 정보 (다크모드 토글) |
| `/fleet` | **[NEW]** 다중 장비 관리 |
| `/report` | **[NEW]** HI 진단 보고서 |
| `/notifications` | **[NEW]** 알림 시스템 |
| `/konect` | **[NEW]** KONECT 연동 아키텍처 |

## KONECT 연동 아키텍처

```
건설기계 센서 ─(CAN/J1939)─→ 엣지 게이트웨이 ─(MQTT/LTE)─→ HI-CYCLE 서버
                                                                    │
                    모바일 앱 ←─(WebSocket)─┘                       │
                                                                    │
                    HD KONECT ←─(REST API/gRPC)─────────────────────┘
                        │
                    재제조 센터 ←─(REST API/이벤트)─┘
```

**차별점**: KONECT의 장비 수준 모니터링에 **부품 수준 열화 진단** + **순환경제 바이백** 모델을 결합.
기존 CAN → LTE → Cloud 파이프라인을 활용하여 추가 하드웨어 없이 구현 가능.

## 경제성 분석

| 항목 | 금액 |
|------|------|
| 신품 유압실린더 | ₩3,000,000 |
| 재제조 비용 | ₩1,200,000 |
| 바이백 크레딧 (평균) | +₩150,000 |
| **고객 절감액** | **₩1,650,000 (55%)** |
| CO₂ 저감 (건당) | 39kg |

## 테스트

```bash
node src/hooks/useHICycleData.test.js
```

## 디자인 원칙

- 메인 액센트: HD현대 그린 `#006633`
- 등급: A=그린 / B=화이트 / C=앰버 / D=레드
- 배경: 순수 블랙(다크) / 소프트 화이트(라이트)
- 타이포: Pretendard (본문) + JetBrains Mono (수치)
- 라이트/다크 모드 CSS 변수 자동 전환
