export type Lang = 'da' | 'en';

export const ui = {
  da: {
    work: 'Arbejde',
    about: 'Om',
    contact: 'Kontakt',
    all: 'Alle',
    selected: 'Udvalgt',
    archive: 'Arkiv',
    close: 'Luk',
    watch: 'Se film',
    year: 'År',
    client: 'Kunde',
    role: 'Rolle',
    category: 'Kategori',
    productions: 'produktioner',
    noVideo: 'Videoen er ikke koblet på endnu — her kommer Vimeo-afspilleren.',
    offerFor: 'Til',
    offerIntroLabel: 'Et par ord',
    offerSelection: 'Udvalgte film',
    offerContact: 'Skriv til mig',
    offerCall: 'Ring op',
    backToSite: 'Se hele porteføljen',
    aboutTitle: 'Om mig',
    written: 'Skrevet',
    langLabel: 'English',
    langHref: '/en',
    skip: 'Gå til indhold',
    prev: 'Forrige',
    next: 'Næste',
    filterLabel: 'Filtrer efter kategori',
  },
  en: {
    work: 'Work',
    about: 'About',
    contact: 'Contact',
    all: 'All',
    selected: 'Selected',
    archive: 'Archive',
    close: 'Close',
    watch: 'Watch',
    year: 'Year',
    client: 'Client',
    role: 'Role',
    category: 'Category',
    productions: 'productions',
    noVideo: 'This video is not connected yet — the Vimeo player goes here.',
    offerFor: 'For',
    offerIntroLabel: 'A few words',
    offerSelection: 'Selected films',
    offerContact: 'Get in touch',
    offerCall: 'Call me',
    backToSite: 'See the full portfolio',
    aboutTitle: 'About',
    written: 'Written',
    langLabel: 'Dansk',
    langHref: '/',
    skip: 'Skip to content',
    prev: 'Previous',
    next: 'Next',
    filterLabel: 'Filter by category',
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}

/** Prefix a root-relative path with the language segment. */
export function localePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'da') return clean === '/' ? '/' : clean;
  return clean === '/' ? '/en' : `/en${clean}`;
}

/** Pick a bilingual field, falling back to Danish. */
export function pick(
  lang: Lang,
  da: string | undefined,
  en: string | undefined
): string {
  if (lang === 'en') return (en && en.trim()) || da || '';
  return da || '';
}
