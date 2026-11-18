---
trigger: always_on
---

# Git Commit Rules

- Always split changes into small, logical, single-purpose commits.
- Always write commit messages in **English**.
- Always follow **Conventional Commits** (`<type>(<scope>): <subject>`), using types such as `feat`, `fix`, `style`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, or `revert`.
- Keep the commit header concise (100 characters max) and descriptive.
- Every commit is validated by Husky + Commitlint (`commitlint.config.mjs`).
