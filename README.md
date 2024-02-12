# Lucia V3 - SvelteKit Authentication Example Project

This project demonstrates how to set up a SvelteKit application with Lucia V3 for authentication, using a local SQLite database to store user data.

## Prerequisites

- Ensure you have [pnpm](https://pnpm.io/) installed. This project uses `pnpm` as the package manager.

## Setup

1. **Environment Variables**: Create a `.env` file in the root directory of the project. Use the `.env.example` file as a reference.

2. **Database Setup**: Run the following commands to set up the database:

   ```zsh
   pnpm db:generate
   pnpm db:push
   ```
