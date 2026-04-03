---
title: "Cloud Vision API로 이미지 분석"
date: 2026-04-03 00:00:00 +0000
categories:
  - "Google Study Jam"
tags:
  - "project"
  - "google-study-jam"
---

[Cloud Vision API로 이미지 분석 | Google Skills](https://www.skills.google/course_templates/633?locale=ko)

# API 탐색기 : Qwik Start

API 탐색기는 각 요청에서 자체 [API 키](https://developers.google.com/console/help/using-keys)를 사용
### 목표

- Cloud Storage 버킷을 만듭니다.
- Cloud Storage에 이미지를 업로드하고 공개 상태로 설정합니다.
- 이 이미지를 사용하여 Vision API에 요청을 수행합니다.

## 작업 1. Cloud Storage 버킷 만들기
- 버킷에 고유한 이름을 지정
- 버킷 네임스페이스는 전역적이며 전체 공개로 표시되기 때문에 버킷 이름에 민감한 정보를 포함하면 안된다.
- `PROJECT ID`-bucket 이런 형식 사용하기

## 작업 2. 이미지 업로드하기
![image-10](/assets/img/posts/2026-04-03-cloud-vision-api/image-10-40237e8b.png)

## 작업 3. Cloud Vision API 서비스에 요청 보내기
[Cloud Vision - API 사용해 보기](https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate?apix=true)
API 탐색기 페이지가 로드된다.
![image-11](/assets/img/posts/2026-04-03-cloud-vision-api/image-11-6b0b3290.png)
Request body에 필요한 것들을 입력하면 오른쪽 패널에 cURL, HTTP, JAVASCRIPT로 API 호출하는 방법이 나옴.
여기서 실행하면 실행 결과가 나옴
```json
{
  "responses": [
    {
      "labelAnnotations": [
        {
          "mid": "/m/0bt9lr",
          "description": "Dog",
          "score": 0.9955614,
          "topicality": 0.5910274
        },
        {
          "mid": "/m/01lrl",
          "description": "Carnivores",
          "score": 0.95821124,
          "topicality": 0.006677204
        },
        {
          "mid": "/m/05mqq3",
          "description": "Snout",
          "score": 0.8904693,
          "topicality": 0.0051104086
        },
        {
          "mid": "/m/0h8ks17",
          "description": "Pet Supply",
          "score": 0.84506834,
          "topicality": 0.0013254747
        },
        {
          "mid": "/m/09141t",
          "description": "Collar",
          "score": 0.83984137,
          "topicality": 0.015019552
        },
        {
          "mid": "/m/07_gml",
          "description": "Working animal",
          "score": 0.8320223,
          "topicality": 0.000209493
        },
        {
          "mid": "/m/01v327",
          "description": "Lawn",
          "score": 0.829867,
          "topicality": 0.006828101
        },
        {
          "mid": "/m/01z5f",
          "description": "Canidae",
          "score": 0.78751886,
          "topicality": 0.010690784
        },
        {
          "mid": "/m/05q778",
          "description": "Dog collar",
          "score": 0.78325343,
          "topicality": 0.008057055
        },
        {
          "mid": "/m/0h8nm96",
          "description": "Dog Supply",
          "score": 0.73061556,
          "topicality": 0.0014571295
        }
      ]
    }
  ]
}

```


# Cloud ML API를 사용한 이미지의 텍스트 추출, 분석, 번역
## 목표

이 실습에서 학습할 내용은 다음과 같습니다.

- Vision API 요청 만들기 및 curl로 API 호출하기
- Vision API의 텍스트 감지(OCR) 메서드 사용하기
- Translation API를 사용하여 이미지에서 텍스트 번역하기
- Natural Language API를 사용하여 텍스트 분석하기

## 작업 1. API 키 만들기
1. API 키를 만들려면 **탐색 메뉴** > **API 및 서비스** > **사용자 인증 정보**로 이동합니다.
2. **+ 사용자 인증 정보 만들기**를 클릭합니다.
3. 드롭다운 메뉴에서 **API 키**를 선택합니다.
4. 방금 생성한 키를 복사한 후 **닫기**를 클릭합니다.
5. 이제 요청마다 API 키의 값을 삽입하지 않아도 되도록 API 키를 환경 변수로 저장합니다.
`export API_KEY=<YOUR_API_KEY>`
6. Cloud Shell에서 다음을 실행합니다. 이때 `<your_api_key>`를 방금 복사한 키로 대체합니다.
## 작업 2. Cloud Storage 버킷에 이미지 업로드하기
API 탐색기와 동일한 작업 진행
## 작업 3. Cloud Vision API 요청 만들기
cloud shell 환경에서 `ocr-request.json` 파일을 만들고
```json
{
  "requests": [
      {
        "image": {
          "source": {
              "gcsImageUri": "gs://my-bucket-name/sign.jpg"
          }
        },
        "features": [
          {
            "type": "TEXT_DETECTION",
            "maxResults": 10
          }
        ]
      }
  ]
}
```
`my-bucket-name` 부분 수정하기


## 작업 4. 텍스트 감지 메서드 호출하기
Cloud shell에서 curl을 사용하여 Cloud Vision API를 호출
```bash
curl -s -X POST -H "Content-Type: application/json" --data-binary @ocr-request.json  https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}
```

프랑스어가 나오는데 번역을 위해 응답을 저장해두기
```bash
curl -s -X POST -H "Content-Type: application/json" --data-binary @ocr-request.json  https://vision.googleapis.com/v1/images:annotate?key=${API_KEY} -o ocr-response.json
```


## 작업 5. 이미지의 텍스트를 Translation API로 전송하기
`translation-request.json` 파일 만들기
```json
{
  "q": "your_text_here",
  "target": "en"
}
```


```bash
STR=$(jq .responses[0].textAnnotations[0].description ocr-response.json) && STR="${STR//\"}" && sed -i "s|your_text_here|$STR|g" translation-request.json
```
아까 저장해둔 `ocr-response.json`을 사용해서 `your_text_here`에 넣는 명령어


```bash
curl -s -X POST -H "Content-Type: application/json" --data-binary @translation-request.json https://translation.googleapis.com/language/translate/v2?key=${API_KEY} -o translation-response.json
```
`translation-request.json`을 사용해 API 호출하기

```bash
cat translation-response.json
```

결과 확인하기


## 작업 6. Natural Language API를 사용하여 이미지의 텍스트 분석하기
Natural Language API로 항목을 추출하고, 감정과 구문을 분석하고, 텍스트를 카테고리로 분류할 수 있어 텍스트를 이해하는 데 도움이 된다.
`nl-request.json` 파일 만들기

```json
{
  "document":{
    "type":"PLAIN_TEXT",
    "content":"your_text_here"
  },
  "encodingType":"UTF8"
}
```

- **type:** 지원되는 유형(type)의 값은 `PLAIN_TEXT` 또는 `HTML`입니다.
    
- **content:** Natural Language API에 전송하여 분석하려는 텍스트를 전달합니다. 또한 Natural Language API는 Cloud Storage에 저장된 파일을 전송하여 텍스트 처리를 할 수 있도록 지원합니다. Cloud Storage에서 파일을 전송하려면 `content`를 `gcsContentUri`로 대체하고 Cloud Storage의 텍스트 파일의 URI 값을 사용해야 합니다.
    
- **encodingType:** API에 텍스트를 처리할 때 사용할 텍스트 인코딩 유형을 알려줍니다. API는 이를 사용하여 특정 항목이 텍스트의 어느 위치에 포함되는지 계산합니다.

```bash
STR=$(jq .data.translations[0].translatedText  translation-response.json) && STR="${STR//\"}" && sed -i "s|your_text_here|$STR|g" nl-request.json
```
번역된 텍스트 content에 넣기

```bash
curl "https://language.googleapis.com/v1/documents:analyzeEntities?key=${API_KEY}" \
  -s -X POST -H "Content-Type: application/json" --data-binary @nl-request.json
```
