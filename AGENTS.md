# AGENTS.md

Project instructions for AI agents working on this codebase.

## README Maintenance

**Always update `README.md` when making changes that affect the project's surface area.** This is a template repo — the README doubles as documentation and onboarding for anyone bootstrapping a new project from it.

### When to update

| Change | README section to update |
|--------|------------------------|
| Add/remove/upgrade a dependency | Stack table |
| Add a new app or package | Project Structure, Stack table, Commands |
| Add/modify/delete a script in root `package.json` | Commands table |
| Add/modify/delete a `docker-compose.yml` service | Getting Started, Key Features |
| Change environment variables | Getting Started (`.env` step), Key Features |
| New auth flow, permission, or email template | Key Features |
| Significant new feature (any kind) | Key Features |
| Change the design system or theming approach | Stack table, Key Features |
| Change the dev workflow (ports, URLs, tooling) | Getting Started, Commands |

### General rule

If a new user cloning this repo would need to know about the change, put it in the README. When in doubt, update it.

### What NOT to change

- Do **not** modify the **Email Logo** section — it is kept as-is intentionally.
- Do **not** remove the **Customizing for a New Project** section — it guides users adapting this template.

## Code Style

- Use Biome for formatting and linting (`pnpm format`, `pnpm lint`)
- **No comments.** Do not add comments unless explicitly requested by the user. The only exceptions are:
  - Non-obvious explanations — things that cannot be understood by reading the code alone (e.g. why a workaround exists, links to relevant docs/issues).
  - TODOs.
  - Do **not** add comments that merely describe or label what the next section does. If a comment feels essential, ask the user instead of adding it.
- Follow the existing patterns in each package (shadcn/ui style for UI, Drizzle conventions for DB, etc.)

## Conventions

- Monorepo: Turborepo + pnpm workspaces
- Apps live in `apps/`, shared packages in `packages/`
- Package names use the `@repo/` scope (e.g. `@repo/ui`, `@repo/db`)
- All packages are TypeScript
- env vars are validated with `@t3-oss/env-nextjs` — never access `process.env` directly without adding them to the env schema