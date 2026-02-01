---
layout: post
title: "Gemini CLI Sub-agents"
date: 2026-01-30 00:00:00 +0900
categories: [GEMINI]
tags: [AI]
---


![image](/assets/img/posts/2026-01-30-Gemini-CLI-Sub-agents/2f879c50dd2ccffda0ffe83f52ed423d.png)


[https://geminicli.com/docs/core/subagents/](https://geminicli.com/docs/core/subagents/)


### What are sub-agents


서브에이전트는 특수한 에이전트로 메인 Gemini CLI session 안에서 동작한다.


메인 에이전트의 컨텍스트와 툴셋에서 벗어나 코드 분석, 문서 보기, 도메인 특화 작업 등 특수하고 복잡한 태스크를 다룬다.


아직은 실험 기능이다.


**Warning:** Sub-agents currently operate in [“YOLO mode”](https://geminicli.com/docs/get-started/configuration#command-line-arguments), meaning they may execute tools without individual user confirmation for each step. Proceed with caution when defining agents with powerful tools like `run_shell_command` or `write_file`.

쉘 커맨드와 파일 쓰기와 같은  도구를 사용하는 에이전트를 정의할 때는 주의가 필요하다.


---


### Creating Custom Sub-agents


커스텀 에이전트는 YAML 프론트매터가 포함된 마크다운 파일()로 정의됩니다. 너 다음과 같은 곳에 배치할 수 있습니다

1. **프로젝트 수준:** (팀과 공유됨)`.gemini/agents/*.md`
2. **사용자 수준:** (개인 에이전트)`~/.gemini/agents/*.md`

파일은 **반드**시 YAML 전면부로 시작해야 하며, 세 겹의 대시로 감싸야 합니다. 마크다운 파일의 본문은 에이전트의 **시스템 프롬프트**가 됩니다.`---`


**예시:** **`.gemini/agents/security-auditor.md`**


```yaml
---
name: security-auditor
description: Specialized in finding security vulnerabilities in code.
kind: local
tools:
  - read_file
  - search_file_content
model: gemini-2.5-pro
temperature: 0.2
max_turns: 10
---

You are a ruthless Security Auditor. Your job is to analyze code for potential
vulnerabilities.

Focus on:

1. SQL Injection
2. XSS (Cross-Site Scripting)
3. Hardcoded credentials
4. Unsafe file operations

When you find a vulnerability, explain it clearly and suggest a fix. Do not fix
it yourself; just report it.
```


# **구성 스키마**


| **필드**         | **유형** | **필수** | **설명**                                                                            |
| -------------- | ------ | ------ | --------------------------------------------------------------------------------- |
| `name`         | 스트링    | 네      | 에이전트의 도구명으로 사용되는 고유 식별자(슬러그). 소문자, 숫자, 하이픈, 밑줄만 사용할 수 있습니다.                       |
| `description`  | 스트링    | 네      | 에이전트가 하는 일에 대한 간단한 설명. 이 기능은 메인 에이전트가 언제 이 하위 에이전트를 호출할지 결정하는 데 도움이 되도록 볼 수 있습니다. |
| `kind`         | 스트링    | 아니요    | `local` (기본값) 또는 .`remote`                                                        |
| `tools`        | 배열     | 아니요    | 이 에이전트가 사용할 수 있는 도구 이름 목록. 만약 생략하면 기본 집합에 접근할 수 있을 수 있습니다.                        |
| `model`        | 스트링    | 아니요    | 사용할 특정 모델(예: ). 기본 설정은 (메인 세션 모델 사용).`gemini-2.5-proinherit`                      |
| `temperature`  | 번호     | 아니요    | 모델 온도 (0.0 - 2.0).                                                                |
| `max_turns`    | 번호     | 아니요    | 이 에이전트는 돌아오기 전에 허용되는 최대 대화 턴 수가 있습니다.                                             |
| `timeout_mins` | 번호     | 아니요    | 최대 실행 시간은 몇 분 이내입니다.                                                              |


### 서브 에이전트 최적화


메인 에이전트는 서브 에이전트의 설명(Description)을 보고 업무 배정 여부를 결정한다.


따라서 설명문은 단순한 문장보다는 아래 구조를 갖추는 것이 좋다.

1. 전문 분야 명시

    이 에이전트가 ‘무엇을’ 가장 잘하는지 정의


    ex) “데이터 시각화 전문가”, “Python 코드 디버깅 전문가”

2. 사용 시점 정의

    메인 에이전트가 어떤 상황에서 이 친구를 호출해야 할지 기준을 정해준다.


    ex) 사용자가 로컬 또는 원격 저장소 관련 작업을 요청할 때

3. 구체적인 예시 시나리오

    추상적인 설명보다 구체적인 작업 목록을 나열하면 매칭 성공률이 상승한다.


    ex) 커밋 생성, bisect를 이용한 버그 추적, Github 이슈 관리 등.

> Git expert agent which should be used for all local and remote git operations. For example:
> - Making commits
> - Searching for regressions with bisect
> - Interacting with source control and issues providers such as GitHub.
>

서브 에이전트를 호출하지 않았을 때, 추론하지말고 모델에 직접 물어봐라.

