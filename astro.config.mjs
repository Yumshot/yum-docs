// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://yumshot.github.io/yum-docs', // Set to the GitHub Pages URL
	outDir: 'docs', // GitHub Pages serves from the 'docs' folder.
	integrations: [mdx(), sitemap()],
	base: '/yum-docs/', // Set the base to the repository name
});

