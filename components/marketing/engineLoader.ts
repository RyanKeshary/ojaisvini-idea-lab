// Loads the scroll-craft engine as a side effect, in the browser only.
//
// Separate module on purpose: scrollcraft.js is a standalone-page IIFE with
// no exports. TypeScript accepts it as a static side-effect import but rejects
// it inside a dynamic import() (TS2306: "not a module") — and the load must
// stay dynamic because the IIFE reads `window` at module scope, which would
// crash SSR if pulled in statically from a client component.
import "@/scrollcraft/builds/ojasvini-landing/scrollcraft.js";

export {};
