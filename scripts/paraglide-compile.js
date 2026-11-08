// Generates src/lib/paraglide without running Vite, so svelte-check can resolve
// the message modules on a fresh checkout (the folder is generated, not committed).
import { compile } from '@inlang/paraglide-js';
import options from '../paraglide.config.js';

await compile(options);
