---
title: "Change Point Detection"
date: 2026-03-10 00:00:00 +0000
categories:
  - "졸업논문"
tags:
  - "project"
  - "졸업논문"
---

- offline CPD vs online CPD
- point-level detection과 segment-level detection 차이
- detection delay, false alarm, tolerance window 같은 평가 개념
- abrupt change, gradual drift, regime shift 구분

## 문제 타입 구분
CPD가 어떤 문제인지 형태를 구분한다.

### offline CPD
`offline CPD`는 `전체 시계열을 다 본 뒤에` Change point를 찾는 방식이다.
예를 들어
- 게임 플레이 영상 10분.
- 모델이 10분 전체를 보고
- 2분 13초, 5분 41초, 8분 02초 같은 경계를 나중에 찾는다.

### Online CPD
반대로 online CPD는
- 영상이 실시간으로 들어오고
- 현재 시점까지만 본 상태에서
- "지금 변화가 발생했다"를 바로 감지해야 한다.

차이는 미래 정보를 쓰느냐


## Offline CPD
1. 고전 통계 기반 CPD
2. 표현학습 없는 거리/분할 기반 방법
3. 딥러닝 기반 offline CPD
4. 관련 인접 분야

### 통계적 분포 변화 탐지
가장 전통적인 계열.
핵심 아이디어는 `change point 전후의 데이터 분포가 다르다`는 것.

주요 방식
- 평균 변화 탐지
- 분산 변화 탐지
- 평균 + 분산 동시 변화
- likelihood ratio test
- Bayesian change point modeling

장점
> - 해석이 명확하다.
> - change가 무엇인지 수학적으로 설명하기 쉽다.

한계
> - 보통 저차원 시계열이나 단순 분포 가정에 강하게 의존한다.
> - 게임 비디오처럼 고차원 데이터에는 바로 쓰기가 어렵다.

CPD의 본질은 결국 전후 구간의 분포 차이.
**=> 그러면 게임에서는 어떤 분포의 차이를 볼 것인가?**


[[Open DMQA Seminar] Change Point Detection in Time Series](https://www.youtube.com/watch?v=l6GprjLizHo)

시계열 데이터의 종류
- 추세 변동(Trend)
- 계정 변동(Seasonal variations)
- 순환 변동(Cycle)
- 무작위 변동(Random fluctuation)
현실 데이터는 여러가지 시계열 종류의 성격을 담고 있음.

CPD는 시계열 데이터에서 급격한 변화를 보이는 순간을 찾는 분야.
CPD의 후행 연구로 시계열의 의미론적 분석, 이벤트 탐지, 시계열의 이상치 탐지 등이 가능함.
참고 논문 Time Series Change Point Detection based on Contrastive Predictive Coding



순수한 게임 플레이 영상은 부족
Youtube나 Twitch는 유명 플랫폼의 영상을 사용할 수 있음.
데이터 Curation 부분에서 불필요한 부분을 잘라내기 위해 action density를 사용
근데 