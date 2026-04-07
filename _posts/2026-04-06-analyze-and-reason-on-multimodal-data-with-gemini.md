---
title: "Analyze and Reason on Multimodal Data with Gemini"
date: 2026-04-06 00:00:00 +0000
categories:
  - "Google Study Jam"
tags:
  - "project"
  - "google-study-jam"
---

# Introduction to Gemini 3

### **1. Gemini 3 모델 개요**

Gemini 3는 구글의 최신 플래그십 모델 제품군으로, 특히 다음과 같은 능력이 강화되었습니다:

- **고도화된 추론 및 복잡한 지시 수행:** 복잡한 명령어를 이해하고 논리적으로 문제를 해결하는 능력이 뛰어납니다.
    
- **에이전트 운영 및 코드 실행:** 자율적으로 코드를 실행하거나 특정 작업을 수행하는 에이전트 기능에 최적화되어 있습니다.
    
- **멀티모달 이해:** 텍스트, 이미지, 오디오, 비디오 등 다양한 형태의 데이터를 긴 문맥(Long Context) 속에서 동시에 이해합니다.
    
- **주요 모델:** 복잡한 추론을 위한 **Gemini 3.1 Pro**와 속도 및 효율성을 강조한 **Gemini 3 Flash** 모델이 있습니다.
    

---

### **2. 핵심 API 기능 및 파라미터**

- **시스템 지침 (System Instructions):** 모델의 역할이나 임무를 미리 설정하여 답변의 톤과 매너를 고정할 수 있습니다 (예: "당신은 유능한 번역가입니다").
    
- **사고 수준 제어 (Thinking Level):** 응답의 품질과 비용/지연 시간 사이의 균형을 조절합니다.
    
    - **Minimal:** Flash 전용으로, 지연 시간을 최소화해야 하는 단순 작업에 적합합니다.
        
    - **Low/Medium:** 간단한 채팅이나 중간 정도의 복잡한 작업에 쓰입니다.
        
    - **High:** 가장 깊은 추론을 수행하며, 첫 토큰 생성까지 시간이 걸리지만 결과물이 가장 정교합니다.
        
- **사고 과정 요약 (Thought Summaries):** 모델이 답변을 도출하기 위해 거친 내부 추론 과정을 요약해서 보여주는 기능입니다 (`include_thoughts` 설정).
    
- **콘텐츠 스트리밍:** 긴 답변을 기다리지 않고 생성되는 대로 즉시 출력하여 사용자 경험을 개선합니다.
    

---
### **3. 멀티모달 데이터 처리**

- **네이티브 멀티모달 비전:** Gemini 3.1 Pro는 100만 토큰의 컨텍스트 윈도우 내에서 이미지를 고차원 입력값으로 처리합니다.
    
- **시공간 추론 (Visual-spatial Reasoning):** 복잡한 도표, 설계도, UI 목업(Mockup) 내 구성 요소 간의 위치 관계와 상관관계를 논리적으로 분석할 수 있습니다.
    
- **데이터 입력 방식:** Google Cloud Storage의 URI를 사용하거나, 로컬 파일을 바이트 데이터로 읽어 전송할 수 있습니다.
    

---

### **4. 책임감 있는 AI와 안전 기능**

- **안전 필터 (Safety Filters):** 괴롭힘(Harassment), 증오 발언(Hate speech), 성적 노출(Sexually explicit), 위험한 콘텐츠(Dangerous) 등의 카테고리를 설정하여 유해한 답변을 차단합니다.
    
- **탈옥 차단 (Jailbreak Protection):** Gemini 3에 새롭게 추가된 카테고리로, 모델의 안전 훈련이나 지침을 무시하도록 유도하는 시도를 감지하고 차단합니다.
    

### **5. 개발자 팁**

- **Temperature 설정:** 이전 모델들과 달리, Gemini 3는 추론 능력이 최적화된 **기본값 1.0**을 유지하는 것이 강력히 권장됩니다.
    
- **비동기 요청 (Asynchronous Requests):** 대량의 프롬프트를 병렬로 처리하여 전체 실행 시간을 단축할 수 있습니다

### 코드 예시

```python
from pydantic import BaseModel
from google import genai
from google.ai.generativelanguage_v1beta import types

# 1. 출력받고 싶은 데이터 구조 정의 (Pydantic 모델)
class AnalysisResult(BaseModel):
    customer_name: str
    is_vip: bool
    recommended_product: str
    explanation: str

client = genai.Client(api_key="YOUR_API_KEY")

# 2. 모델 호출 (Response Mime Type 및 Schema 설정)
response = client.models.generate_content(
    model="gemini-3.1-pro",
    config=types.GenerateContentConfig(
        # 응답 형식을 JSON(객체)으로 강제함
        response_mime_type="application/json",
        response_schema=AnalysisResult,
        
        # 시스템 지침 및 다른 도구들 (Function Call, Code Execution 등)
        system_instruction="고객 데이터를 분석하여 정해진 JSON 형식으로만 답변하세요.",
        tools=[types.Tool(code_execution={})], 
        temperature=1.0
    ),
    contents="고객 'C-123'은 지난달 500만원을 지출했습니다. VIP 여부를 판단하고 상품을 추천해줘."
)

# 3. 결과 확인
# response.parsed를 통해 JSON이 아닌 파이썬 객체로 바로 접근 가능합니다.
result = response.parsed
print(f"고객명: {result.customer_name}")
print(f"VIP 여부: {result.is_vip}")
print(f"추천 상품: {result.recommended_product}")
print(f"이유: {result.explanation}")
```