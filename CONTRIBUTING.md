# Contributing to Git-Sentinel

Thank you for your interest in contributing to **Git-Sentinel**! As an open-source project, we rely on contributors like you to keep the project active, secure, and modern.

---

## 🧭 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat everyone with respect and maintain professional collaboration practices.

---

## 🛠️ Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/git-sentinel.git
   cd git-sentinel
   ```
3. **Install** development dependencies:
   ```bash
   npm install
   ```
4. **Create** a branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b bugfix/fix-some-issue
   ```

---

## 📝 Coding Guidelines

- Write clean, type-safe TypeScript.
- Follow the directory structure:
  - Source files in [src/](file:///Users/Erdem/Desktop/hhh/src/)
  - Test files in [tests/](file:///Users/Erdem/Desktop/hhh/tests/)
- Ensure TypeScript compiles successfully before submitting a pull request:
  ```bash
  npm run build
  ```
- Format your code cleanly and maintain descriptive naming conventions for variables, files, and modules.

---

## 🧪 Testing

We require high test coverage for all new feature code.

- Run all unit tests:
  ```bash
  npm run test
  ```
- Run tests in watch mode during development:
  ```bash
  npm run test:watch
  ```
- Check coverage metrics:
  ```bash
  npm run test:coverage
  ```

---

## 🚀 Submitting a Pull Request

1. Ensure all tests pass (`npm run test`) and code builds cleanly (`npm run build`).
2. Commit your changes using Conventional Commits guidelines (e.g. `feat: add AI check to logger`, `fix: handle empty branch names`).
3. Push your branch to GitHub and submit a Pull Request to our `main` branch.
4. Provide a clear description of the problem solved and links to any associated GitHub Issues.

One of our maintainers will review your PR and provide feedback as soon as possible!
