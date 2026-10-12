/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */

module.exports = {
	mode: 'jit',
	content:  [
		"./index.html",
    	"./src/**/*.{js,ts,jsx,tsx}", 
		'./safelist.txt'
	],
	darkMode: 'class',
		theme: {
			fontFamily: {
				sans: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'"Noto Sans"',
					'sans-serif',
				],
				serif: [
					'ui-serif',
					'Georgia',
					'Cambria',
					'"Times New Roman"',
					'Times',
					'serif',
				],
				mono: [
					'"JetBrains Mono"',
					'"Fira Code"',
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'monospace',
				],
			},
			screens: {
				xs: '576px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
			// NOTE: this project's `extend.spacing` below (xs/sm/md/lg/xl,
			// used for margins/padding/gaps) reuses the exact same key names
			// Tailwind's default `maxWidth` scale uses. Tailwind's core
			// `maxWidth` default is a *function* of `theme('spacing')`, and
			// in this version's `@config` (v3-style JS config) compat layer,
			// neither `extend.maxWidth` nor a full top-level `maxWidth`
			// override here actually wins against that -- confirmed by
			// direct production-build experiments: `max-w-md` kept resolving
			// to `spacing.md` (20px) regardless of what's set here. Real bug,
			// reproduced in a real deployed dialog collapsing to ~20px wide.
			// Workaround (applied at every call site instead): use arbitrary
			// values -- `max-w-[28rem]` instead of `max-w-md`, etc. -- which
			// bypass the named scale entirely and compile correctly. Revisit
			// if this project ever upgrades off `@config` to native `@theme`.
			extend: {
				colors: {
					'primary': 'var(--primary)',
					'primary-active': 'var(--primary-active)',
					'primary-deep': 'var(--primary-deep)',
					'primary-mild': 'var(--primary-mild)',
					'primary-subtle': 'var(--primary-subtle)',
					'text-link': 'var(--text-link)',
					'text-link-secondary': 'var(--text-link-secondary)',
					'accent-link-bright': 'var(--accent-link-bright)',
					'accent-warning': 'var(--accent-warning)',
					'accent-preview': 'var(--accent-preview)',
					'canvas': 'var(--canvas)',
					'canvas-soft': 'var(--canvas-soft)',
					'surface-card': 'var(--surface-card)',
					'surface-strong': 'var(--surface-strong)',
					'surface-dark': 'var(--surface-dark)',
					'surface-dark-elevated': 'var(--surface-dark-elevated)',
					'gradient-sky-light': 'var(--gradient-sky-light)',
					'gradient-sky-mid': 'var(--gradient-sky-mid)',
					'hairline': 'var(--hairline)',
					'hairline-soft': 'var(--hairline-soft)',
					'hairline-strong': 'var(--hairline-strong)',
					'ink': 'var(--ink)',
					'body': 'var(--body)',
					'body-strong': 'var(--body-strong)',
					'muted': 'var(--muted)',
					'muted-soft': 'var(--muted-soft)',
					'on-primary': 'var(--on-primary)',
					'on-dark': 'var(--on-dark)',
					'on-dark-soft': 'var(--on-dark-soft)',
					'semantic-error': 'var(--semantic-error)',
					'semantic-success': 'var(--semantic-success)',
					'error': 'var(--error)',
					'error-subtle': 'var(--error-subtle)',
					'success': 'var(--success)',
					'success-subtle': 'var(--success-subtle)',
					'info': 'var(--info)',
					'info-subtle': 'var(--info-subtle)',
					'warning': 'var(--warning)',
					'warning-subtle': 'var(--warning-subtle)',
					'neutral': 'var(--neutral)',
					'gray-50': 'var(--gray-50)',
					'gray-100': 'var(--gray-100)',
					'gray-200': 'var(--gray-200)',
					'gray-300': 'var(--gray-300)',
					'gray-400': 'var(--gray-400)',
					'gray-500': 'var(--gray-500)',
					'gray-600': 'var(--gray-600)',
					'gray-700': 'var(--gray-700)',
					'gray-800': 'var(--gray-800)',
					'gray-900': 'var(--gray-900)',
					'gray-950': 'var(--gray-950)',
				},
				borderRadius: {
					none: '0px',
					xs: '4px',
					sm: '6px',
					md: '8px',
					lg: '12px',
					xl: '16px',
					xxl: '24px',
					pill: '9999px',
				},
				spacing: {
					xxs: '4px',
					xs: '8px',
					sm: '12px',
					base: '16px',
					md: '20px',
					lg: '24px',
					xl: '32px',
					xxl: '48px',
					section: '96px',
				},
				typography: (theme) => ({
					DEFAULT: {
						css: {
							color: theme('colors.body'),
							maxWidth: '65ch',
						},
					},
					invert: {
						css: {
							color: theme('colors.on-dark-soft'),
						},
					},
				}),
			},
		},
	plugins: [
        require('@tailwindcss/typography'),
	],
};

