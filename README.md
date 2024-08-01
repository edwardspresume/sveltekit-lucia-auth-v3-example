# SvelteKit Dev.Team AI

## Testing

### E2E testubg

Uses [playwright](https://playwright.dev/)

Run e2e tests via `pnpm run e2e:test`

### Unit testing

[Testing Svelte components](https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#svelte-component-test-recipes)

## Authentication

Based on the following video tutorial series: [Lucia Auth V3 with SvelteKit](https://youtube.com/playlist?list=PL-thR8qW-CU3ZmizJqrSAatWHh6z_JnS7&si=Qage2gw2mJarmZk4).

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
