# typeview

Build stunning, interactive slide decks directly in the terminal with TypeScript. typeview makes CLI presentations simple, elegant, and developer-friendly.

## features

- Create interactive CLI-based slide decks with minimal code
- Beautiful formatting for terminal presentations
- Designed for developers and quick demos
- ESM-first, TypeScript-native APIs

## requirements

- Node.js (version X or higher)
- TypeScript (version X or higher)

## installation

```sh
pnpm add typeview
```

## quick start

Create a simple deck with a single slide:

```ts
// src/demo.ts
import { TypeView } from "typeview";

const tv = new TypeView({ title: "TypeView Demo" });

tv.addSlide({
  title: "Hello",
  content: "Welcome to TypeView 👋",
});

await tv.run();
```

Run it (examples):

```sh
# using tsx (recommended)
pnpm tsx src/demo.ts

# or using ts-node
pnpm ts-node --esm src/demo.ts
```

## contributing

Contributions are welcome! Please submit issues and pull requests.

## license

This project is licensed under the MIT license. See the LICENSE file for details.
