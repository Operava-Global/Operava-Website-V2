export type LegalBlock =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'defs'; items: { term: string; text: string }[] }
  | { t: 'formula'; text: string }
  | { t: 'note'; text: string }
  | { t: 'contact'; lines: string[]; email?: string; extra?: { label: string; value: string; href: string }[] }

export interface LegalSection {
  num: string
  title: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  title: string
  effective: string
  jurisdiction: string
  contact: string
  source: string
  sections: LegalSection[]
}
