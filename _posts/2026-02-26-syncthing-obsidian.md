---
title: "Syncthing으로 Obsidian 실시간 동기화 설정"
date: 2026-02-26 00:00:00 +0000
categories:
  - "note"
tags:
  - "obsidian"
  - "syncthing"
  - "nas"
  - "sync"
---

# Syncthing으로 Obsidian 실시간 동기화 설정

## 목적

obsidian-git의 자동 push 타이밍 한계를 극복하기 위해 Syncthing을 사용해 로컬 볼트와 NAS를 실시간 동기화.

## 구조

```
PC (C:\Users\dltrn\Github\obsidian-vault)
        ↕ Syncthing 실시간 sync
NAS (/data/Leesoohwan/obsidian-vault)
        ↕ obsidian-git (GitHub 백업 겸 다른 기기 동기화)
GitHub (dltnghks/obsidian-vault)
```

## NAS 환경

- OS: Ubuntu (OpenMediaVault 7.7.1 Sandworm)
- IP: 192.168.1.4

---

## 설치 과정

### 1. NAS에 Syncthing 설치 (SSH)

```bash
apt install syncthing -y
systemctl enable syncthing@root --now
```

### 2. 외부 접속 허용

기본값은 localhost만 허용하므로 config 수정 필요:

```bash
systemctl stop syncthing@root
sed -i 's/127.0.0.1:8384/0.0.0.0:8384/' /root/.config/syncthing/config.xml
systemctl start syncthing@root
```

NAS Syncthing Web UI: `http://192.168.1.4:8384`

### 3. 동기화용 폴더 생성

기존 `999.노트` 폴더 대신 새 폴더를 사용 (충돌 방지):

```bash
mkdir -p /data/Leesoohwan/obsidian-vault
```

### 4. PC에 Syncthing 설치

[syncthing.net](https://syncthing.net/downloads) 에서 Windows용 다운로드 후 설치.

PC Syncthing Web UI: `http://127.0.0.1:8384`

### 5. 기기 페어링

1. PC Syncthing UI → **Actions → Show ID** → Device ID 복사
2. NAS Syncthing UI → **Add Remote Device** → PC의 Device ID 입력 → 저장
3. PC Syncthing에서 연결 요청 수락

### 6. 폴더 연결

**NAS Syncthing UI:**
1. **Add Folder**
2. Folder Path: `/data/Leesoohwan/obsidian-vault`
3. Sharing 탭 → PC 디바이스 선택
4. 저장

**PC Syncthing:**
- 폴더 수락 알림 → 경로를 `C:\Users\dltrn\Github\obsidian-vault`로 지정

---

## 동작 방식

- Syncthing은 **양방향 동기화** (원본/복사본 구분 없음)
- 가장 최근에 수정된 파일이 양쪽에 반영됨
- 파일 저장 즉시 NAS로 동기화

## 주의사항

- 처음 sync 시 PC → NAS 방향으로 파일이 복사됨 (PC가 최신 상태이므로)
- 기존 NAS의 `999.노트` 폴더는 그대로 보존 (건드리지 않음)
- obsidian-git은 그대로 유지 → GitHub 백업 및 다른 기기 clone 용도로 사용
