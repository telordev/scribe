# scribe

`scribe` is the simse coding-agent CLI. This repository hosts the public release
binaries, the install scripts, and the plugin marketplace catalog.

## Install

```bash
# Linux
curl -fsSL https://cdn.simse.dev/install.sh | sh

# Windows (PowerShell)
irm https://cdn.simse.dev/install.ps1 | iex
```

Then run `scribe`. The installers verify every download against the release's
`SHA256SUMS` and refuse an archive they cannot verify.

## Platforms

Release archives are published for Linux on x86_64 and aarch64, and for Windows
on x86_64. Windows on ARM installs the x86_64 build, which it runs under its
built-in emulation. macOS archives are not published yet.

## Plugins

`scribe plugins install <name>` fetches a plugin from the `plugins/` directory
here into your local data dir. Available: see `plugins/`.

## License

Elastic License 2.0 (ELv2). Copyright 2025-2026 Telor. See [LICENSE](LICENSE).
