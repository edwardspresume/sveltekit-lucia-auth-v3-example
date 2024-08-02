# SvelteKit Dev.Team AI

A SaaS in development that allows setting up a project with one or more dev teams with AI controlled agents that collaborate to deliver the project according to specs.

## UI system

Uses [shadcn for svelte]()

## Database/ORMs

Currently using

- [Drizzle ORM]()
  - [Turso](https://turso.tech/) SqLite for production
  - [BetterSqlite3]()
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/)

Experimenting with different approaches to find the best fit.

## Payment

Planning to use [Stripe](https://docs.stripe.com/)

### Invoices

- [Invoices](https://docs.stripe.com/api/invoices/object)

Invoices are statements of amounts owed by a customer, and are either generated one-off, or generated periodically from a subscription.
They contain invoice items, and proration adjustments that may be caused by subscription upgrades/downgrades (if necessary).

`payment_intent` nullable string (Expandable)

The `PaymentIntent` associated with this invoice. The PaymentIntent is generated when the invoice is finalized, and can then be used to pay the invoice. Note that voiding an invoice will cancel the PaymentIntent.

### Payment intent

- [Payment intent](https://docs.stripe.com/api/payment_intents/object)
- [Create payment intent](https://docs.stripe.com/api/payment_intents/create)

```ts
`client_secret` nullable string

The client secret of this `PaymentIntent`. Used for client-side retrieval using a publishable key.

The client secret can be used to complete a payment from your frontend. It should not be stored, logged, or exposed to anyone other than the customer. Make sure that you have TLS enabled on any page that includes the client secret.
```

## Testing

### E2E testing

Uses [playwright](https://playwright.dev/)

Run e2e tests via `pnpm run e2e:test`

### Unit testing

[Testing Svelte components](https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#svelte-component-test-recipes)

Run `vitest` or `pnpm run test`

## Authentication

Lucia Auth based on the following video tutorial series: [Lucia Auth V3 with SvelteKit](https://github.com/edwardspresume/sveltekit-lucia-auth-v3-example) with [video tutorial series](https://youtube.com/playlist?list=PL-thR8qW-CU3ZmizJqrSAatWHh6z_JnS7&si=Qage2gw2mJarmZk4).

- Email verification
- Password reset
- OAuth

TODO: Passkeys via [passlock](https://passlock.dev/)

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
