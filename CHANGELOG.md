# Changelog

본 프로젝트의 모든 주요 변경사항은 이 문서에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
버전은 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

## [1.1.0] - 2026-05-29

### Added — 신학 코칭

- `sermon-wesley-coaching` — 요한 웨슬리(1703-1791) 신학·설교 코칭 스킬 추가
  - 12가지 핵심 신학: 선행 은혜(prevenient grace)·칭의·성화·완전 성화(entire sanctification)·웨슬리안 사중 기준(Wesleyan Quadrilateral)·사회적 성결(social holiness)·구원의 순서(via salutis)·가톨릭 정신·은혜의 수단·확신의 교리·새 창조·자유 은혜
  - 웨슬리식 설교 8특징 기반 설교문 산출 (은혜의 삼중 구조·경험적 적용·사회적 적용·공동체 실천)
  - 유형 A(신학 개념)/B(설교 산출)/C(설교 평가)/D(타 전통 비교) 4가지 입력 처리
  - 웨슬리안 vs 개혁주의·루터파 교리 비교 객관 제시 (예정론·성화·의지·확신·성찬론)
  - 6가지 웨슬리 곡해 경고, 주요 인용문 8선 수록
  - `references/` 폴더: 한국어 번역본 수록
    - 표준설교집 1-7권 (2종 편집본, 총 14파일)
    - 존 웨슬리 일지 1-2권
    - 웨슬레 사상의 현대적 선언 (304pp)
    - 웨슬레의 신앙과 오늘 (144pp)
  - 감리교·성결교·구세군·나사렛교회·장로교·침례교·복음주의 등 교파 중립 운영

### Changed

- `README.md` — 스킬 수 20 → 21, 신학 코칭 5 → 6, Wesley 항목 추가
- `docs/ARCHITECTURE.md` — 21개 스킬 기준 갱신, Wesley 연대순·트리거·핵심 강조 추가

---

## [1.0.0] - 2026-05-08

### 🎉 첫 공개 배포

20개의 sermon skill을 단일 저장소로 통합하여 첫 공개 배포.

#### Added — 본문 분석 & 원어 (5)
- `sermon-text-analysis-multimethod` — 7+10가지 본문 분석법 통합
- `sermon-bible-dictionary` — 성경 인물·지명·단어 사전
- `sermon-textual-criticism` — 고대 사본 본문비평
- `sermon-multi-bible-version-compare` — 9개 번역본 다층 비교
- `sermon-greek-grammar-machen` — 메이첸 헬라어 문법 33강

#### Added — 신학 코칭 (5)
- `sermon-augustine-coaching` — 어거스틴 신학·설교론
- `sermon-luther-coaching` — 루터 종교개혁 신학
- `sermon-calvin-institutes` — 칼빈 『기독교 강요』
- `sermon-bavinck-coaching` — 바빙크 신칼빈주의
- `sermon-lloyd-jones-coaching` — MLJ Logic on Fire

#### Added — 배경 & 컨텍스트 (3)
- `sermon-history-culture-geo-context` — 성경 시대 배경
- `sermon-christian-history-interpreter` — 기독교적 역사 해석
- `sermon-topic-research-multidisciplinary` — 11분야 학제간 자료

#### Added — 설교문 작성 & 기획 (5)
- `sermon-topic-message-coach` — 6단계 주제·메시지 코칭
- `sermon-emotive-writing-coach` — 설교문 글쓰기 코칭
- `sermon-doctrinal-planner` — 교리설교 4단계 기획안
- `sermon-calvin-style-insight` — 칼빈식 강해 설교
- `sermon-planner-52week` — 52주 연간 설교 계획

#### Added — 큐티 & 검증 (2)
- `sermon-qt-original-text-based` — 원어 기반 큐티
- `sermon-audience-feedback-persona` — 8명 회중 페르소나 피드백

#### Infrastructure
- 자동 설치 스크립트 (`scripts/install.sh`)
- 검증 스크립트 (`scripts/verify.sh`)
- claude.ai 업로드용 ZIP 패키징 (`scripts/package.sh`)
- GitHub Actions: 스킬 frontmatter 자동 검증
- 7가지 사용 시나리오 예시 문서

---

## [Unreleased]

### 계획 중
- 영문(English) README 추가
- 추가 신학 코칭 스킬: 조나단 에드워즈, 스펄전, 본회퍼 *(웨슬리는 v1.1에서 완료)*
- 설교 영상 분석 스킬 (멀티모달)
- VSCode/Cursor 연동 가이드

[1.1.0]: https://github.com/soultech-oh-ux/cys-claude-sermon-skills/releases/tag/v1.1.0
[1.0.0]: https://github.com/soultech-oh-ux/cys-claude-sermon-skills/releases/tag/v1.0.0
