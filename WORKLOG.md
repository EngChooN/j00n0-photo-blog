# j00n0__ Photo Journal — 작업 일지

> 프로젝트의 진행 과정을 시간순으로 기록한 일지. 각 항목은 요청/배경 · 검토 · 결정 · 결과 흐름으로 정리.
> 포트폴리오·이력서 첨부 자료로 활용 가능.

---

## 2026-04-26 (토) — 프로젝트 시작과 풀 클라이언트 1차 빌드

### 프로젝트 시작 — 미니멀 매거진 사진 블로그

**요청 / 배경**: Next.js 기반의 개인 사진 매거진 사이트 구축. 핵심 페이지 4개(홈 그리드, 로그인, 사진 업로드, 방명록) 정의. 일반 방문자가 로그인 페이지에 도달하지 못하도록 어떤 메뉴에서도 노출하지 않고 `/login` URL 직접 입력으로만 진입. 사진 업로드는 관리자 권한일 때만 헤더에 노출되는 히든 메뉴.

**디자인 방향**: 미니멀 매거진 스타일 — 모노크롬, hairline 보더, 넉넉한 여백, 세리프 디스플레이 + 산세리프 본문 조합.

**결과**: 빈 디렉토리에서 Next.js 16 + Tailwind 셋업 착수.

### 스택과 컴포넌트 패턴 확정

**요청 / 배경**: 프론트엔드 컨벤션을 사용자가 직접 지정.

**결정**:
- 클라이언트 상태 — Zustand
- 서버 상태 — TanStack Query (Firebase 연동 가능성을 후속 옵션으로 염두)
- 스타일 — Tailwind
- 컴포넌트 패턴 — Atomic Design + Container/Presenter
- **Standing rule**: 신규 라이브러리·패턴 도입 전에는 반드시 사용자 승인 후 진행. 이후 모든 의사결정에 적용.

### 백엔드 연동 시점 — 클라이언트 목업으로 시작

**검토**:
- (a) 처음부터 Firebase (Auth/Firestore/Storage) 셋업
- (b) 인터페이스만 잡고 mock 구현
- (c) 단순 mock — 추후 교체

**결정**: (c) 단순 mock. 클라이언트 전용으로 동작하는 형태를 빠르게 확보한 후 실제 백엔드는 별도 의사결정으로 미룸.

### 이미지 저장 방식 — base64 + localStorage

**검토 (localStorage 5–10MB 제한 고려)**:
- (a) base64 직접 저장 (소수 사진만 가능)
- (b) IndexedDB (`idb-keyval`)
- (c) 외부 URL만 입력

**결정**: (a). 목업 단계라 동작 확인이 우선이므로 가장 간단한 경로 채택. 4MB 이하 제한 추가.

### 폼·라우트 보호·자격증명 위치 일괄 결정

**결정**:
- 폼 유효성 — react-hook-form + zod
- 라우트 가드 — Zustand `isAdmin` 상태로 클라이언트에서 `/login` 리다이렉트
- 자격증명 — `.env.local`의 `NEXT_PUBLIC_ADMIN_*`에 보관

### 1차 빌드 완료

**결과**:
- `app/` 4페이지 + `components/`(atoms/molecules/organisms/templates) + `hooks/`(queries/mutations) + `lib/` + `stores/` 구조 완성
- Next.js 15로 시작했으나 보안 패치로 16으로 자동 업그레이드
- 빌드·dev 서버 정상 동작 확인

### 브랜드 표기 변경

**요청**: 브랜드명을 `J00N0` → `j00n0__`로 통일.

**결과**: Logo, footer, metadata 등 5개 위치 일괄 갱신.

### 관리자 자격증명 지정

**결과**: 단일 관리자 계정. 자격증명은 `.env`에만 보관, 코드 어디에도 평문 노출 금지하는 원칙 명시.

### Instagram 링크 추가

**요청 / 배경**: 홈 화면과 푸터에 인스타그램 프로필 링크. 새 탭에서 열려야 함.

**결과**: `InstagramLink` 아톰 신설. 홈 헤딩 아래와 푸터에 배치.

### RSS 알림 검토 — 보류

**검토**: 글 발행 시 구독자에게 알림이 가는 방식이 가능한지 문의. RSS는 풀(pull) 방식이므로 푸시 알림이 아니며, 데이터가 클라이언트 localStorage에 갇혀 있어 서버 RSS 엔드포인트를 만들 데이터 자체가 없음.

**보류 사유**: 백엔드 도입 후 다시 검토. 현재는 인스타그램 링크만으로 외부 노출.

### 백엔드 도입 결정 — NestJS

**요청 / 배경**: 사진과 글이 영구 저장되어야 하므로 백엔드 도입. 사용자가 프론트엔드 개발자라 TypeScript 친화적인 NestJS를 선택. 1단계는 로컬 운영, 추후 외부 호스팅 배포 목표.

**검토**: HTTPS↔HTTP mixed content 등 외부 노출 시 함정을 미리 짚어둠. 1차에서는 로컬 개발에만 집중.

**결과**: 모노레포 형태로 `client/` `server/` 분리.

### 백엔드 스택 일괄 결정

**결정**:
- DB — SQLite (로컬 운영 한정)
- ORM — Prisma
- 인증 — JWT를 httpOnly 쿠키로 발급 (XSS 노출 방지)
- 사진 — 업로드 용량 제한 없음 + sharp로 자동 회전 보정·리사이즈·WebP 변환
- 포트 — 서버 3001 / 클라이언트 3000
- 관리자 — 단일 계정, 평문 자격증명을 `.env`에만 보관

### NestJS 마이그레이션

**결과**:
- NestJS 10 + Prisma 6 + SQLite + sharp + JWT + class-validator 구성
- API: `/api/auth/login·logout·me`, `/api/photos GET/POST/DELETE`, `/api/guestbook GET/POST/DELETE`
- 정적 사진 서빙: `/uploads/*`
- 클라이언트의 localStorage 호출을 모두 `fetch`로 교체
- 인증 진실의 원천이 서버 쿠키가 되었으므로 Zustand `authStore` 제거 → `useMe` 쿼리로 확인
- 로그인 → 업로드 → 조회 → 삭제 → 로그아웃 e2e 시나리오 통과

### 업로드 페이지 카피 정리

**요청**: 용량 제한이 사라졌으므로 "4MB 이하" 안내 문구 제거.

**결과**: 업로드 페이지 안내를 "업로드된 이미지는 자동으로 최적화되어 저장됩니다"로 변경.

### 업로드 후 홈으로 이동

**요청 / 배경**: 글 작성 직후에도 같은 페이지에 머무르면 결과물 확인이 즉시 안 되어 어색함.

**결과**: 업로드 성공 시 `router.push('/')`로 홈 이동. form reset은 페이지 이동으로 자연스럽게 해결되므로 제거.

### 사진·메타데이터 저장 위치 확인

**결과 (확인 사항)**:
- 사진 binary → `server/uploads/*.webp` (sharp 회전 보정 + 긴 변 2400px 이내 + WebP q82 변환)
- 메타데이터 → `server/prisma/data.db` (SQLite)
- 자격증명 → `server/.env`

### 원본 사진 보존 여부 확인

**검토**: 업로드된 원본은 메모리 버퍼에서만 처리되고 디스크에는 변환된 WebP만 저장. 원본은 GC로 사라짐. 보존이 필요하면 `originals/` `web/` 디렉토리 분리 등 추가 작업 필요.

**결정**: 미보존 유지. 현재 단계에서는 디스크 사용량 절약이 우선.

### 라이트박스(전체화면 사진 뷰어) 추가

**요청 / 배경**: 홈 그리드의 사진을 클릭했을 때 전체화면으로 확대해 볼 수 있는 UI. 매거진 톤을 유지하면서 사진 자체에 집중할 수 있는 경험 제공이 목적.

**결정**: 클라이언트 UI 상태이므로 프로젝트 컨벤션상 Zustand로 관리. Container/Presenter 패턴 준수. 루트 레이아웃에 마운트하여 어느 페이지에서든 즉시 작동.

**결과**: `stores/lightboxStore.ts` 추가. `components/organisms/Lightbox/`에 Container·Presenter 구현. 클릭으로 풀스크린 진입, ESC/배경 클릭/Close 버튼/키보드 좌우 화살표로 닫기 및 네비게이션, 본문 스크롤 잠금.

### 카드 일련번호 표기 변경

**요청 / 배경**: 카드 상단의 `№ 01` 표기가 어색하다는 피드백.

**검토 옵션**: 제거 / 숫자만 / "No. 01" / "Issue 01".

**결정**: "No. 01" 형식. 라이트박스의 카운터도 "No. 01 / 03"으로 통일.

### 라이트박스 배경 변경

**요청 / 배경**: 기존 배경(`bg-paper/98 backdrop-blur-sm`)이 사진 자체에 집중을 흩트림. 사진을 강조하기 위해 어두운 배경이 적합.

**결과**: 배경 `bg-black text-white/90`로 교체. 텍스트·보더·화살표 등 부속 요소도 다크 톤에 맞춰 흰색 계열로 일괄 조정.

### 에이전트 시스템 기획 — 가상 팀 구성

**요청 / 배경**: 사용자를 사장으로, Claude 서브에이전트를 직원으로 보는 가상 팀 운영 모델 도입.

**검토**:
- 직군 — 기획자, 디자이너, 프론트엔드/백엔드 개발자, 코드 리뷰어, QA. 프론트엔드와 백엔드는 성향이 대립되는 두 명을 배치하여 토론 구도 형성. 데브옵스는 제외.
- 범위 — 사용자 전역(`~/.claude/agents/`)
- 자동화 — `/feature` 슬래시 명령으로 워크플로우화. PM이 분류해 필요한 직군만 호출하는 라우팅 방식

**결정**: 8명 채용 — `pm`, `designer`, `frontend-reader`, `frontend-optimizer`, `backend-reader`, `backend-optimizer`, `code-reviewer`, `qa`. 토론 구도는 가독성 우선 vs 성능·체감 품질 우선.

### 에이전트 모델 선정

**검토**: WebSearch로 Anthropic 가이드 확인. Opus 4.7은 advisor성 깊은 추론, Sonnet 4.6은 코딩 워크호스(Opus의 약 99% 코딩 성능을 40% 비용에), Haiku 4.5는 분류·라우팅·단순 실행에 강점. 균형/고품질/절약 3가지 옵션 제시.

**결정**: 균형 옵션 — `pm`·`qa`는 Haiku 4.5, 디자이너 + 4명 개발자는 Sonnet 4.6, `code-reviewer`는 advisor 전략으로 Opus 4.7.

**결과**: 8개 에이전트 파일 frontmatter에 `model:` 한 줄씩 추가.

### `/feature` 첫 시도 — 세션 로딩 한계 발견

**요청**: `/feature 로그인 페이지 아이디 저장 + 자동 로그인` 호출.

**결과**: 새로 생성한 에이전트들이 같은 세션에서는 활성화되지 않음을 확인. Claude Code는 세션 시작 시점에만 `~/.claude/agents/`를 스캔. 다음 세션 시작 후 다시 시도하기로 보류.

---

## 2026-04-28 ~ 2026-04-29 — 멀티 사진·캐러셀·배포·인터랙션 (대규모 세션)

### 한 번에 4가지 — Post 모델 도입 + 캐러셀

**요청**: 4가지 묶음 — (1) 로그인 후 글 작성이 아닌 홈 이동, (2) 글 수정 기능 부재 해결, (3) 한 글에 사진 여러 장 게시, (4) 다중 사진은 캐러셀 형태로 표시(라이브러리는 디자이너 권장에 따름).

**결정 포인트 4가지**:
- 글 수정 시 사진도 변경 가능: 가능
- 데이터 모델: `Post` 신설 + `Photo` N:1
- 업로드 UX: 단일 폼에서 다중 파일 선택 + 공통 메타데이터
- 캐러셀 라이브러리: Embla

**결과**: `Post` 모델 신설 마이그레이션 진행. 기존 단일 `Photo` 데이터는 1-사진 `Post`로 백필.

### 캐러셀 톤 분리 — 카드는 라이트, 라이트박스는 다크

**검토 (디자이너 자문)**:
- 카드 캐러셀은 사이트 일관성을 위해 라이트 톤 유지
- 라이트박스는 사진 집중을 위해 다크 톤
- 좁은 카드(`col-span ≤ 5`)는 캐러셀 비활성화 → 첫 사진 + 다중 사진 배지만 표시

**결과**: 카드와 라이트박스에 톤 분리 적용.

### 가로 사진 잘림 / 슬라이드 누락 픽셀

**요청 / 배경**: 홈 카드에서 세로 사진은 정상이지만 가로 사진이 잘리는 현상. 슬라이드 전환 시 다음 슬라이드가 1~2px 정도 미세하게 보이는 문제.

**결과**:
- Carousel light variant `imageFit: 'cover'` → `'contain'` 변경. 첫 사진 비율 기준으로 viewport 잠그되 letterbox.
- 슬라이드 폭을 `flex-[0_0_calc(100%+1px)]`로 1px 확장하여 sub-pixel bleed 차단.

### 업로드 폼 미리보기 사용성 개선

**요청 / 배경**: 미리보기 썸네일 영역이 작아 실제 업로드 직전 사진 확인이 어려움. 큰 화면으로 보고 싶다는 요구.

**결과**:
- 썸네일 80×80 → 모바일 128px / 데스크탑 192px로 확대. 삭제 버튼 24→28px.
- 썸네일 클릭 시 풀스크린 미리보기 모달 추가.
- 모달이 폼 컨텍스트에 갇혀 마진이 노출되는 현상은 `createPortal(document.body)`로 컨텍스트 분리하여 해결.

### 업로드 용량 제한 회귀 제거

**요청 / 배경**: 업로드 시 발생한 25MB 제한 에러. 코드 리뷰 단계에서 추가했던 제한이 원래 정책(제한 없음)과 어긋남.

**결과**: 25MB 제한 제거.

### 모바일 반응형 일괄 작업

**요청 / 배경**: PC는 문제 없으나 모바일 대응 미흡.

**검토 (PM이 12개 작업 항목 정리, 4가지 결정 포인트)**:
- 카드 모바일 레이아웃 — 1열 통일
- 헤더 — 햄버거 메뉴
- Edit 페이지 액션 — 세로 스택
- Lightbox 닫기 — Close 버튼만 (백드롭 클릭 비활성)

**결과**: PageShell pt-8, SectionHeading 4xl, 햄버거 풀스크린 페이드, EditForm 액션 풀너비 + Hairline 구분, 탭 영역 44px 보장.

### 인터랙션·애니메이션 도입

**요청 / 배경**: 사이트가 정적이어서 사용자 인터랙션이 부족. 과한 효과는 지양하되 매거진/포트폴리오 톤에 어울리는 수준의 모션이 필요.

**검토**: Cargo, Magnum, 개인 포토그래퍼 사이트 등을 참고하여 매거진 표준에 부합하는 모션 패턴 결정.

**결정**:
- Easing 기본값 `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) — 매거진 표준
- 모달 페이드 250ms / 이미지 crossfade 500ms / hover 200ms
- IntersectionObserver로 카드 노출 시 reveal (translate-y + opacity)
- `prefers-reduced-motion` 글로벌 무력화
- **보류**: 페이지 라우트 전환 모션, 폼 shake, 커스텀 삭제 모달, 로고 스크롤 축소, 스켈레톤

### 무료 티어 배포 — Vercel + Render + Supabase

**요청 / 배경**: 무료 티어로 프론트와 백엔드 모두 배포.

**검토 (스택 제안 + 비용 분석)**:
- 프론트 — Vercel
- 백엔드 — Render Web Service (free)
- DB — Supabase Postgres (free 500MB)
- 파일 — Supabase Storage (free 1GB)
- 단점 명시 — Render free 플랜의 약 50초 콜드 스타트

#### 1단계 — GitHub 셋업
git init, .gitignore 강화(env / DB / uploads / build 제외), `.env.example` 작성, SSH 키 생성, GitHub repo(`EngChooN/j00n0-photo-blog`) 푸시.

#### 2단계 — Supabase
대시보드에서 Data API / Auto-expose / Auto RLS 모두 OFF 처리(Prisma로 직접 접근, 클라이언트는 백엔드 경유). `prisma migrate dev --name init`로 새 Postgres에 빈 테이블 생성. 사용 범위는 DB + Storage만으로 한정.

#### 3단계 — 코드 마이그레이션
- Prisma `sqlite` → `postgresql` + `directUrl` 추가(마이그레이션 전용 직결 커넥션)
- `StorageModule` 신설 — `@supabase/supabase-js` 캡슐화
- `posts.service`의 디스크 I/O를 Storage SDK 호출로 교체
- `ServeStaticModule` 제거 — Storage가 public URL을 직접 서빙
- CORS 다중 origin / 쿠키 `SameSite=None; Secure` (production 분기)

#### 4단계 — 데이터 마이그레이션
**요청 / 배경**: 1차 마이그레이션 스크립트가 옛 백업(`prisma/data.db.bak.*`)만 보았기 때문에 더 최근의 `prisma/data.db`에 있던 글이 누락됨.

**결과**: `scripts/migrate-sqlite.ts` 갱신 — 최신 DB 파일에서 읽어 Supabase Storage에 webp 업로드 후 Postgres에 행 생성. 멱등성 처리(이미 존재하는 글은 스킵). 모든 글과 사진 복구 완료.

#### 5단계 — Render 트러블슈팅
- 빌드 실패 1: `Could not read package.json` → Root Directory를 `server`로 설정
- 빌드 실패 2: `nest: not found` → `NODE_ENV=production`이라 devDependencies 스킵됨

**검토**:
- (a) `npm install --include=dev`
- (b) `@nestjs/cli`를 dependencies로 이동
- (c) Docker multi-stage 빌드

**결정**: (a) 채택. Start Command는 이미 `node dist/main`이므로 nest는 빌드에만 필요. 추가로 `npm prune --omit=dev`로 빌드 후 devDependency를 제거하는 패턴도 옵션으로 제시한 뒤 인라인 한 줄 chain으로 마무리.

#### 6단계 — Vercel
빌드는 성공했으나 "No Output Directory named 'public' found" 에러. Framework Preset이 `Other`로 잡혀 `next build` 산출물(`.next/`) 대신 `public/`을 찾고 있던 문제. **Framework Preset = Next.js + Root Directory = client** 설정 후 재배포로 해결.

#### 7단계 — CORS 정정
배포 직후 CORS 차단 발생. Render의 `CLIENT_ORIGIN`을 `http://localhost:3000` → `https://j00n0-photo-blog.vercel.app,http://localhost:3000`(콤마 분리)로 갱신.

### 콜드 스타트 완화 — UptimeRobot 핑

**요청 / 배경**: Render free 플랜의 콜드 스타트로 첫 진입자 경험이 나쁨.

**결과**: `/api/health` 엔드포인트 신설. UptimeRobot 5분 간격 모니터로 백엔드 슬립 방지. 부수적으로 로컬 좋아요 404 이슈가 보고되어 점검한 결과, 로컬 백엔드가 옛 `dist/main`으로 실행 중이었던 것이 원인 — 프로세스 정리 후 `npm run dev` 재시작으로 정상화.

### 댓글·좋아요 — 회원가입 없이

**요청 / 배경**: 회원가입 없이 댓글·좋아요를 운영하고 싶음.

**검토**:
- 댓글: 익명 + IP·쿠키 기반 rate-limit / 이메일 인증 / captcha
- 좋아요: 클라이언트 전용 / IP 기반 / 익명 토큰

**결정**: 익명 + IP·쿠키 rate-limit 방식 채택.
- 댓글 — 60초 1개, 글당 24시간 5개 제한
- 좋아요 — IP 해시당 1개, `LikeRecord` 테이블 + `Post.likeCount` 비정규화 컬럼
- 신규 모델 + 엔드포인트 추가, IP는 `SHA-256` + `VISITOR_IP_SALT`로 해싱하여 평문 저장 금지

**후속 이슈 — 좋아요 새로고침 시 0 복귀**: React Query `initialData`가 staleTime 동안 fetch를 건너뛴 영향. `initialDataUpdatedAt: 0` 설정으로 마운트 시 즉시 refetch.

### 댓글창 모달화

**요청 / 배경**: 댓글창이 본문 아래에 그대로 있는 형태가 아닌, 본문에서 분리된 모달이 더 적합.

**결과**: 사이드 드로어 형태(데스크탑 480px / 모바일 풀너비). 디테일 페이지는 다시 한 viewport에 들어오도록 정리.

### 좋아요·댓글·공유 액션 라인 통일

**요청 / 배경**: 세 액션이 같은 라인(위치·날짜 메타 아래)에 정렬되어야 함. 댓글 수도 좋아요처럼 숫자로 노출되고, 공유와 댓글에도 아이콘이 필요.

**결과**: 헤더에서 Share를 제거하고 Back만 남김. footer에 액션 행 분리(`♡ 5 · 💬 3 · ↗ Share`). `CommentsButton`, `ShareButton` 아톰 신설. 모두 `text-[10px] tracking-[0.3em]` + 14px 아이콘으로 톤 통일.

### SEO + 퍼머링크 + RSS — 라이트박스를 디테일 페이지로 승격

**요청 / 배경**: 글 퍼머링크, OG 메타, robots/sitemap 적용. 사용자 통찰: 공유를 하려면 상세 페이지가 있어야 하므로, 홈에서 사진 클릭 시 확대되는 라이트박스를 별도 라우트로 승격하는 것이 자연스러움.

**결정**: 라이트박스 모달 → `/posts/[id]` 라우트로 승격. 라이트박스 컴포넌트와 Zustand 스토어를 통째로 제거. 디자인은 동일(다크 풀스크린).

**결과**:
- `generateMetadata`로 글마다 OG 동적 생성(제목·캡션·첫 사진 URL)
- `robots.ts`, `sitemap.ts`, `/rss.xml` 추가
- 푸터에 Instagram + RSS SVG 아이콘

### 글 번호 역순 — 안정 정렬 도입

**요청 / 배경**: 최신 글이 No. 01로 보이는 현상.

**결정**: desc 정렬은 유지. 표시 번호만 `displayNumber = total - index`로 계산하여 가장 오래된 글이 No. 01, 새 글이 추가되어도 기존 번호가 흔들리지 않도록.

### 카드 클릭 affordance 강화

**요청 / 배경**: 카드를 누르면 상세 페이지로 이동한다는 시각적 단서 부족.

**결과**:
- `cursor-zoom-in` → `cursor-pointer`
- 이미지 hover 시 `brightness-95`
- 제목 옆 항상 보이는 `→` + hover 시 우측 슬라이드

**후속 — 카드 전체를 클릭 영역으로**: 효과가 사진에만 적용되어 본문 영역에서는 클릭이 인지되지 않는 문제. **Stretched-link 패턴** 적용 — `<article>`에 `relative`, 마지막에 `<Link absolute inset-0>`로 카드 전체를 클릭 영역화. Edit/Delete는 `relative z-10`으로 위에 띄움. hover 시 이미지·제목·캡션·화살표가 동시에 반응.

### 표준 운영 룰 메모리 등록

**요청 / 배경**: QA 에이전트의 역할 명확화 + 배포 절차 정의.

**결과 (메모리 영구 저장)**:
- `feedback_qa_e2e.md` — 배포 전과 배포 후 모두 e2e 테스트 의무
- `feedback_deploy_order.md` — 양쪽 변경 시 백엔드 commit을 먼저 push

이후 모든 세션에서 자동 적용.

---

## 2026-04-29 (수) — `/feature` 두 번째 시도

### 로그인 편의 기능 — 구현 완료 확인

**요청**: 로그인 페이지에 아이디 저장 + 자동 로그인 기능 추가.

**검토**: PM 시점에서 코드 점검 결과 이미 모든 항목이 구현되어 있음을 확인.
- 아이디 저장 체크박스 (LoginFormPresenter)
- 자동 로그인 체크박스 (아이디 저장 OFF 시 자동 비활성)
- localStorage 헬퍼(`lib/loginPrefs.ts`)
- prefill, 자동 리다이렉트, 로그아웃 시 플래그 제거
- 오픈 리다이렉트 차단

**결정**: 신규 구현 없음. 추가 다듬기 후보 — 자동 로그인 중 로딩 스피너, 단위 테스트, 로그아웃 시 저장된 아이디 처리 옵션 — 만 제시 후 작업 종료.

---

## 2026-04-29 ~ 2026-05-01 — IP 댓글 자가삭제 / EXIF / 디테일 페이지 sheet

### 댓글 자가삭제 — 좋아요 unlike와 동일 패턴

**요청 / 배경**: 좋아요는 IP 기반으로 추가·취소가 가능. 댓글도 동일한 방식으로 작성자 본인이 자기 댓글을 삭제할 수 있어야 함. 어드민은 누구의 댓글이든 삭제 가능.

**검토**: 백엔드 reader/optimizer 두 안이 거의 동일하게 수렴 — `null` = 어드민, hash = 비어드민으로 분기하는 것이 가장 깨끗함.

**결정**:
- 어드민 — JWT `role === 'admin'` 명시 체크 (`!!req.user`만으로는 부족, 토큰이 있다고 다 어드민이 아님)
- 비어드민 — `comment.visitorIpHash === requestVisitorIpHash` 매칭. 좋아요 unlike와 같은 패턴
- `OptionalJwtAuthGuard` 신설 — 토큰이 없어도 통과시켜 비어드민 흐름 처리
- 삭제는 `deleteMany({ where: { id, visitorIpHash } })`로 ownership 검증과 삭제를 한 쿼리에 묶어 race 제거
- 응답: 댓글마다 `isOwnedByVisitor: boolean` 동봉. raw `visitorIpHash`는 destructure로 제거하여 응답에 노출 X
- visitor-ip fallback: `'0.0.0.0'` 공통값에서 요청별 랜덤 해시(`anon:<hex>`)로 변경. 기존 fallback은 IP 식별 실패 시 모든 방문자가 같은 해시를 공유하여 서로의 댓글을 지울 수 있는 잠재 사고가 있었음

### QA 에이전트의 prod e2e

**요청 / 배경**: 배포 후 QA 직접 검증.

**결과**: prod URL에 curl 직접 호출하는 e2e 진행. 통과 항목 — 다른 IP에서 DELETE 시 404, 같은 IP 200, 동시 DELETE 멱등(2번째도 404), raw `visitorIpHash` 응답 누출 없음. 좋아요·방명록 회귀도 통과.

### QA 운영 룰 — 사전 리스트 노출

**요청 / 배경**: QA 에이전트가 어떤 항목을 테스트할지 사전에 알리고 사용자 동의 후 진행하도록.

**결과 (메모리 영구 저장 — `feedback_qa_preview.md`)**: QA 실행 전 항목 리스트를 먼저 보여주고 사용자 동의 후 진행.

### Vercel 빌드 캐시 누락

**요청 / 배경**: 댓글에 Delete 버튼이 노출되지 않는다는 보고.

**검토**: Vercel 배포 chunk를 받아 grep한 결과 `isAdmin`은 들어 있으나 `isOwnedByVisitor`가 없음. Vercel이 새 빌드를 트리거하지 않은 상태였음.

**결과**: 빈 커밋 push로 webhook 재트리거 → 정상화.

### EXIF 메타데이터

**요청 / 배경**: 사진 블로그 특성상 카메라·렌즈·노출 정보가 노출되면 콘텐츠 가치가 높아짐. PM에게 단순 표시를 넘어선 발전형까지 모두 검토 요청.

**검토 (옵션 비교)**:
- A — 단순 표시
- B — `takenAt` 자동 채움
- C — GPS 지도 (개인정보 위험으로 기각)
- D — 카메라 인덱스 페이지
- E — 사진별 EXIF
- F — A + B 조합

**결정 1 — 저장 단위 / 노출 위치**: 사진별 EXIF 저장. 홈 카드는 디자이너 권장에 따라 미노출(메타 밀도가 이미 빽빽함). `takenAt`은 EXIF에서 자동 채움. 디자이너 호출.

**결정 2 — 개인정보**: GPS는 저장하지 않음. exifr `gps: false` 옵션 + 명시적 `pick` 화이트리스트로 두 겹 방어.

**결과 (백엔드)**: `Photo.exif Json?` 단일 컬럼에 `{ camera, lens, shutterSpeed, aperture, iso, focalLength }` 저장(정규화 미진행 — 카메라 인덱스 페이지가 후순위라 KISS 우선). exifr와 sharp를 같은 buffer에 `Promise.all`로 병렬 호출. takenAt fallback — service에서 `dto.takenAt?.trim() || processed[0]?.takenAtFromExif || ''`. update 시에는 사용자 명시값 우선(빈 문자열로 클리어 가능) — create와의 비대칭은 의도된 차이.

**결과 (디자이너 — 두 줄 분리 표기)**:
- 1행: `SONY α7 IV · FE 35mm F1.8` (카메라 · 렌즈)
- 2행: `1/250s · f/1.8 · ISO 200 · 35mm` (노출 파라미터)
- 톤: 기존 메타 라벨과 동일 `text-[10px] uppercase tracking-[0.3em] text-white/40`. 구분자 `·`만 `text-white/20`으로 한 단계 흐리게

### 기존 글 EXIF 백필 불가

**요청 / 배경**: 기존 글에도 EXIF가 적용되지 않는지 문의.

**검토**: 업로드 시 sharp가 webp로 변환하면서 메타데이터가 통째로 stripping. `.withMetadata()`를 쓰지 않는 한 storage에는 EXIF 없는 webp만 존재. 백필할 원본이 보존되어 있지 않음.

**결정**: 신규 글부터만 적용. `ExifLines` 컴포넌트는 `exif: null`이면 아무것도 렌더하지 않으므로 기존 글에는 자연스럽게 노출되지 않음.

### EXIF 표시 위치 — 3차에 걸친 디자인 조정

**1차 안 — footer에 두 줄 EXIF**: 노출 위치가 사진과 단절되어 어떤 사진의 정보인지 직관적이지 않음.

**2차 안 — Carousel 슬라이드 안에 사진 + EXIF column**:
- PC 정렬 어긋남
- PC 하단 간격 과대
- 모바일 캐러셀 dot 영역과 EXIF 바 겹침
- 사진이 EXIF에 viewport를 양보하여 모바일에서 너무 작아짐

원인 진단(디자이너):
- EXIF 바가 슬라이드 너비 전체이지만 사진은 `object-contain`으로 가운데 정렬되어 시각적으로 어긋남
- column flex의 spacer가 사진과 EXIF 사이에 빈 공간을 만듦
- Carousel dots(`bottom-3`)와 EXIF 바 영역 충돌
- EXIF가 viewport 일부를 차지하면서 모바일에서 사진 사이즈 손해

**3차 안 (채택) — 디자이너 옵션 A**: EXIF 슬롯을 carousel 박스 바깥, footer 위 독립 행으로 분리. footer와 같은 좌측 패딩 grid에 정렬되어 헤더/footer 메타와 같은 x축 선상에 위치.

**모바일 추가 보정**: 사진 사이즈 추가 회수를 위해 모바일 한정 패딩 축소 — carousel `px-6 py-8 → px-3 py-4`, footer `max-h-[200px] py-6 → max-h-[160px] py-4`, EXIF `py-3 → py-2`. PC(`md:` 이상)는 그대로 유지. 약 +52px 회수.

**보조 사고**: 본 작업을 단일 커밋 + push로 마무리한 것이 메모리의 `feedback_deploy_order.md`(백엔드 먼저 push) 룰을 위반. 해당 메모리가 인덱스 누락 상태라 자동 로딩이 안 되어 있던 것이 원인. Render 빌드 명령에 `npx prisma migrate deploy` 추가까지 안내하여 마무리.

### 디테일 페이지 디자인 개편 — A → B (peek/expand sheet)

**요청 / 배경**: 디테일 페이지에서 사진이 가장 크게 보여야 하고, 그 다음으로 글과 정보에 집중할 수 있어야 함. 현재 형태가 어느 쪽에도 충분히 강조되지 않음.

**검토**:
- **A안 (풀-페이지 스크롤)**: 라이트박스 폐기, 사진 carousel + EXIF + 본문 + 댓글이 위에서 아래로 스크롤. 글을 읽으려면 사진이 위로 사라지는 흐름이 사용자 의도("사진을 항상 본 상태로 글을 읽고 싶다")와 어긋남.
- **B안 (peek/expand sheet)**: 사진은 `fixed inset-0` 그대로 두고, 하단 sheet를 토글. peek 180px(타이틀 + 메타 + engagement + caption 일부) / expanded `min(70vh, 640px)`.
- **C안 (분할 화면)**: 만들지 않음. B로 충분, 추가 시도가 필요해지면 그때.

**결정**: B안 채택.

**결과 — 디바이스별 입력 분기**: pointer events로 분기 — `pointerType === 'touch'`면 swipe/drag, mouse/keyboard는 click/Enter/Space 토글. 핸들은 `<div role="button" tabIndex={0}>` + `setPointerCapture`로 손가락이 핸들 밖으로 나가도 release 보장.

**결과 — Follow drag**: `pointermove`에서 손가락 위치를 따라 sheet height 즉시 변경. 떼는 시점에 임계값 기반 snap:
- `< 5px` → tap → toggle
- `> 50px` → 그 방향으로 commit (위 → expand, 아래 → collapse)
- 그 외 → 시작 위치로 snap back (실수 방지)

드래그 중 transition 비활성, 떼면 활성화하여 부드러운 마무리. caption의 line-clamp / Read more를 모두 제거 — sheet 높이에 따라 자연스럽게 더 보이도록(드래그 중 갑자기 컨텐츠가 등장하는 어색함 제거).

**결과 — 댓글 버튼 트리거**: 댓글 버튼 클릭 시 `setHeight(maxH)` 후 `setTimeout(320ms)`(transition duration + 여유)로 댓글 wrapper에 `scrollIntoView({ behavior: 'smooth', block: 'start' })`.

### 메모리 시스템 점검

**요청 / 배경**: 어시스턴트가 프로젝트 초기 세팅(에이전트 등) 내용을 기억하고 있는지 확인 요청.

**결과**: 어시스턴트는 현재 대화와 메모리 디렉토리에 명시 저장된 내용, 그리고 코드/git을 직접 읽어 알 수 있는 사실만 기억. 이전 세션 자체는 보유하지 않음.

메모리 디렉토리 점검 결과 — 파일 4개 중 2개(`feedback_deploy_order.md`, `feedback_qa_e2e.md`)가 `MEMORY.md` 인덱스에 누락되어 자동 로딩이 안 되고 있었음. 이로 인해 이번 세션에서 두 룰을 모두 위반(EXIF 단일 커밋 push, 디자인 개편 후 prod e2e 미수행)했음을 사용자에게 보고. 인덱스 추가는 사용자 요청에 따라 진행하지 않음.

### 다른 세션 이력 접근 명령어 정리

**검토 결과**:
- `claude --continue` (`-c`) — 마지막 세션 이어가기
- `claude --resume` (`-r` 또는 이름 인자) — 과거 세션 목록에서 선택
- 세션 안에서 `/resume` — 다른 과거 세션으로 전환
- `/rename <이름>` — 현재 세션에 이름을 붙여 이후 검색 용이화
- `CLAUDE.md` — 모든 세션에 자동 로드되는 영구 컨텍스트

**역할 구분**:
- 휘발성·세션 간 이동 → `--resume` / `--continue`
- 다음 세션부터 어시스턴트가 자동으로 알아야 할 학습 → 메모리(`feedback_*.md` + `MEMORY.md` 인덱스)
- 모든 세션이 항상 알아야 할 사실 → `CLAUDE.md`

---

## 2026-05-01 (금) — 작업 일지 시스템 구축

### 대화 내용 영구 보관 결정

**요청 / 배경**: 다른 세션에서도 이 프로젝트의 진행 맥락을 알 수 있도록 기록 파일이 필요.

**검토**:
- CLAUDE.md (디렉토리 진입 시 자동 로드)
- 메모리 디렉토리 (관련 상황에서 자동 회상)
- 일반 .md 파일 (수동 참조)

**결정**: 프로젝트 루트에 단일 .md 파일을 두어 사용자가 명시적으로 호출하면 어시스턴트가 함께 읽어 참고. 1차 파일명은 `SESSION.md`. 결정사항 위주의 압축 기록을 작성.

### 타임라인 형식으로 재구성

**요청 / 배경**: 단순 결정 목록보다는 날짜·요청·검토·결정 흐름이 보이도록 타임라인이 적합. 추후 블로그 글 작성 시 원자료로 활용.

**결과**: 1차 작성본을 시간순 섹션 구조로 재구성.

### 워크로그 스킬화 + 파일명 변경

**요청 / 배경**: 동일한 기록 작업을 슬래시 명령으로 언제든 호출할 수 있도록 스킬화. 중복 항목은 제외하고 신규 사건만 추가하는 방식. 파일명은 `SESSION`이 더 이상 적합하지 않음.

**검토**:
- 파일명 후보 — `JOURNAL.md` / `DEVLOG.md` / `WORKLOG.md` / `HISTORY.md`
- 스킬 위치 — 사용자 전역(`~/.claude/skills/`) vs 프로젝트 전용(`.claude/skills/`)

**결정**: 파일명 `WORKLOG.md`. 스킬은 프로젝트 전용으로 우선 운영.

**결과**:
- `SESSION.md` → `WORKLOG.md` 리네임
- `.claude/skills/worklog/SKILL.md` 작성. 절차 — (1) 파일 위치 확인 (2) 기존 내용 통독 (3) 신규 이벤트 식별 (4) 중복 검사 (5) 요청/검토/결정/결과 형식으로 하단에 append. 호출 트리거 — `/worklog`, "기록해줘", "워크로그 업데이트", "오늘 한 거 적어줘".
- 스킬은 세션 시작 시점에 로드되므로 같은 세션 내에서는 미동작 → 다음 세션부터 자동 활성

### 톤 정정 — 인용 형식에서 프로젝트 보고서로 전환

**요청 / 배경**: 1차 작성본이 사용자 발언을 verbatim으로 인용하는 블로그/대화 톤이었음. 포트폴리오·이력서 첨부에 적합한 객관적 프로젝트 기록으로 톤을 바꿔야 함.

**결과**:
- `SKILL.md` 개정 — 인용 금지, 3인칭 보고서 톤, 요청/검토/결정/결과 4단 구조 명시
- 기존 `WORKLOG.md` 본문 전체를 새 톤으로 다시 작성(이 파일이 그 결과)

---

## 2026-05-03 (일) — 로컬·상용 DB/Storage 분리 (데이터 손실 인시던트 대응)

### 인시던트 보고 — 로컬 변경이 상용에 그대로 반영

**요청 / 배경**: 로컬 개발 중 수행한 작업이 상용 데이터에 반영되어 콘텐츠가 사라지는 사고 발생. `server/.env`의 `DATABASE_URL`·`DIRECT_URL`·`SUPABASE_*`가 모두 상용 Supabase 프로젝트(`iinkwgqcdwsyuenloguj`)를 가리키고 있었고, Render 상용 서버도 같은 프로젝트를 사용 중이었음. DB뿐 아니라 Storage 버킷까지 동일하게 공유되어 사진 업로드/삭제도 양방향으로 영향.

**PM 회고**: 환경 격리는 첫 코드 한 줄 짜기 전에 끝냈어야 할 0순위 작업이었으나, "사이드 프로젝트라 빠른 진행이 우선"이라는 근거로 계속 미뤄온 것이 사고의 직접 원인. 변명 없이 PM 책임으로 명시 기록.

### 분리 방식 — 옵션 비교

**검토**:
- **A. Mac 네이티브 Postgres + 로컬 디스크 storage** — schema/migrations 그대로 사용, Docker 불필요, 인터넷 없이 동작, 완전 무료
- **B. Supabase 프로젝트 dev 전용 신규 생성** — 클라우드 기반, Storage 분리도 자연스럽지만 콘솔 작업 필요
- **C. Docker Postgres** — 격리는 좋으나 Docker 의존
- **D. SQLite로 회귀** — schema provider를 sqlite로 바꾸면 상용도 sqlite여야 하나 Render 휘발성 디스크와 충돌. 사실상 불가

추가 함정 인지: Prisma는 `schema.prisma` 한 파일에 provider 하나만 가능하므로 환경별 provider 분기는 불가능.

**결정**: A 채택. 1인 사이드 프로젝트 규모에 가장 가벼운 셋업이며, schema/마이그레이션 변경 없이 `DATABASE_URL`만 로컬로 돌리면 끝. Storage는 코드에 driver 분기를 추가하여 로컬 디스크에 저장하는 모드 부활.

### Storage 분리 — `STORAGE_DRIVER` 분기 도입

**검토 (백엔드 reader vs optimizer 토론)**:
- reader 안 — `StorageService` 단일 클래스에 `if (driver === 'local')` 두 줄로 분기. 호출부 무변경
- optimizer 안 — `IStorageDriver` 인터페이스 + `LocalStorageDriver` / `SupabaseStorageDriver` 분리, useFactory로 driver 선택. 보안 디테일(`path.basename` 강제, prefix 검증, hostname suffix 매칭) 추가

**결정**: reader의 KISS 구조(단일 service + 내부 분기) + optimizer의 보안 디테일을 합성. 인터페이스 분리는 1인 프로젝트 규모에 오버킬로 판단.

**결과**:
- `server/src/storage/storage.service.ts` — `STORAGE_DRIVER=local|supabase` 환경 변수로 분기. local은 `./uploads`에 디스크 쓰기 후 `${PUBLIC_API_BASE_URL}/uploads/<filename>` 반환, supabase는 기존 동작 보존. 시그니처 무변경 → `posts.service.ts` 호출부 그대로
- 파일명 sanitize — `^[A-Za-z0-9._-]+$` 화이트리스트 regex로 path traversal 차단 (`upload`/`srcToPath` 양쪽)
- `OnModuleInit`에서 `mkdir(uploads, { recursive: true })`
- `srcToPath`는 driver별 prefix 검증으로 cross-driver URL은 `null` 반환 — DB에 stale supabase URL이 남아있어도 로컬 unlink 시도 안 함
- `src/main.ts` — `STORAGE_DRIVER=local`일 때만 `useStaticAssets('/uploads', { dotfiles: 'deny', etag: true, maxAge: '1h' })` 마운트. 상용에서는 활성 안 됨

### 재발 방지 가드 — boot 시점 환경 변수 검증

**요청 / 배경**: "다시는 이런 일이 일어나지 않도록 가드" 명시 요구.

**검토**:
- `process.env.NODE_ENV !== 'production'`인데 알려진 상용 호스트가 `DATABASE_URL`/`DIRECT_URL`/`SUPABASE_URL`에 들어 있으면 부팅 거부
- 호스트 매칭 — 단순 `String.includes`는 `notsupabase.co.fake.com` 같은 우회 가능. `new URL(value).hostname`으로 파싱 후 `*.supabase.co` / `*.pooler.supabase.com` suffix regex 매칭
- escape hatch (`ALLOW_PROD_URLS_LOCALLY` 등) — 두면 항상 켠 채 방치되어 가드 의미가 사라짐. 두지 않기로 결정
- 위치 — `main.ts` 인라인 vs 별도 파일. 가드는 환경 조합 위험 판단이라 schema validation(Joi/Zod) 보다는 명시적 함수가 명확. `src/config/validate-env.ts`로 분리하여 단위 테스트 가능 형태 유지
- prod 환경에서 가드가 잘못 발동하지 않도록 `NODE_ENV === 'production'` 선행 리턴
- prod 부팅 디버깅을 위해 진입 시 `[ENV GUARD] NODE_ENV=...` 로그 1줄

**결정**: 위 사항 모두 채택. `process.exit` 대신 `throw`로 NestJS bootstrap 스택 트레이스에 노출.

**결과**:
- `server/src/config/validate-env.ts` 신규 — 위반 변수와 호스트를 메시지에 명시
- `main.ts` `bootstrap()` 첫 줄에서 호출 → DI 컨테이너 생성 전에 차단
- 양방향 negative test 통과 — dev + 상용 URL 조합 → throw, prod NODE_ENV → 통과

### PG 버전 mismatch — `postgresql@17` 추가 설치

**요청 / 배경**: 분리 작업 시작 전 상용 백업이 보험. `pg_dump`로 시도했으나 Supabase가 17.6, brew 기본 `postgresql@15`라 버전 불일치로 실패.

**결정**: `postgresql@17`을 keg-only 추가 설치하여 백업 전용으로 사용. 로컬 dev DB는 15 그대로(이미 서비스 가동 중).

**결과**: `prod_backup_20260503_192819.sql`(233K) 확보. 다만 모든 테이블 0행 — 데이터는 이미 사고로 손실된 상태였음. 백업은 schema 보존 의미만 남음.

### e2e 검증 — 로컬·상용 양쪽

**검토 (QA 사전 체크리스트)**: 서버 부팅, prod URL 환경 가드 양방향, `/api/health`, `/api/posts` 빈 배열, 로그인→포스트 생성→사진 업로드→정적 URL 200→파일 디스크 확인→삭제→파일 unlink·404, 댓글/좋아요 회귀, 상용 무결성.

**결과 (로컬)**:
- 부팅 로그 `[ENV GUARD] NODE_ENV=(unset)` → 가드 통과 → `Server listening on http://localhost:3001`
- 포스트 생성 시 `photo.src=http://localhost:3001/uploads/<uuid>.webp` 응답, 파일 fetch 200 + 64x64 WebP 본문, `server/uploads/` 신규 파일 생성
- 포스트 삭제 → 파일 unlink + URL 404
- 댓글/좋아요 추가·취소 200, `likeCount` 1↔0
- negative test — `.env`에 상용 URL 임시 주입 후 가드 직접 호출 → throw, NODE_ENV=production → 통과

**결과 (상용)**:
- Render env에 `NODE_ENV=production`, `STORAGE_DRIVER=supabase` 명시 추가
- commit `3c4e0a4` push → Render 자동 재배포 → Logs 탭에서 `[ENV GUARD] NODE_ENV=production` 확인
- prod `/api/health` 200, `/api/posts` `[]`, `/uploads/foo` 404 (supabase 모드라 정적 마운트 비활성, 의도대로)
- 클라이언트 변경 0건 — `next/image` 미사용 + 사진 URL은 백엔드 응답에 absolute로 박혀오므로 driver 분기는 클라이언트에 투명

### 사용자 운영 원칙 보강 — `.env.example`을 dev-safe default로

**결정**: `.env.example`은 로컬 dev 기본값(local Postgres + STORAGE_DRIVER=local) 위주로 작성하고 상용 값은 주석으로만 안내. 상용 자격증명은 Render 대시보드에서만 관리. `prod_backup_*.sql`은 `.gitignore`에 추가.

---

## 2026-05-03 (일) — 프로젝트(Project) 기능 추가

### 명칭과 데이터 모델 — 혼합 구조 채택

**요청 / 배경**: 사진 전시에 가까운 매거진 톤을 살리기 위해 시리즈 기능을 도입하되 명칭은 "프로젝트"로 한다.

**검토 (3가지 데이터 구조)**:
- (a) 컬렉션 — `Project → Post → Photo` 3계층. 한 프로젝트가 다수의 글을 담음
- (b) 대체 — Post 개념을 Project로 승격. 단일 묶음 = 한 프로젝트
- (c) 혼합 — 일반 글은 기존 그대로, Project는 옵션 소속

**결정**: (c) 혼합. 일반 글의 자유도와 시리즈성 큐레이션을 모두 살린다. 카디널리티는 한 글이 0 또는 1 프로젝트(1:N). Post에 `projectId` nullable FK + `onDelete: SetNull`(프로젝트 삭제 시 글은 보존하고 소속만 끊는다).

**결과 / 산출물**: 신규 `Project` 모델 — 제목만 필수, 컨셉·커버 이미지·시작/종료 기간·상태(`ongoing`|`completed`)·공개 여부 모두 옵션. CRUD는 어드민 전용, 공개 read는 누구나, 비공개는 어드민만 조회.

### 디자이너 자문 — IA와 디테일 페이지

**검토**: 헤더 메뉴 추가 여부, 홈에 프로젝트와 일반 글이 어떻게 공존할지, 디테일 페이지 형태(매거진 인덱스 / 롱스크롤 합본 / 풀스크린 슬라이드쇼).

**결정**:
- 헤더는 `Home · Projects · Guestbook` 3-항목으로 확장
- 홈은 글 흐름만 유지(프로젝트 카드 섞지 않음). 글 카드 메타 끝에 `· PROJECT TITLE` 한 줄로 조용히 노출
- `/projects` 인덱스는 가로형 리스트 카드(좌 커버 4:5, 우 텍스트), 진행중→완료 그룹 + `COMPLETED` eyebrow
- `/projects/[id]` 디테일은 옵션 A(매거진 인덱스) — 상단 hero + 컨셉 문단 + 소속 글을 홈 PhotoGrid 컴포넌트 재사용. 카드 하단에 `01 / 12` 프로젝트 내 순서 표기. 롱스크롤 합본·슬라이드쇼는 기존 글 디테일의 풀스크린 sheet 패턴과 레이어가 충돌해 기각

**결과 / 산출물**: 인덱스·디테일 양쪽에 커버 미존재 fallback(비율 유지 + `bg-line` 단색 + 제목 텍스트). 글 디테일 진입이 프로젝트 컨텍스트면 back 라벨이 `← {프로젝트명}`으로 분기.

### 백엔드 설계 — 정합성·보안 우선

**검토 (reader vs optimizer 토론)**:
- status를 Prisma enum으로 두느냐 String + 검증자로 두느냐
- 비공개 프로젝트가 응답에 누출되지 않도록 권한 가드를 어디에 둘지
- DELETE 트랜잭션 — storage unlink와 DB 삭제 순서
- Post 생성·수정 시 잘못된 `projectId` 검출 시점

**결정**:
- status는 Prisma enum(컴파일 타임 타입 + DB CHECK 제약)
- 복합 인덱스 `(isPublic, status, updatedAt DESC)` + Post 측 `@@index([projectId])` 사전 적용
- 가시성은 service 단일 진실 원천. controller가 `JwtAuthOptionalGuard`로 `isAdmin` boolean만 추출해 service에 전달, where 조건과 404 분기를 service에서 일괄 처리. 비공개 + 비어드민은 `NotFoundException`(존재 자체를 노출하지 않는다)
- Posts 응답에 `project: { id, title } | null` 포함하되, 비어드민에게는 비공개 프로젝트 라벨을 `null`로 마스킹. 별도 transform 헬퍼(`maskProject`)로 list/getOne/create/update 모두에 일관 적용
- DELETE는 DB-first → storage best-effort(기존 posts.service의 패턴과 일치). storage 실패는 `logger.warn`으로만 남김
- Post create/update가 받은 `projectId`는 사전 `findUnique`로 존재 검증해 DB FK 에러 대신 명시적 `BadRequestException` 반환

**결과 / 산출물**: ProjectsModule(controller·service·dto) 신설. 마이그레이션 `add_project_model` — nullable ADD COLUMN + 신규 테이블 + enum 생성 + 인덱스. Render는 빌드 시 `prisma migrate deploy` 자동 실행.

### 프론트 설계 — fetch 전략과 back 컨텍스트

**검토 (reader vs optimizer 토론)**:
- `/projects`를 RSC server fetch로 갈지 클라이언트 컴포넌트로 갈지 — RSC는 anonymous fetch라 어드민이 비공개 프로젝트를 인덱스에서 보지 못함
- `/projects/[id]` 디테일도 동일 트레이드오프 + OG 메타데이터 leak 방지 필요
- 글 디테일 진입 시 어디서 왔는지 전달 — searchParams(URL 명시) vs Zustand 일시 상태(URL 깨끗)

**결정**:
- `/projects`는 클라이언트 컴포넌트(`useProjects`로 cookies 포함 호출 → 어드민이 비공개 포함 전체를 본다)
- `/projects/[id]`는 RSC + `generateMetadata` + `notFound()`. anonymous fetch라 비공개 프로젝트는 OG 자체가 생성되지 않는다. 어드민이 비공개 디테일 작업이 필요한 경우는 `/admin/projects/[id]/edit`로 흡수
- back 컨텍스트는 searchParams `?fromProject=<id>`. URL에 상태가 명시되어 새로고침과 공유 링크에서 살아남고, post의 `project.id`와 일치할 때만 인정해 위변조·stale 케이스를 자연스럽게 fallback 처리. Zustand는 race·새로고침 손실 위험으로 기각
- 새 라이브러리 도입 없음 — 기존 react-hook-form / zod / Embla / TanStack Query 그대로 활용

**결과 / 산출물**: 어드민 라우트는 기존 `/admin/upload`, `/admin/edit/[id]` 컨벤션과 맞춰 `/admin/projects/new`, `/admin/projects/[id]/edit`. ProjectCard·ProjectSelector molecule, ProjectForm organism, 신규 4페이지. 홈 카드는 `hideProjectLabel`·`projectIndexLabel`·`backToProjectId` props로 동일 컴포넌트가 홈/프로젝트 디테일 양쪽에서 재사용된다. 업로드·수정 폼에 ProjectSelector 통합 + 폼 하단 "+ 새 프로젝트 만들기" 링크.

### 정렬 버그 — Postgres enum은 선언 순서를 따른다

**요청 / 배경**: 로컬 e2e 도중 인덱스 정렬을 검증하는 단계에서 `completed` 프로젝트가 `ongoing`보다 위에 노출되는 회귀 발견.

**검토**: 처음에는 알파벳 정렬을 가정해 `orderBy: [{ status: 'desc' }]`로 잡았다(c < o이므로 desc면 ongoing 먼저). 그러나 Postgres는 enum 값을 선언 순서로 비교하므로 `ongoing`이 먼저 선언된 본 스키마에서는 `asc`가 정답.

**결정 / 결과**: `orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }]`로 수정 + 한 줄 주석으로 근거 명시. 재실행 검증 — 진행 중 그룹이 정렬 상단, 그 안에서 최신순 노출 확인.

### 코드 리뷰 정리 — blocker 1, major 3 수정

**검토**: code-reviewer 에이전트가 보고한 항목 중 ship 차단 4건.

**결정 / 결과**:
- **커버 이미지 클리어 동작 안 함**(blocker) — UI에서 ×로 커버 제거해도 신규 파일이 없으면 PATCH가 아무 필드도 보내지 않아 기존 커버가 유지됨. `UpdateProjectDto`에 `clearCover?: boolean` 추가, mutation이 `file 없음 + 사용자가 명시적으로 제거`인 경우에만 `clearCover=true` 전송, service가 `coverPhotoUrl=null` + 기존 storage unlink. 전용 e2e로 라이프사이클 재검증
- **`useSearchParams` Suspense 미감쌈**(major) — Next 16에서 정적 렌더 빌드 실패 위험. `app/posts/[id]/page.tsx`에서 `<Suspense fallback={null}>`로 감쌈
- **비공개 프로젝트 저장 후 /projects/[id] 리다이렉트 시 404**(major) — 디테일 페이지가 anonymous RSC fetch라 어드민이 비공개 디테일 라우트로 가면 404. ProjectFormContainer가 `saved.isPublic` 분기로 비공개일 때 `/projects` 인덱스로 이동
- **`ProjectDetail.posts` 타입에 `project` 필드 누락**(major) — 백엔드가 nested posts에 project를 include하지 않으므로 클라이언트 `Post` 타입과 불일치. `ProjectPost = Omit<Post, 'project'>` narrow 타입 도입 + view에서 PhotoGrid 호출 시 `project: null`로 매핑해 타입과 런타임 일치

### 분리 커밋 push + prod 통합 검증

**요청 / 배경**: 워크로그 메모리 룰(`feedback_deploy_order.md`)에 따라 백엔드 → 프론트 순차 push.

**결과**: 백엔드 단독 commit `7d9d5c6` push → Render 자동 빌드 + `prisma migrate deploy` → `/api/projects` 200 확인 → 프론트 commit `ca0d5bd` push → Vercel 배포 → `/projects` 200 + 새 페이지 컨텐츠 확인. QA 에이전트가 prod에서 anonymous e2e 13건(엔드포인트 + 페이지 렌더 + 회귀 + storage 격리) 모두 통과. 어드민 자격증명을 별도로 노출하지 않아 어드민 CRUD 항목은 SKIP 처리, 어드민 흐름은 사용자가 prod에서 첫 프로젝트 생성으로 직접 확인.

### (보류) 어드민용 비공개 프로젝트 공개 라우트 미리보기

**보류 사유**: `/projects/[id]`가 anonymous RSC fetch로 통일되어 어드민이 비공개 프로젝트를 공개 라우트에서 그대로 미리보기 어렵다. 어드민의 일상 작업은 `/admin/projects/[id]/edit` 화면 + 발행 후 공개로 전환하는 흐름으로 흡수되므로 즉각 영향 없음. 향후 필요 시 별도 미리보기 라우트 또는 cookies forwarding 옵션 검토.

---

## 보류 중 / 추후 검토

| 항목 | 메모 |
|---|---|
| RSS `/rss.xml` 본격 운영 점검 | layout metadata에 link 등록은 되어 있으나 라우트 운영 확인은 미진행 |
| 이메일 / 웹 푸시 알림 | 스코프 밖. 필요 시 FCM 또는 메일 서비스 |
| 원본 사진 보존 | 현재 미보존. 필요 시 `originals/` 분리 |
| 단위·통합 테스트 | 미작성. `loginPrefs`, `resolveNextPath`, 서버 컨트롤러 우선 후보 |
| 자동 백업 / PITR | 사고로 잃은 데이터는 복구 불가. Supabase Pro의 PITR 또는 외부 cron `pg_dump` 검토 필요 |

---

## 자주 쓰는 정보

### 실행
```
cd server && npm run dev    # http://localhost:3001
cd client && npm run dev    # http://localhost:3000
```

### 새 작업 시작 (에이전트 워크플로우)
```
/feature <요구사항>
```

### Prisma 스키마 변경 후
```
cd server && npx prisma migrate dev
```

### 자격증명·시크릿
- 클라이언트 `.env.local`: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_API_ORIGIN`
- 서버 `.env`: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ADMIN_USERNAME/PASSWORD`, `SUPABASE_*`, `VISITOR_IP_SALT`, `CLIENT_ORIGIN`

### 사용자 운영 원칙 (Standing rules)
- 신규 라이브러리·패턴 도입 전엔 반드시 사용자 승인 후 진행
- 응답은 간결하게
- 코드 주석은 거의 사용하지 않음 (WHY가 비자명할 때만)
- 추상화는 미루기 (3회 이상 반복되기 전엔 헬퍼화 금지)
- 사용자는 프론트엔드 개발자 — 백엔드는 친절히 설명

---

## 이 파일 유지 가이드

- 새 결정·요청·검토 사항이 생기면 **날짜 헤더와 함께** 하단에 추가
- 톤은 3인칭 보고서 — 사용자 발언 verbatim 인용은 사용하지 않음
- 각 이벤트는 요청/배경 → 검토 → 결정 → 결과/산출물 흐름으로
- 기술 디테일은 의사결정과 직접 관련될 때만 명시
- 포트폴리오·이력서 첨부 자료로 활용 가능한 수준의 객관성 유지
