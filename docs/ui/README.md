# UI Screenshots

This folder contains up-to-date UI screenshots from the running dev server.

Captured at desktop viewport 1440x900:

- auth-1440x900.png — Login page
- calls-test-1440x900.png — LiveKit token/join test page
- mcp-test-1440x900.png — MCP GitHub proxy test page

To regenerate PNGs from .b64 files (macOS):

```bash
# From repo root
mkdir -p docs/ui
base64 -D docs/ui/auth.b64       > docs/ui/auth-1440x900.png
base64 -D docs/ui/calls-test.b64 > docs/ui/calls-test-1440x900.png
base64 -D docs/ui/mcp-test.b64   > docs/ui/mcp-test-1440x900.png
```
