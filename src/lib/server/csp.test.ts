import { describe, expect, it } from 'vitest';
import { allowScript, scriptHash } from './csp.ts';

describe('scriptHash', () => {
	it("is the script's sha256, in CSP's base64 form", () => {
		// echo -n "alert(1)" | openssl sha256 -binary | base64
		expect(scriptHash('alert(1)')).toBe("'sha256-bhHHL3z2vDgxUt0W3dWQOrprscmda2Y5pLsLg4GF+pI='");
	});
});

describe('allowScript', () => {
	it('adds the source to script-src only', () => {
		const policy =
			"default-src 'self'; script-src 'self' https://analytics.example 'sha256-a='; img-src 'self'";
		expect(allowScript(policy, "'sha256-b='")).toBe(
			"default-src 'self'; script-src 'self' https://analytics.example 'sha256-a=' 'sha256-b='; img-src 'self'"
		);
	});

	it('leaves a policy without script-src as it is', () => {
		expect(allowScript("default-src 'self'", "'sha256-b='")).toBe("default-src 'self'");
	});

	it('does not touch script-src-attr or script-src-elem', () => {
		expect(allowScript("script-src-elem 'self'; script-src 'self'", 'x')).toBe(
			"script-src-elem 'self'; script-src 'self' x"
		);
	});
});
