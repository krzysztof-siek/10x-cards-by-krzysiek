# 10x-cards-by-krzysiek

## Description

10x-cards is a web application that enables users to quickly create and manage educational flashcards. It leverages LLM models via an API to generate flashcard suggestions based on user-provided text and supports manual creation, spaced repetition study sessions, and compliance with GDPR.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)
- [Testing](#testing)

## Tech Stack

- **Frontend:** Astro 5, React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication)
- **AI Integration:** Openrouter.ai (LLM models)
- **Testing:**
  - **Unit/Component Testing:** Vitest, React Testing Library
  - **Integration Testing:** Vitest with Supabase test client
  - **E2E Testing:** Playwright
  - **Test Automation:** GitHub Actions
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean

## Getting Started

### Prerequisites

- Node.js v22.14.0 (see `.nvmrc`)
- npm (bundled with Node.js)
- Environment variables for external services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<username>/10x-cards.git
   cd 10x-cards
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add the following variables:
   ```bash
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   OPENROUTER_API_KEY=
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

To build for production and preview:

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev` — Start the Astro development server
- `npm run build` — Build the project for production
- `npm run preview` — Preview the production build locally
- `npm run astro` — Run Astro CLI commands
- `npm run lint` — Lint the codebase with ESLint
- `npm run lint:fix` — Lint and automatically fix issues
- `npm run format` — Format code with Prettier
- `npm run test` — Run unit and component tests with Vitest
- `npm run test:e2e` — Run end-to-end tests with Playwright
- `npm run test:coverage` — Generate test coverage report

## Project Scope

### In Scope (MVP)

1. **Automatic flashcard generation**: Paste text (1k–10k characters), send to LLM, receive Q&A proposals; accept, edit, or reject.
2. **Manual creation & management**: Create, edit, delete flashcards via a form and list view.
3. **User authentication**: Registration, login, and account deletion.
4. **Spaced repetition sessions**: Integrate an external SRS algorithm for study sessions.
5. **Data storage & security**: Store user and flashcard data in Supabase; enforce access control.
6. **Metrics tracking**: Count generated and accepted flashcards.
7. **GDPR compliance**: Support user data access and deletion requests.

### Out of Scope (MVP)

- Gamification features
- Mobile applications
- Import from PDF, DOCX, etc.
- Publicly available API
- Flashcard sharing between users
- Advanced notification system
- Advanced search/filtering

## Project Status

This project is currently in **MVP development** stage. Core features are implemented, and ongoing work includes refining AI integration, completing user flows, and setting up CI/CD pipelines.

## License

_No license specified._ Please add a `LICENSE` file to define the project's licensing.

## Testing

This project includes both unit testing with Vitest and E2E testing with Playwright.

### Unit Tests (Vitest)

Unit tests are used to test individual components and functions in isolation.

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

E2E tests are used to test the application from a user's perspective.

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Directory Structure

- `tests/` - Vitest setup and configuration
- `playwright/` - Playwright tests and configuration
  - `playwright/tests/` - Test files
  - `playwright/pages/` - Page objects for the Page Object Model pattern
  - `playwright/fixtures/` - Test fixtures including accessibility testing

### Test Guidelines

- Write unit tests for individual components and utility functions
- Write E2E tests for critical user flows
- Use Page Object Model pattern for E2E tests to improve maintainability
- Include accessibility tests to ensure the application is accessible to all users
