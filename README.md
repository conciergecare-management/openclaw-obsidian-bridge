---
license: mit
tags:
  - openclaw
  - obsidian
  - plugin
  - bridge
---

# OpenClaw Obsidian Bridge

Minimal OpenClaw plugin extension that exposes Obsidian status/open helpers through gateway methods and an authenticated HTTP route.

## Methods

- `obsidian.bridge.status`
- `obsidian.bridge.open`
- `POST /hooks/obsidian-bridge`

## Local Check

```bash
npm test
```

The example assumes an `obsidian` helper binary is available. Adapt `index.mjs` for your own host path or wrapper.
