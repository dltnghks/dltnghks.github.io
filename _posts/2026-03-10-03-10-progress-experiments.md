---
title: "03.10 Progress Experiments"
date: 2026-03-10 00:00:00 +0000
categories:
  - "졸업논문"
tags:
  - "project"
  - "졸업논문"
---

Action 기반 Timeline 그려보기
Phase Change 부분 확인하기
기존 모델들을 사용해서 Change Point를 찾는 경우 어떤 지 확인하기

Why? 일반적인 동영상에서는 Change Point를 잘 찾아서 Phase를 나눌 수 있지만, 게임 플레이 영상에서는 게임과 관련 없는 내용 필터링, 전환 부분 감지 등이 약해진다는 근거를 찾기 위함.

---

시계열 데이터나 영상 등에서 평균, 분산, 추세 등 통계적 특성이 급격히 변하는 시점을 찾아내어, **의미 있는 이벤트 발생을 탐지(Event Detection)하고, 데이터를 유의미한 구간으로 분할(Segmentation)하여 시스템의 이상 징후를 조기에 파악**


**1. Change Point Detection 자체**

- offline CPD vs online CPD
- point-level detection과 segment-level detection 차이
- detection delay, false alarm, tolerance window 같은 평가 개념
- abrupt change, gradual drift, regime shift 구분

이걸 알아야 네 문제가 정확히 어떤 CPD setting인지 정리됩니다.

**2. Temporal representation learning**

- sequence modeling의 기본
- short-term pattern vs long-term context
- sliding window 기반 학습
- timestamp-wise scoring, boundary prediction, sequence labeling

네 문제는 결국 각 시점의 변화 점수를 잘 뽑는 문제라서, 일반 분류보다 시계열 표현학습 이해가 더 중요합니다.

**3. Multimodal learning**

- video feature와 input signal feature를 어떻게 맞출지
- early fusion, late fusion, cross-attention
- modality alignment 문제
- 한 modality가 noisy할 때 fusion이 어떻게 망가지는지

네 아이디어의 핵심 기여 후보가 여기 있습니다. video만으로 안 되는 것을 input이 어떻게 보완하는지 설명해야 합니다.

**4. Game input/action modeling**

- raw gamepad input을 어떻게 표현할지
- button press / hold / release
- joystick direction, magnitude, velocity
- action sequence motif, rhythm, burstiness
- input-event와 visual consequence 사이의 time lag

이걸 모르고 raw input만 넣으면 노이즈가 너무 커집니다.

**5. Annotation and evaluation design**

- “temporal dynamics가 유의미하게 바뀌는 시점”을 operationalize하는 방법
- annotator guideline 만드는 법
- hard negative 설계
- point matching metric, F1@tol, mAP류 평가
- inter-annotator agreement

이건 생각보다 중요합니다. 모델보다 평가 설계가 먼저 흔들리면 논문이 약해집니다.

추가로, 네 주제에서 특히 따로 공부할 만한 건 3개입니다.

- **video understanding**  
    action recognition, temporal action localization, boundary-sensitive detection
- **time-series CPD**  
    통계적 CPD와 딥러닝 기반 CPD 둘 다
- **game analytics / player behavior modeling**  
    플레이 상태 전환, 행동 패턴 분석, intent inference

한 줄로 압축하면 이렇습니다:  
CPD + temporal modeling + multimodal fusion + game input representation + annotation/evaluation

가장 실전적인 공부 순서도 적으면:

1. CPD 기본 개념과 평가
2. sequence labeling / temporal localization
3. multimodal fusion
4. gamepad input representation
5. annotation protocol와 benchmark 설계

