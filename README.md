# SvelteKit Dev.Team AI

A SaaS in development that allows setting up a project with one or more dev teams with AI controlled agents that collaborate to deliver the project according to specs.

## UI system

Uses [shadcn for svelte]()

## Database/ORMs

Currently using [Drizzle ORM]() and [Prisma]()

## Payment

Planning to use [Stripe]()

## Testing

### E2E testing

Uses [playwright](https://playwright.dev/)

Run e2e tests via `pnpm run e2e:test`

### Unit testing

[Testing Svelte components](https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#svelte-component-test-recipes)

Run `vitest` or `pnpm run test`

## Authentication

Based on the following video tutorial series: [Lucia Auth V3 with SvelteKit](https://youtube.com/playlist?list=PL-thR8qW-CU3ZmizJqrSAatWHh6z_JnS7&si=Qage2gw2mJarmZk4).

## Vite plugins

- [kit routes](https://www.kitql.dev/docs/tools/06_vite-plugin-kit-routes) to automatically generate and update a routes table based on `+pages.svelte` files in `routes` folder
- [enhanced images](https://kit.svelte.dev/docs/images#sveltejs-enhanced-img) to use enhanced images
- [sveltekit-api-generator](https://github.com/langscot/sveltekit-api-generator) to auto-generate OpenAPI with Swagger webiste hosted at `/swagger-ui`

Also see [Sync Your SvelteKit Frontend with Backend Using OpenAPI](https://www.launchnow.pro/blog/sveltekit-openapi-sdk-generation)

## Prerequisites

- [pnpm](https://pnpm.io/) must be installed as this project uses it as the package manager.

## Setup

1. **Database folder** Create a `/localDB` folder in the root of the project which will contain the database file `sqlite.db`

2. **Install Dependencies**: Run the following command to install the project dependencies:

   ```zsh
   pnpm install
   ```

3. **Environment Variables**: Create a `.env` file in the root directory of the project. Use the `.env.example` file as a reference.

4. **Database Setup**: Run the following commands to set up the database:

   ```zsh
   pnpm db:generate
   pnpm db:push
   ```

5. **Run the Project**: Run the following command to start the development server:

   ```zsh
   pnpm dev
   ```
