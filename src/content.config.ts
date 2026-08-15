import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import site from './data/site.json';

// Categories are defined once, in src/data/site.json. Adding one there and in
// public/admin/config.yml is all it takes — nothing here needs editing.
const CATEGORY_IDS = site.categories.map((c) => c.id);
const category = z
  .string()
  .refine((v) => CATEGORY_IDS.includes(v), {
    message: `Unknown category. Valid ids (from src/data/site.json): ${CATEGORY_IDS.join(', ')}`,
  });

/**
 * The catalogue of productions. One file per production.
 * Everything the CMS writes lands here as frontmatter.
 */
const productions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/productions' }),
  schema: z.object({
    title_da: z.string(),
    title_en: z.string().optional(),
    client: z.string().optional(),
    year: z.number(),
    category,
    role_da: z.string().optional(),
    role_en: z.string().optional(),
    description_da: z.string().optional(),
    description_en: z.string().optional(),
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
    headline_da: z.string().optional(),
    headline_en: z.string().optional(),
    // The personal note. Markdown.
    intro_da: z.string(),
    intro_en: z.string().optional(),
    // Ordered list of production ids (filenames without .md).
    productions: z.array(z.string()).default([]),
    // Optional closing line above the contact button.
    outro_da: z.string().optional(),
    outro_en: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { productions, offers };
