# AGENTS.md - Real Estate Platform

Full-stack real estate platform for the graduation project. This repo contains:
- a Node.js + Express API
- a Next.js customer/agent web app
- a React + Vite admin portal
- Python AI services for OCR and text moderation
- a shared local TypeScript library used across apps

## Repository Layout
```text
graduation-project/
├── back-end/                           # Express 5 API (TypeScript)
├── front-end/
│   ├── real-estate-landing-page/       # Next.js 16 web app
│   └── uaa/                            # Vite 7 + React 19 admin portal
├── AI/                                 # FastAPI OCR + moderation services
├── library/
│   └── gra-helper/                     # Shared local TS package
├── docker-compose.app.yml              # Full app stack
└── docker-compose.frontend.yml         # Frontend-only stack
```

## Stack
| Area | Stack |
|------|-------|
| Backend | Express 5, TypeScript, MongoDB/Mongoose, Redis, BullMQ, Socket.IO, Swagger |
| Landing app | Next.js 16, React 19, TypeScript, Tailwind 4, Biome, next-intl |
| UAA admin | React 19, Vite 7, TypeScript, Ant Design 6, Tailwind 4, React Query, Redux Toolkit, Vitest |
| AI | Python 3.9, FastAPI, PyTorch 2.0.1, VietOCR, YOLO, Hugging Face moderation |
| Shared library | TypeScript package (`gra-helper`) linked locally into backend and frontends |

## Package Manager Notes
- Root-level helper scripts currently use `npm`.
- Individual JS/TS apps use `pnpm`.
- `gra-helper` is linked locally with `link:` dependencies. If shared helpers change, rebuild that package.

## Common Commands

### Root (`./`)
```bash
npm run dev             # Start backend + landing app together
npm run dev:backend     # Start backend only
npm run dev:frontend    # Start landing app only
npm run install:all     # Install root + backend + landing dependencies with npm
npm run docker:app:up
npm run docker:app:down
npm run docker:be:up
npm run docker:be:down
npm run docker:fe:up
npm run docker:fe:down
```

### Backend (`back-end/`)
```bash
pnpm dev                         # Nodemon dev server
pnpm build                       # TypeScript build + path alias rewrite
pnpm start                       # Run built server
pnpm test                        # Node test runner for main flow test
pnpm worker:email                # Start email worker
pnpm seed:resources
pnpm seed:permissions
pnpm seed:roles
pnpm seed:admin
pnpm seed:bootstrap              # Run all seed scripts in order
pnpm backfill:property-sales
pnpm refresh:agent-leaderboards
pnpm docker:dev
pnpm docker:dev:build
pnpm docker:dev:down
pnpm docker:prod
pnpm docker:prod:down
```

### Frontend UAA (`front-end/uaa/`)
```bash
pnpm dev
pnpm start
pnpm build:stag
pnpm build:prod
pnpm lint
pnpm lint:fix
pnpm format
pnpm pc
pnpm preview
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm json:server
```
Single test examples:
- `pnpm test -- src/path/to/file.test.tsx`
- `pnpm test -- -t "pattern"`

### Frontend Landing (`front-end/real-estate-landing-page/`)
```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
pnpm docker:prod
pnpm docker:prod:down
```

### Shared Library (`library/gra-helper/`)
```bash
pnpm dev
pnpm build
pnpm build:cjs
pnpm build:esm
```

### AI (`AI/`)
```bash
py -3.9 -m venv venv
venv\Scripts\activate
.\venv\Scripts\python.exe -m pip install torch==2.0.1 torchvision==0.15.2 --only-binary=:all:
.\venv\Scripts\python.exe -m pip install patch-ng
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe run.py                # OCR service
.\venv\Scripts\python.exe run_moderation.py     # Moderation service
```

Docker:
```bash
docker build -t ai-ocr-service .
docker run --rm -p 8080:8080 ai-ocr-service

docker build -f Dockerfile.moderation -t ai-moderation-service .
docker run --rm -p 8081:8081 ai-moderation-service
```

Service ports:
- OCR: `http://127.0.0.1:8080`
- Moderation: `http://127.0.0.1:8081`

## Path Aliases
| Project | Alias | Target |
|---------|-------|--------|
| Backend | `@/*`, `@templates/*` | `src/*`, `src/templates/*` |
| UAA | `@/*`, `@shared/*`, `@features/*`, `@styles/*`, `@assets/*` | `src/*`, `src/shared/*`, `src/features/*`, `src/styles/*`, `src/assets/*` |
| Landing | `@/*` | `src/*` |

## Code Style

### Formatting
| Project | Formatter / Linter | Notes |
|---------|---------------------|-------|
| Backend | Prettier | 2 spaces, semicolons, double quotes |
| UAA | Prettier + ESLint | 2 spaces, semicolons, double quotes |
| Landing | Biome | follow repo defaults |
| AI | Existing Python style | keep changes minimal and consistent |

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Backend files | kebab-case suffixes | `auth.controller.ts`, `property.service.ts` |
| Components | PascalCase | `MainLayout.tsx` |
| Hooks / utilities | camelCase with hook prefix where needed | `useDebounce.ts` |
| Feature folders | kebab-case | `agent-manage/` |
| Classes | PascalCase | `AuthService` |
| Functions | camelCase | `getAuthByUsername` |
| Interfaces | `I` prefix in backend models/types | `IAuth`, `IUser` |

### Import Order
1. Path aliases
2. External packages
3. Relative imports
4. Type-only imports where it improves clarity

## Backend Conventions

### Controllers
- Class-based controllers extending `BaseController`
- Handler methods are arrow functions

Example:
```ts
export class AuthController extends BaseController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => this.authService.login(req.body));
  };
}
```

### Services
- Class-based services
- Frequently decorated with `@singleton`

Example:
```ts
@singleton
export class AuthService {
  async getAuthByUsername<T>(username: string): Promise<T | null> {}
}
```

### Validation and Errors
- Request validation uses Zod validators under `src/validators/`
- Validation messages are localized through `src/i18n/validationMessages.ts`
- Business errors use `AppError` and `ErrorCode`

Example:
```ts
throw new AppError(message, 401, ErrorCode.USER_NOT_FOUND);
```

### Backend Feature Areas
- auth and passkeys
- users, roles, permissions, resources
- agents, registrations, leaderboard snapshots
- properties, sales, views, interactions
- reviews, review invitations, AI replies
- schedules, leads, landlords
- notices, chat, uploads, payments
- monitoring, metrics, BullMQ workers

## Frontend Conventions

### UAA Admin
- Uses React Query for server state and Redux Toolkit for shared app state
- Feature code lives mainly under `src/features/`
- Service folders usually contain `config.ts`, `service.ts`, `query.ts`, `mutate.ts`, and `type.d.ts`
- Components are usually arrow functions with default export

Example:
```ts
const Roles = () => {
  return <div>...</div>;
};

export default Roles;
```

### Landing App
- Uses Next.js App Router
- Uses `next-intl` and route-aware layouts
- Contains more than a public landing page: auth, profile, listings, agent dashboard, CRM, scheduling, chat, reviews, landlord flows, and report flows
- Shared client/server utilities live under `src/lib/` and `src/store/`

### Mutation Error Handling
When using React Query mutations in the existing codebase, prefer the established `meta` pattern for messages/source tagging.

Example:
```ts
useMutation({
  mutationFn,
  meta: {
    ERROR_SOURCE: "[Failed]",
    SUCCESS_MESSAGE: "Done",
  },
});
```

## AI Service Notes
- OCR and moderation run as separate FastAPI entrypoints
- OCR image includes local YOLO + VietOCR weights
- Moderation can use the exported Hugging Face model zip placed at `AI/models/hf_moderation_model.zip`
- Main moderation endpoints:
  - `GET /moderation/status`
  - `POST /moderation/predict`
  - `POST /moderation/predict-batch`

## Working Notes For Agents
- Prefer `rg` / `rg --files` for search.
- Do not assume a root pnpm workspace exists.
- Check the relevant app `package.json` before adding scripts or changing build steps.
- If you update shared helpers in `library/gra-helper`, verify affected imports in backend and both frontend apps.
