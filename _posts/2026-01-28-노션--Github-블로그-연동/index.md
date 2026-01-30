---
layout: post
title: "노션 → Github 블로그 연동"
date: 2026-01-28 00:00:00 +0900
categories: [블로그 자동화]
tags: [Blog, Git, Notion]
---


![image](./images/a9dd032b602f707197a4e9281ca30096.png)


> 💡 **Notion 데이터베이스에서 페이지 생성한 후 글을 작성하면 깃허브 블로그에 자동으로 업로드되는 시스템을 만드는 것이 목표.**


요구 사항

1. 작성 일자 표기
2. 태그 표기
3. 카테고리 표기
4. 노션 페이지 생성 시 템플릿 선택 기능

### ISSUE


제목, 태그, 카테고리는 글에 적용되어서 업로드 완료. 


**1. 본문 내용이 Undefine으로 뜨는 문제가 발생.**


[link_preview](https://github.com/cotes2020/jekyll-theme-chirpy/blob/master/_posts/2019-08-08-text-and-typography.md)


여기 나와있는 형식대로 맞춰서 작성.


![image](./images/85efe204c009065fd2bc46e9801307b6.png)


성공!


**1.1 이미지는 안나오는 문제**


![image](./images/33db2811c3c0c53d8063614406e40d22.png)


⇒ 이것도 자동화해야 됨.


**2.notion sync action이 주기적으로 동작하는지 확인하기.**


잘 됨. 이후 재배포 확인


```c++
workflow_run:
    workflows: ["Notion Sync"]
    types:
      - completed

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

@@ -24,6 +29,7 @@ concurrency:

jobs:
  build:
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch' || (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success')
    runs-on: ubuntu-latest

    steps:
```


**3.TAB에 나오는 아이콘 변경?**


![image](./images/22adceb99ac3a1317137944999f5a3d6.png)

