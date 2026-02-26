---
title: "02.23 Cross-game 실험 준비 및 Data Split 고정"
date: 2026-02-23 00:00:00 +0000
categories:
  - "졸업논문"
tags:
  - "project"
  - "졸업논문"
---

## 오늘 한 일

1. Plan 문서 비판적 리뷰
- `01.Project/01.졸업논문/Plan.md`를 검토하고 실험 리스크 정리
- 핵심 이슈: 데이터 누수 가능성, positive pair 정의 모호성, 지표/통계 신뢰성 부족

2. 문서 체계 정비
- `01.Project/01.졸업논문/02.Version/02_CrossGame`를 역할별 폴더로 분리
  - `00_Progress/`
  - `01_Protocol/`
  - `02_DataSplit/`
  - `03_References/`
- 인덱스 문서 `README.md` 생성

3. 실험 규약/참고문헌 정리
- `01_Protocol/Experiment-Protocol.md` 작성
- `03_References/References.md` 작성 (GRL, DG, contrastive, NitroGen 중심)

4. Data Split 문서화
- `02_DataSplit/Split-Policy.md` 작성
- `02_DataSplit/split_summary_v1.md`, `02_DataSplit/leakage_check_v1.md` 템플릿 생성

5. split 문서 검토 및 정합성 확인
- 사용자 업데이트 반영 후 교차 점검
- 확인 완료:
  - Hold-out 게임 목록 일치
  - Manifest 버전 일치 (`split_manifest_v2.csv`)
  - 누수 체크 PASS
- 남은 작업:
  - `split_summary_v1.md`의 버튼 positive 비율/joystick 통계 채우기

## 현재 상태

- [x] 문서 구조 정리 완료
- [x] 실험 규약 v1 정리 완료
- [x] hold-out 분리 및 누수 체크 문서 정합성 확보
- [x] split 분포 통계(버튼/joystick) 최종 채우기
- [x] Baseline A/B 본실험 시작

## 다음 액션

1. `split_summary_v1.md` 4, 5번 항목(버튼 positive, joystick 통계) 채우기
2. split PASS 최종 확정
3. Baseline A/B 3-seed 실행 시작
