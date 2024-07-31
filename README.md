# SvelteKit Authentication with Lucia V3: An Example Project

This example project showcases how to integrate Lucia V3 for user authentication in a SvelteKit application. User data is stored in a local SQLite database. The project is split into branches, each demonstrating a different aspect of the authentication process. Each branch builds on top of the previous one, with the last branch being the most comprehensive and up-to-date.

## Project Branches

- [Main Branch](https://github.com/edwardspresume/sveltekit-lucia-auth-v3-example/tree/main)
- [Email Verification Branch](https://github.com/edwardspresume/sveltekit-lucia-auth-v3-example/tree/email_verification)
- [Password Reset Branch](https://github.com/edwardspresume/sveltekit-lucia-auth-v3-example/tree/password_reset)
- [Oauth & account linking Branch](https://github.com/edwardspresume/sveltekit-lucia-auth-v3-example/tree/oauth)

For a guide on how to implement these features, check out the video tutorial series: [Lucia Auth V3 with SvelteKit](https://youtube.com/playlist?list=PL-thR8qW-CU3ZmizJqrSAatWHh6z_JnS7&si=Qage2gw2mJarmZk4).

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
