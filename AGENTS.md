# AGENTS.md - Real Estate Platform

Full-stack Real Estate Platform with AI capabilities (graduation project).

## Project Structure
```
graduation-project/
├── back-end/                           # Node.js Express API (TypeScript)
├── front-end/
│   ├── real-estate-landing-page/       # Next.js 16 public website
│   └── uaa/                            # Vite React 19 admin portal
└── AI/                                 # Python FastAPI OCR microservice
```

## Stack
| Component | Stack |
|-----------|-------|
| Backend | Express 5, TypeScript, MongoDB/Mongoose, Redis, BullMQ |
| Landing | Next.js 16, TypeScript, Tailwind 4, Biome |
| UAA Admin | React 19, Vite 7, Ant Design 6, Tailwind 4 |
| AI | Python 3.9, FastAPI, PyTorch 2.0.1, VietOCR |

**Package Manager:** pnpm (all JS/TS projects)

## Build/Lint/Test Commands

### Backend (`back-end/`)
```bash
pnpm dev          # Dev server with nodemon
pnpm build        # TypeScript build (tsc + tsc-alias)
pnpm docker:dev   # Docker Compose with Redis
```

### Frontend UAA (`front-end/uaa/`)
```bash
pnpm dev          # Vite dev server
pnpm build:stag   # Build for staging
pnpm build:prod   # Build for production
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Run Prettier
pnpm pc           # Pre-commit: lint + format
pnpm test         # Run Vitest
pnpm test:watch   # Vitest watch mode
pnpm test:coverage
```
**Single test:** `pnpm test -- src/path/to/file.test.tsx` or `pnpm test -- -t "pattern"`

### Frontend Landing (`front-end/real-estate-landing-page/`)
```bash
pnpm dev      # Next.js dev server
pnpm build    # Production build
pnpm lint     # Biome check
pnpm format   # Biome format
```

### AI Service (`AI/`)
```bash
py -3.9 -m venv venv && venv\Scripts\activate
pip install torch==2.0.1 torchvision==0.15.2 --only-binary=:all:
pip install -r requirements.txt
python run.py
```

## Code Style

### Formatting
| Setting | Prettier (Backend/UAA) | Biome (Landing) |
|---------|------------------------|-----------------|
| Indent | 2 spaces | 2 spaces |
| Semicolons | Required | Default |
| Quotes | Double (`"`) | Default |
| Trailing commas | `"all"` | Default |

### Path Aliases
| Project | Alias | Path |
|---------|-------|------|
| Backend | `@/` | `src/` |
| UAA | `@/`, `@shared/`, `@features/` | `src/`, `src/shared/`, `src/features/` |
| Landing | `@/` | `src/` |

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Backend files | kebab-case.type.ts | `auth.controller.ts` |
| Components | PascalCase | `MainLayout.tsx` |
| Hooks/Utils | camelCase | `useDebounce.ts` |
| Feature folders | kebab-case | `user-manage/` |
| Classes | PascalCase | `AuthService` |
| Functions | camelCase | `getAuthByUsername` |
| Interfaces (Backend) | `I` prefix | `IAuth`, `IUser` |
| React hooks | `use` prefix | `useGetRoles` |

### Import Order
1. Path alias imports (`@/`, `@shared/`)
2. External packages (`react`, `express`)
3. Relative imports (`./`, `../`)
4. Type imports

### Backend Patterns

**Controllers:** Class-based with arrow methods
```typescript
export class AuthController extends BaseController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => this.authService.login(req.body));
  };
}
```

**Services:** Class-based with `@singleton`
```typescript
@singleton
export class AuthService {
  async getAuthByUsername<T>(username: string): Promise<T | null> { }
}
```

**Validation:** Zod with i18n
```typescript
export const loginSchema = (lang) => z.object({
  body: z.object({ username: z.string({ error: t.required("Username") }) }),
});
```

**Errors:** `throw new AppError(message, 401, ErrorCode.USER_NOT_FOUND)`

### Frontend Patterns

**Feature structure:**
```
features/feature-name/
├── index.tsx
├── components/
├── services/
│   ├── config.ts    # Endpoints & query keys
│   ├── service.ts   # API calls (static class)
│   ├── query.ts     # useGetXxx hooks
│   ├── mutate.ts    # useCreate/Update/Delete hooks
│   └── type.d.ts
```

**React Query naming:** `useGetRoles`, `useCreateRole`, `useDeleteRole`

**Components:** Arrow functions with default export
```typescript
const Roles = () => {
  const { mutateAsync } = useDeleteRole();
  return <div>...</div>;
};
export default Roles;
```

**State:** Redux Toolkit (global) + React Query (server)

**Error handling:** Use `meta` in mutations
```typescript
useMutation({ mutationFn, meta: { ERROR_SOURCE: "[Failed]", SUCCESS_MESSAGE: "Done" } });
```

**Next.js:** Use `"use client"`, App Router (`layout.tsx`, `page.tsx`)
