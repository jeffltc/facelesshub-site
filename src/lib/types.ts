export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'coming_soon';
  category: string;
}

export interface DirectoryTool {
  slug: string;
  name: string;
  description: string;
  url: string;
  pricing: 'free' | 'freemium' | 'paid';
  rating: number;
  category: string;
  features: string[];
  logo?: string;
}

export interface DirectoryCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  toolCount: number;
}
