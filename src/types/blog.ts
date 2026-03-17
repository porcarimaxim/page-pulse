export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  author: string;
  category: "comparison" | "tutorial" | "industry" | "technical";
  readTime: string;
  heroSubtitle: string;
  sections: {
    heading: string;
    content: string;
  }[];
  cta: {
    text: string;
    link: string;
  };
  relatedSlugs: string[];
}
