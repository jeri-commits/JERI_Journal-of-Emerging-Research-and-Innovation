/** Single source of truth for the journal's name -- every header, footer,
 * auth page, and public page pulls from here instead of hardcoding the
 * string, so a rename is a one-line change instead of a find-and-replace
 * across a dozen files. */
export const SITE_NAME = 'Journal of Emerging Research and Innovation'
export const SITE_ABBR = 'JERI'
export const SITE_NAME_FULL = `${SITE_NAME} (${SITE_ABBR})`
