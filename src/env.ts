import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';

/** Required when the server starts; optional while building (no page needs Ghost to build). */
const required = (name: string) => (value: string | undefined) => {
	if (!value && !building) throw new Error(`${name} is not set (see .env.example)`);
	return value ?? '';
};

export const variables = defineEnvVars({
	GHOST_URL: {
		description:
			"Base URL of the Ghost instance the blog reads from: the Ghost server's own address in production, https://amun.pl in development.",
		schema: required('GHOST_URL')
	},
	GHOST_CONTENT_KEY: {
		description:
			"Ghost Content API key (read-only, public content). Ghost's Settings → Integrations.",
		schema: required('GHOST_CONTENT_KEY')
	}
});
