/**
 * The four categories a production can belong to. This is the only place they
 * are defined — the header buttons, the content schema and the lightbox all
 * read from here.
 *
 * The admin dropdown in public/admin/config.yml (Productions → Categories)
 * has to list the same ids. The build checks this and stops if they differ.
 */
export const CATEGORY_IDS = ['stage', 'cinema', 'documentary', 'commercial'] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  stage: 'Stage',
  cinema: 'Cinema',
  documentary: 'Documentary',
  commercial: 'Commercial',
};

export const CATEGORIES = CATEGORY_IDS.map((id) => ({ id, label: CATEGORY_LABELS[id] }));
