# OpenSCG Application

This directory contains the main Next.js application for the OpenSCG project.

It includes:
- **Patient PWA:** For capturing accelerometer data.
- **Expert Viewer:** For real-time signal visualization.
- **API Routes:** Handling session management and data persistence.
- **Custom Server:** A `Socket.io` integration for real-time streaming.

## Development

To start the development server, use the helper script in the root directory:
```powershell
.\dev.ps1
```

Or run manually from this directory:
```bash
pnpm install
pnpm run dev
```

## Documentation

For full project information, architecture details, and deployment guides, please refer to the [root README](../README.md) and the `docs/` folder.
