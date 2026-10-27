# Known noise

Console messages and requests that are **not** findings. Add to this list when an agent reports something harmless repeatedly.

## Console (substring match)
- Framework dev-mode banners (e.g. "Download the Vue Devtools extension", "React DevTools")
- Dev-server HMR messages (`[vite] connecting...`, `[webpack-dev-server]`)
- `ResizeObserver loop limit exceeded` / `ResizeObserver loop completed with undelivered notifications`
- Third-party analytics or ad-blocker failures (`googletagmanager`, `google-analytics`, `hotjar`, `segment`)

## Network
- `404` for `/favicon.ico` (the TodoMVC demo has none)
- `401` from the "who am I" request on public pages before sign-in
- Requests blocked by the browser or an extension (`ERR_BLOCKED_BY_CLIENT`)
- WebSocket reconnects that succeed within 10 s
