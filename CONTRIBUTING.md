# Contributing

Thanks for helping! Small, focused pull requests are easiest to review.

## Setup

```bash
npm install
node tools/install-hooks.mjs   # pre-commit: secret scan + test-case validation
npm test                       # validate + secret scan + selftest
```

## Guidelines

- **No app-specific or private data.** No real URLs, accounts, emails, company names, screenshots or run outputs. Use `example.com` and the TodoMVC demo for examples.
- **Keep tools dependency-free** (Node built-ins). `playwright-core` is the only runtime dependency, used by `tools/browser/`.
- **Security first.** Anything that touches credentials, outputs or the browser must keep the guarantees in `SECURITY.md`.
- **Docs with code.** If you add a flag or a file, update `README.md` / `AGENTS.md` and the relevant playbook.
- **Test cases** follow `protocol/test-case-format.md`; run `node tools/validate-cases.mjs`.
- Adapters for other stacks (React Router, Angular, Next.js, SvelteKit...) are very welcome in `tools/adapters/`; they must write `inventory/routes.json` in the documented shape and be read-only on the app repo.

## Commit messages

Short imperative subject (`Add React Router adapter`), body explaining why if it isn't obvious.
