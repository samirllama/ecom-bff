# GEMINI.md - Project Blueprint

## 1. Core Instructions for Gemini CLI

Execute the following commands to initialize the project structure:

```bash
# Initialize Root
pnpm init

# Create Frontend (React + TS)
mkdir -p frontend/src/{components,pages,hooks,services,store,types,utils}
touch frontend/Dockerfile frontend/package.json

# Create BFF (Node/TS)
mkdir -p bff/src/{routes,services,middleware,types}
touch bff/Dockerfile bff/package.json

# Create Microservices
mkdir -p microservices/product-service microservices/order-service microservices/user-service
touch microservices/product-service/Dockerfile
touch microservices/order-service/Dockerfile
touch microservices/user-service/Dockerfile

# CI/CD & Orchestration
mkdir -p .github/workflows
touch docker-compose.yml .github/workflows/ci.yml
```

## 2. Technical Stack & Standards

- **Package Manager:** `pnpm` (Use recursive commands: `pnpm -r`).
- **Containerization:**
  - Each service must have a multi-stage `Dockerfile` (Build & Run stages).
  - Root `docker-compose.yml` must orchestrate the BFF, Frontend, and Mock Services.
- **Testing Strategy:**
  1. **Unit Tests:** Vitest (Frontend) and Jest/Vitest (BFF) for logic validation.
  2. **Integration Tests:** Supertest for BFF route validation.
  3. **E2E Tests:** Playwright for critical user flows.

## 3. GitHub Actions (CI/CD)

The `.github/workflows/ci.yml` must:

1. Trigger on `pull_request` to `main`.
2. Install `pnpm` using `pnpm/action-setup`.
3. Run `pnpm install` and `pnpm recursive test`.
4. Verify Docker builds for all services.

## Approvals

- **2026-05-06:** Project structure initialization approved.

