import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_IDS } from './data/categories';

/**
 * The catalogue of productions. One file per production.
 * Everything the CMS writes lands here as frontmatter.
 */
const productions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/productions' }),
  schema: z.object({
    title: z.string(),
    client: z.string().optional(),
    year: z.number(),
    // One or more of the ids in src/data/categories.ts.
    categories: z.array(z.enum(CATEGORY_IDS)).min(1),
    role: z.string().optional(),
    description: z.string().optional(),
    // Vimeo numeric id, e.g. "76979871". Leave empty while placeholding.
    vimeoId: z.string().optional(),
    // Optional override. If absent we fall back to the generated placeholder.
    thumbnail: z.string().optional(),
    // Lower numbers appear first on the wall. Ties fall back to year desc.
    order: z.number().default(999),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/**
 * Per-customer offer pages, published at /offers/<slug>.
 * The slug is the filename, so the file "nationalmuseet.md" becomes
 * /offers/nationalmuseet.
 */
const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: z.object({
    // Shown as the big greeting on the page.
    customer: z.string(),
    date: z.coerce.date(),
    headline: z.string().optional(),
    // The personal note. Blank line between paragraphs.
    intro: z.string(),
    // Ordered list of production ids (filenames without .md).
    productions: z.array(z.string()).default([]),
    // Optional closing line above the contact button.
    outro: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { productions, offers };
