---
title: "Codex CLI MCP 설정 방법"
date: 2026-02-14 00:00:00 +0000
categories:
  - "ChatGPT"
tags:
  - "area"
  - "chatgpt"
---

# Codex CLI MCP 설정 방법

## 1. 핵심
- Codex CLI의 MCP 설정은 `config.toml`에 저장된다.
- 기본 전역 경로: `~/.codex/config.toml`
- 프로젝트 범위 경로: `.codex/config.toml` (trusted project에서 사용)
- CLI와 IDE 확장은 동일 설정을 공유한다.

## 2. 사전 준비
- `codex` 설치/로그인 완료
- STDIO 서버면 실행 런타임(Node.js/Python) 준비
- HTTP 서버면 URL/토큰 준비

## 3. 가장 빠른 설정 (CLI)
1. MCP 서버 추가
```bash
codex mcp add <server-name> -- <stdio-server-command>
```
2. 환경변수 포함 추가
```bash
codex mcp add <server-name> --env KEY1=VALUE1 --env KEY2=VALUE2 -- <stdio-server-command>
```
3. 등록 확인
```bash
codex mcp list
```
4. Codex TUI에서 확인
- `codex` 실행 후 `/mcp`

## 4. OpenAI Docs MCP 바로 붙이기 (HTTP)
```bash
codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp
codex mcp list
```

## 5. 수동 설정 (config.toml)
필요할 때 `~/.codex/config.toml` 또는 `.codex/config.toml`에 직접 작성한다.

### 5-1. STDIO 서버 예시
```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.context7.env]
MY_ENV_VAR = "MY_ENV_VALUE"
```

### 5-2. HTTP 서버 예시
```toml
[mcp_servers.openaiDeveloperDocs]
url = "https://developers.openai.com/mcp"
```

### 5-3. 인증 헤더/토큰 예시
```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
bearer_token_env_var = "FIGMA_OAUTH_TOKEN"
http_headers = { "X-Figma-Region" = "us-east-1" }
```

## 6. 자주 쓰는 옵션
- `startup_timeout_sec`: 서버 시작 타임아웃(기본 10초)
- `tool_timeout_sec`: 툴 실행 타임아웃(기본 60초)
- `enabled`: `false`면 비활성(삭제 없이 유지)
- `required`: `true`면 초기화 실패 시 Codex 시작 실패
- `enabled_tools`: 허용할 툴 목록
- `disabled_tools`: 차단할 툴 목록 (`enabled_tools` 이후 적용)

예시:
```toml
[mcp_servers.chrome_devtools]
url = "http://localhost:3000/mcp"
enabled_tools = ["open", "screenshot"]
disabled_tools = ["screenshot"]
startup_timeout_sec = 20
tool_timeout_sec = 45
enabled = true
```

## 7. OAuth 서버 연결
- OAuth 지원 서버는 아래로 로그인한다.
```bash
codex mcp login <server-name>
```
- 고정 콜백 포트가 필요하면 top-level 설정 사용:
```toml
mcp_oauth_callback_port = 3456
```

## 8. 문제 해결 체크리스트
- `codex mcp list`에 서버가 보이는지 확인
- STDIO 서버 명령을 단독 실행해 즉시 종료/오류 여부 확인
- `env` 키 이름/토큰 값 오타 확인
- 타임아웃이면 `startup_timeout_sec`, `tool_timeout_sec` 증가
- 상세 명령은 `codex mcp --help`로 확인

## 9. Windows 경로 메모
- 전역: `C:\Users\<사용자명>\.codex\config.toml`
- 현재 프로젝트 로컬: `<프로젝트 루트>\.codex\config.toml`


