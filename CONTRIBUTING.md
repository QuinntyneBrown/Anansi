# Contributing to Anansi

Thank you for your interest in contributing to Anansi! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Anansi.git
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Docker](https://www.docker.com/) (for local infrastructure)

### Running Locally

1. Start infrastructure services:
   ```bash
   docker-compose up -d
   ```
2. Run the API:
   ```bash
   dotnet run --project src/Anansi.Api
   ```
3. Run the Angular frontend:
   ```bash
   cd src/Anansi.Web
   npm install
   ng serve
   ```

## Making Changes

- Keep changes focused and scoped to a single concern
- Follow existing code style and conventions
- Write or update tests for your changes
- Ensure all existing tests pass before submitting

### Backend (.NET)

- Follow the existing project structure and patterns
- Add acceptance tests in `tests/Anansi.Tests.Acceptance/`

### Frontend (Angular)

- Components live in `src/Anansi.Web/projects/`
- Include unit tests (`.spec.ts`) for new components and services

## Submitting a Pull Request

1. Commit your changes with a clear, descriptive message
2. Push your branch to your fork
3. Open a pull request against the `main` branch
4. Describe what your changes do and why

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Include steps to reproduce for bug reports
- Check existing issues before creating a new one

## Code of Conduct

Be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
