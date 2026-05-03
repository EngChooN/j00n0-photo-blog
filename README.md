# j00n0__ Photo Journal

미니멀 매거진 톤의 개인 사진 블로그. 사진 한 장씩이 아니라 "한 권의 글"처럼 묶여 펼쳐지는 경험을 목표로 만들었다.

- 클라이언트 — https://j00n0-photo-blog.vercel.app
- API — https://j00n0-photo-blog-server.onrender.com
- 진행 일지 — [WORKLOG.md](./WORKLOG.md) (요청 / 검토 / 결정 / 결과 흐름의 의사결정 기록)

> _스크린샷 자리 — 추후 첨부_

---

## Features

- **글 + 다중 사진 + 캐러셀.** 한 글에 사진 여러 장. Embla 기반, 카드는 라이트 톤 / 디테일은 다크 톤으로 분리.
- **프로젝트(시리즈).** 글이 옵션으로 한 프로젝트에 소속. `/projects` 인덱스 + 매거진 hero 디테일.
- **EXIF 자동 추출.** 카메라·렌즈·셔터·조리개·ISO·초점거리. `gps: false`로 위치 정보 저장 차단.
- **퍼머링크 + OG + RSS + sitemap.** 글 / 프로젝트마다 동적 메타데이터. 비공개는 `noindex`.
- **회원가입 없는 익명 인터랙션.** 댓글·좋아요는 `IP + VISITOR_IP_SALT` 해시 기반. 본인이 단 댓글은 본인만 자가삭제.
- **풀스크린 글 디테일.** 사진 fixed inset-0 + 하단 peek/expand sheet (드래그·tap·키보드 토글).
- **단일 어드민.** 메뉴 어디에도 노출 안 됨. `/login` URL 직접 진입만.

## Stack

| Layer | Tech |
|---|---|
| Client | Next.js 16 · React 19 · Tailwind 3 · TanStack Query 5 · react-hook-form + zod · Embla Carousel |
| Server | NestJS 10 · Prisma 6 · sharp · exifr · JWT(passport, httpOnly cookie) · class-validator |
| DB | Postgres (로컬 native / 상용 Supabase) |
| Storage | 로컬 디스크 / Supabase Storage — `STORAGE_DRIVER` 환경 변수로 분기 |
| Deploy | 클라이언트 Vercel · 백엔드 Render · DB+Storage Supabase (모두 free tier) |

## Architecture — 핵심 결정

- **매거진 톤이 최상위 제약.** Easing은 `cubic-bezier(0.16, 1, 0.3, 1)`, 메타 라벨은 `text-[10px] uppercase tracking-[0.3em]`, hairline 보더, Cormorant Garamond 300 + Inter. 모든 컴포넌트가 이 톤을 우선해 결정한다.
- **IP 기반 익명 모델.** 회원 시스템을 만들지 않기로. 댓글·좋아요는 `SHA-256("${VISITOR_IP_SALT}:${IP}")`로 해시 식별. 어드민(`role === 'admin'`)이면 모두 삭제 가능, 비어드민은 자기 해시와 매칭될 때만. 평문 IP는 어디에도 저장하지 않는다.
- **Storage driver 분기 + boot 시 환경 격리 가드.** 사진 업로드 경로는 `STORAGE_DRIVER=local|supabase` 한 줄로 분기되며, 호출부는 driver를 모른다. dev에서 실수로 prod 자격증명을 쓰면 부팅 직전 `validate-env`가 throw — 콘솔/리소스 누수 차단.
- **RSC + 클라이언트 컴포넌트의 분명한 경계.** 글 디테일·프로젝트 디테일은 RSC + `generateMetadata`로 OG / SSR을 챙기고, 어드민·인터랙션 영역만 `'use client'`. 비공개 리소스는 anonymous fetch가 자연 404로 떨어지면서 OG leak이 차단된다.
- **Container / Presenter + Atomic.** atoms / molecules / organisms / templates. 컨테이너는 데이터·상태, 프리젠터는 props 기반 순수 렌더. 추상화는 3회 이상 반복되기 전까지 미룬다.
- **멀티 에이전트 워크플로우.** PM(haiku) → Designer / Dev pair (sonnet) → Code Reviewer (opus) → QA(haiku) 구조의 `/feature` 슬래시 명령으로 요구사항을 흐름 위에 올린다. 의사결정 근거가 [WORKLOG.md](./WORKLOG.md)에 그대로 남는다.

## Local development

```bash
# 1. 로컬 Postgres 준비 (한 번만)
createdb photo_blog_dev

# 2. 환경 변수 — 양쪽 모두 .env.example을 보고 채운다
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# 3. Prisma 마이그레이션 적용
cd server && npx prisma migrate dev

# 4. 두 dev 서버 띄우기 (각자 다른 터미널)
cd server && npm run dev    # http://localhost:3001
cd client && npm run dev    # http://localhost:3000
```

기본은 로컬 Postgres + 로컬 디스크 storage(`STORAGE_DRIVER=local`). 상용 자격증명은 절대 로컬 `.env`에 두지 않으며 Render / Vercel 대시보드의 환경 변수로만 관리한다 (env 가드가 부팅 시 검증).

## Repository layout

```
.
├── client/                Next.js — App Router
│   ├── app/               public + admin 라우트, RSC 페이지
│   ├── components/        atoms / molecules / organisms / templates
│   ├── hooks/             queries · mutations (TanStack Query)
│   └── lib/               api fetch, types, validation, utils
├── server/                NestJS — REST API
│   ├── prisma/            schema.prisma + migrations
│   └── src/
│       ├── auth/          JWT 가드 (required / optional)
│       ├── posts/         글 + 사진 (sharp + exifr)
│       ├── projects/      시리즈
│       ├── comments/      익명 + IP 자가삭제
│       ├── guestbook/
│       ├── storage/       driver 분기 (local / supabase)
│       ├── config/        validate-env (boot 시 환경 격리 가드)
│       └── health/
└── WORKLOG.md             의사결정 시간순 기록
```

## Credits

Photographs · Words · Code — **j00n0__**
