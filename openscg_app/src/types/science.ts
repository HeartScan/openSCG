export interface Study {
  id: string;
  slug: string;
  title: string;
  authors_short: string;
  year: number;
  doi: string;
  cluster: string;
  answer_machine: {
    summary: string;
    key_metric: string;
    accuracy: string;
    n_count: number | null;
    population_brief: string;
    devices: string[];
  };
  appraisal_summary: {
    confidence: 'cornerstone' | 'supporting' | 'preliminary';
    relevance: string;
  };
  content_path: string;
  images: StudyImage[];
  related_ids: string[];
}

export interface StudyImage {
  id: string;
  filename: string;
  path: string;
  caption: string;
  page: number;
}

export interface ScienceHubIndex {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  license: string;
  version: string;
  datePublished: string;
  keywords: string[];
  hasPart: any[];
}
