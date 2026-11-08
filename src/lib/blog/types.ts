/**
 * The blog's own shapes for its content, shared by the server (which maps Ghost onto them) and
 * the pages and components (which render them). Small and stable; lists never carry HTML.
 */

export type TagRef = { slug: string; name: string };

export type PostSummary = {
	slug: string;
	title: string;
	excerpt: string;
	cover: string | null;
	coverAlt: string;
	publishedAt: string | null;
	updatedAt: string | null;
	/** Minutes, as Ghost computes it from the post's HTML. */
	readingTime: number | null;
	/** The first tag is the post's primary tag in Ghost. */
	tag: TagRef | null;
	tags: TagRef[];
	authors: string[];
	featured: boolean;
};

export type Post = PostSummary & { html: string };

export type Tag = TagRef & { count: number };

export type Pagination = { page: number; pages: number; total: number };
