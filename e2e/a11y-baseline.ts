/**
 * Known serious/critical axe violations per page, recorded when the gate was introduced.
 * Each entry says why it happens and which task removes it. The gate in a11y.ts fails when a
 * listed violation disappears, so remove entries as their fixes land; this list only shrinks.
 *
 * Empty since the redesign: every page passes the gate with no exceptions. Keep it
 * that way; a new violation is fixed, not listed.
 */
export const knownViolations: Record<string, Record<string, string>> = {};
