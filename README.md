# yamjune's TreeCast

A mind-map presentation tool built with Electron + React + TypeScript. Organize and present content hierarchically — navigate a tree of nodes with keyboard, expand detail panels with rich Markdown, math formulas, images, GIFs, and videos.

![demo](demo.gif)

## Features

- **Tree-structured slides** — content authored as a single `context.md` with ATX headings (`#`, `##`, `###` ...)
- **Rich detail panels** — Markdown rendering, KaTeX math (inline `$...$` and display `$$...$$`), images, GIFs, videos
- **Keyboard-driven navigation** — arrow keys traverse the tree; Enter toggles title/detail mode; Tab expands/collapses children
- **Smooth animations** — spring-physics transitions via framer-motion, staggered child appearance, focus tracking
- **Theme support** — Light / Dark / Gray modes with glassmorphism UI
- **i18n** — Chinese and English interface

## Getting Started

```bash
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run package    # Package into Windows installer
```

## Project Structure

```
├── src/
│   ├── main/           # Electron main process (IPC, window management)
│   ├── preload/        # Preload scripts
│   └── renderer/       # React UI
│       ├── components/ # Canvas, nodes, shell
│       ├── engine/     # Tree layout, navigation, markdown/Katex rendering
│       ├── hooks/      # Keyboard nav, camera, virtualization
│       ├── i18n/       # Translations (en/zh)
│       ├── security/   # DOMPurify sanitization
│       └── store/      # Zustand state management
├── sample/             # Sample context.md
├── tests/              # Vitest tests
└── resources/          # Build resources (icons)
```

## Usage

1. Launch the app and click **Start** to open a `context.md` file
2. `↑` `↓` `←` `→` — navigate between nodes
3. `Enter` — toggle title / detail mode
4. `Tab` — expand or collapse child nodes
5. `+` `-` — zoom detail panel; scroll wheel zooms nodes
6. Right-click drag — pan canvas

## Workspace Layout

```
your-workspace/
├── context.md     # Main content file (required)
├── images/        # Images & media (auto-created)
└── videos/        # Videos (auto-created)
```

## License

MIT
