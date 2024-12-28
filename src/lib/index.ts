// place files you want to import through the `$lib` alias in this folder.

import type { Post, Tag } from "@ts-ghost/content-api";
import { writable } from 'svelte/store';

export const postStore = writable<Post[]>([]);
export const tagStore = writable<Tag[]>([]);