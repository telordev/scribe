# scribe

`scribe` is the simse coding-agent CLI. This repository hosts the public release
binaries, the install scripts, and the plugin marketplace catalog.

## Install

```bash
# macOS / Linux
curl -fsSL https://cdn.simse.dev/install.sh | sh

# Windows (PowerShell)
irm https://cdn.simse.dev/install.ps1 | iex
```

Then run `scribe`.

## Plugins

`scribe plugins install <name>` fetches a plugin from the `plugins/` directory
here into your local data dir. Available: see `plugins/`.

## License

Elastic License 2.0 (ELv2). Copyright 2025-2026 Telor, Inc. See [LICENSE](LICENSE).
