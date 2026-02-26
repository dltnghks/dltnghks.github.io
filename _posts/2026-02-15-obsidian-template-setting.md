---
title: "Obsidian Template Setting"
date: 2026-02-15 13:44:00 +0000
categories:
  - "Obsidian"
tags:
  - "area"
  - "obsidian"
---

# Obsidian Template Setting

## 1) 현재 적용된 자동 템플릿 구조

- 템플릿 엔진: `Templater`
- 템플릿 폴더: `99.template`
- 자동 적용 파일: `99.template/Auto - Dynamic.md`
- 적용 방식: 새 파일 생성 시 모든 경로(`regex: .*`)에 자동 실행

설정 파일:
- `.obsidian/plugins/templater-obsidian/data.json`

핵심 설정값:
- `trigger_on_file_creation: true`
- `enable_file_templates: true`
- `file_templates: [{ "regex": ".*", "template": "99.template/Auto - Dynamic.md" }]`
- `enable_folder_templates: false`

## 2) 새 노트 생성 시 자동 입력되는 frontmatter

현재 템플릿(`Auto - Dynamic.md`)이 자동으로 아래 필드를 넣음.

- `created`
- `type`
- `category`
- `tags`
- `publish: false`

형식:

```yaml
---
created: YYYY-MM-DD HH:mm
type: <top-level 기반>
category: <규칙 기반>
tags:
  - <type>
  - <2뎁스 slug(조건부)>
publish: false
---
```

## 3) type / category / tags 계산 규칙

### type (1뎁스 기준)
- `00.Inbox` -> `inbox`
- `01.Project` -> `project`
- `02.Area` -> `area`
- `03.Resource` -> `resource`
- `04.Archive` -> `archive`
- 기타 -> `note`

### category (2뎁스 우선)
- `01.Project`, `02.Area`, `03.Resource`는 2뎁스 폴더명을 category로 사용
- 예: `02.Area/Obsidian/...` -> `category: Obsidian`
- 예: `01.Project/02.Baekjoon/...` -> `category: Baekjoon`
- 그 외는 `category = type`

### tags
- 기본으로 `type` 태그 1개 추가
- `01.Project`, `02.Area`, `03.Resource`인 경우 2뎁스 폴더명을 slug로 정규화해서 추가
- 예: `Claude Code` -> `claude-code`

## 4) 기존 노트 일괄 반영(backfill)

스크립트:
- `01.Project/03.AutomatedBlogSystem/scripts/backfill_note_metadata.ps1`

동작:
- 기존 Markdown 노트 frontmatter에 `type/category/tags/publish` 보강
- `category`는 위 2뎁스 규칙으로 계산

실행:

```powershell
# Dry-run
powershell -ExecutionPolicy Bypass -File .\scripts\backfill_note_metadata.ps1

# Apply
powershell -ExecutionPolicy Bypass -File .\scripts\backfill_note_metadata.ps1 -Apply
```

## 5) Notion 발행 연동과의 연결

발행 스크립트:
- `01.Project/03.AutomatedBlogSystem/scripts/publish.ps1`
- 내부 호출: `sync_to_notion.py`

현재 동작:
- `publish: true` 노트만 발행
- 성공 시 노트에 `publish: synced`, `notion_page_id` 기록
- Notion DB에 `category/tags` 속성이 없으면 자동 생성
  - `category` -> `select`
  - `tags` -> `multi_select`
- 노트의 `category/tags` 값을 Notion 속성으로 매핑
- `category` 기반 대표 cover 이미지 설정
  - frontmatter에 `cover_image` URL이 있으면 해당 값 우선

## 6) .env 기반 실행

`publish.ps1`는 기본적으로 볼트 루트의 `.env`를 자동 로드함.

기본 위치:
- `Z:\999.노트\.env`

예시:

```env
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=***
```

실행:

```powershell
# Dry-run
powershell -ExecutionPolicy Bypass -File .\scripts\publish.ps1 -DryRun

# Real publish
powershell -ExecutionPolicy Bypass -File .\scripts\publish.ps1
```

## 7) 운영 체크리스트

- Obsidian에서 설정 반영이 안 보이면 `Reload app`
- 새 노트 생성 후 frontmatter 자동 삽입 확인
- 발행 전 `publish: true` 확인
- 발행 후 `publish: synced` / `notion_page_id` 기록 확인

