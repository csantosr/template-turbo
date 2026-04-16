# Template Turbo

A monorepo template for bootstrapping web projects with a standardized full-stack setup, consistent code style, and ready-to-use authentication, RBAC, and email flows. Built on [Turborepo](https://turborepo.dev) and [pnpm](https://pnpm.io) workspaces.

## Stack

| Area          | Technology                                                              |
| ------------- | ----------------------------------------------------------------------- |
| Monorepo      | Turborepo + pnpm workspaces                                             |
| Web Framework | Next.js 16 (App Router, React 19)                                       |
| API           | tRPC v11 + TanStack Query v5                                            |
| Auth          | Better Auth (email+password, admin plugin, RBAC)                        |
| Database      | PostgreSQL 16                                                           |
| ORM           | Drizzle ORM (postgres.js driver)                                        |
| Validation    | Zod v4                                                                  |
| Email         | React Email + Resend (prod) / Nodemailer + Mailpit (dev)                |
| UI            | Radix UI + CVA + shadcn/ui pattern, Tailwind CSS v4                     |
| Markdown      | react-markdown + remark-gfm                                             |
| Styling       | Brutalist theme (no border-radius, monospace, heavy borders, dark mode) |
| Lint/Format   | Biome v2                                                                |
| Icons         | Phosphor Icons                                                          |
| Env           | @t3-oss/env-nextjs                                                      |

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- Docker (for PostgreSQL and Mailpit)

### Setup

1. Clone this template and rename to your project:

   ```sh
   git clone <this-repo> my-project && cd my-project
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Copy the environment file and fill in your values:

   ```sh
   cp apps/web/.env.example apps/web/.env
   ```

4. Start the infrastructure (PostgreSQL + Mailpit):

   ```sh
   docker compose up -d
   ```

5. Generate the database schema and run migrations:

   ```sh
   pnpm db:generate
   pnpm db:migrate
   ```

6. Start the dev server:

   ```sh
   pnpm dev
   ```

The web app runs at `http://localhost:3000`. Mailpit is available at `http://localhost:8025`.

## Project Structure

```
apps/
  web/               # Next.js application
packages/
  db/                # Drizzle ORM schema, client, and migrations
  email/             # React Email templates and sendEmail utility
  ui/                # Shared UI component library
  validators/        # Zod schemas and RBAC permissions
  typescript-config/ # Shared TSConfig profiles
```

## Key Features

- **Authentication** — Email+password sign up/sign in, email verification, password reset, session management
- **RBAC** — Role-based access control with superadmin, admin, and member roles; per-user permission overrides
- **Email** — Production-ready templates (welcome, verify, reset password, invite) with local SMTP testing via Mailpit
- **tRPC API** — End-to-end type-safe API with TanStack Query integration
- **Brutalist Design System** — Consistent UI theme with dark mode support, zero border-radius, monospace typography
- **Type-Safe Environment** — Validated env vars via @t3-oss/env-nextjs

## Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start Docker services + dev server |
| `pnpm build`       | Build all apps and packages        |
| `pnpm lint`        | Lint all packages with Biome       |
| `pnpm format`      | Format all files with Biome        |
| `pnpm db:generate` | Generate Drizzle migrations        |
| `pnpm db:migrate`  | Run database migrations            |
| `pnpm db:studio`   | Open Drizzle Studio                |

Run commands for a specific package using filters:

```sh
turbo dev --filter=web
turbo build --filter=@repo/db
```

## Email Logo

The email package (`packages/email`) embeds the logo as a base64 PNG data URI inside `email-layout.tsx`. SVGs don't render reliably in email clients (`currentColor`, `<text>`, external resources all fail), so the logo must be converted to a PNG data URI.

When you change the logo in `apps/web/public/logo.svg`, regenerate the data URI:

```sh
magick convert -background none -density 300 -resize 300x64 apps/web/public/logo.svg /tmp/logo-email.png
base64 -w0 /tmp/logo-email.png
```

Then update the `LOGO_DATA_URI` constant in `packages/email/emails/email-layout.tsx` with the new base64 string prefixed by `data:image/png;base64,`.

## Customizing for a New Project

When using this template for a new project:

1. Search and replace `template-turbo` with your project name across all `package.json` files
2. Update `apps/web/.env.example` with your project's environment variables
3. Replace `apps/web/public/logo.svg` and regenerate the email logo data URI (see above)
4. Modify the Drizzle schema in `packages/db` to match your data model
5. Add or modify tRPC routers in `apps/web/src/server`
6. Customize the RBAC permissions in `packages/validators/permissions.ts`
7. Update the email templates in `packages/email/emails` with your branding

## License

MIT

