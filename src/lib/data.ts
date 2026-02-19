import { Tool, DirectoryCategory, DirectoryTool } from './types';

export const tools: Tool[] = [
  {
    slug: 'keyword-monitor',
    title: 'Keyword Monitor',
    description:
      'Get a daily email with YouTube Shorts that have exploded in views despite low subscriber counts. Track any keyword and find viral niche signals before they saturate.',
    icon: '📡',
    status: 'active',
    category: 'Research',
  },
  {
    slug: 'td-generator',
    title: 'YouTube TD Generator',
    description:
      'Generate SEO-optimized YouTube titles and descriptions with AI. Upload thumbnails for visual context. Provide references and describe your needs.',
    icon: '✍️',
    status: 'active',
    category: 'Content',
  },
  {
    slug: 'youtube-translator',
    title: 'YouTube TD Translator',
    description:
      'Translate your YouTube video titles and descriptions to multiple languages with AI. Connect your account, select videos, and reach a global audience in one click.',
    icon: '🌐',
    status: 'active',
    category: 'Growth',
  },
  {
    slug: 'youtube-thumbnail-downloader',
    title: 'YouTube Thumbnail Downloader',
    description:
      'Download YouTube video thumbnails in all available resolutions — HD, SD, HQ, MQ, and default. Paste any YouTube URL and save thumbnails instantly.',
    icon: '🖼️',
    status: 'active',
    category: 'Design',
  },
  {
    slug: 'object-remover',
    title: 'Object Remover',
    description:
      'Remove logos, watermarks, or any unwanted object from photos with AI. Just brush over the area and let AI fill it in seamlessly.',
    icon: '✂️',
    status: 'active',
    category: 'Design',
  },
  {
    slug: 'thumbnail-analyzer',
    title: 'Thumbnail Analyzer',
    description:
      'Upload your YouTube thumbnail and get AI-powered feedback on composition, text readability, emotional impact, and click-worthiness.',
    icon: '🎨',
    status: 'coming_soon',
    category: 'Design',
  },
  {
    slug: 'script-generator',
    title: 'Script Generator',
    description:
      'Generate engaging video scripts optimized for faceless content. Choose your niche, tone, and length to get a ready-to-record script.',
    icon: '📝',
    status: 'coming_soon',
    category: 'Content',
  },
  {
    slug: 'niche-finder',
    title: 'Niche Finder',
    description:
      'Discover profitable faceless YouTube niches by analyzing competition, search volume, and monetization potential.',
    icon: '🔍',
    status: 'coming_soon',
    category: 'Research',
  },
  {
    slug: 'title-optimizer',
    title: 'Title Optimizer',
    description:
      'Optimize your video titles for maximum CTR. Get AI suggestions based on proven title formulas and search trends.',
    icon: '✨',
    status: 'coming_soon',
    category: 'SEO',
  },
];

export const directoryCategories: DirectoryCategory[] = [
  {
    slug: 'ai-voiceover',
    title: 'AI Voiceover',
    description:
      'Text-to-speech tools that create natural-sounding voiceovers for your faceless videos.',
    icon: '🎙️',
    toolCount: 12,
  },
  {
    slug: 'video-editing',
    title: 'Video Editing',
    description:
      'Video editors optimized for faceless content creation with templates and automation.',
    icon: '🎬',
    toolCount: 15,
  },
  {
    slug: 'thumbnail-design',
    title: 'Thumbnail Design',
    description:
      'Create eye-catching thumbnails that drive clicks without showing your face.',
    icon: '🖼️',
    toolCount: 8,
  },
  {
    slug: 'script-writing',
    title: 'Script & Writing',
    description:
      'AI writing tools to generate scripts, descriptions, and titles for your videos.',
    icon: '✍️',
    toolCount: 10,
  },
  {
    slug: 'stock-footage',
    title: 'Stock Footage',
    description:
      'High-quality stock video, images, and B-roll for faceless video production.',
    icon: '📹',
    toolCount: 9,
  },
  {
    slug: 'music-sfx',
    title: 'Music & SFX',
    description:
      'Royalty-free music and sound effects libraries for YouTube content.',
    icon: '🎵',
    toolCount: 7,
  },
];

export const directoryTools: DirectoryTool[] = [
  {
    slug: 'elevenlabs',
    name: 'ElevenLabs',
    description:
      'Industry-leading AI voice synthesis with ultra-realistic voices and voice cloning capabilities.',
    url: 'https://elevenlabs.io',
    pricing: 'freemium',
    rating: 4.8,
    category: 'ai-voiceover',
    features: [
      'Voice cloning',
      'Multiple languages',
      'Emotional control',
      'API access',
    ],
  },
  {
    slug: 'murf-ai',
    name: 'Murf AI',
    description:
      'Professional AI voiceover studio with 120+ voices in 20+ languages.',
    url: 'https://murf.ai',
    pricing: 'freemium',
    rating: 4.5,
    category: 'ai-voiceover',
    features: [
      'Studio editor',
      'Voice changer',
      'Team collaboration',
      'Commercial license',
    ],
  },
  {
    slug: 'capcut',
    name: 'CapCut',
    description:
      'Free all-in-one video editor with powerful effects, transitions, and AI features.',
    url: 'https://www.capcut.com',
    pricing: 'free',
    rating: 4.6,
    category: 'video-editing',
    features: [
      'Auto captions',
      'Templates',
      'Cloud editing',
      'Mobile + Desktop',
    ],
  },
  {
    slug: 'canva',
    name: 'Canva',
    description:
      'Easy-to-use design platform with thousands of YouTube thumbnail templates.',
    url: 'https://www.canva.com',
    pricing: 'freemium',
    rating: 4.7,
    category: 'thumbnail-design',
    features: [
      'Templates',
      'Brand kit',
      'AI image generation',
      'Team sharing',
    ],
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    description:
      'Versatile AI assistant for generating scripts, titles, descriptions, and content ideas.',
    url: 'https://chat.openai.com',
    pricing: 'freemium',
    rating: 4.7,
    category: 'script-writing',
    features: [
      'Script generation',
      'Title ideas',
      'SEO descriptions',
      'Research',
    ],
  },
  {
    slug: 'pexels',
    name: 'Pexels',
    description:
      'Free stock videos and photos with no attribution required. Perfect for B-roll.',
    url: 'https://www.pexels.com',
    pricing: 'free',
    rating: 4.5,
    category: 'stock-footage',
    features: [
      'No attribution',
      'HD/4K quality',
      'Large library',
      'API access',
    ],
  },
  {
    slug: 'epidemic-sound',
    name: 'Epidemic Sound',
    description:
      'Premium royalty-free music library with 40,000+ tracks for YouTube creators.',
    url: 'https://www.epidemicsound.com',
    pricing: 'paid',
    rating: 4.6,
    category: 'music-sfx',
    features: [
      'YouTube safe',
      'Stems available',
      'Sound effects',
      'Spotify distribution',
    ],
  },
];

export function getToolsByCategory(category: string): DirectoryTool[] {
  return directoryTools.filter((t) => t.category === category);
}

export function getDirectoryTool(
  category: string,
  toolSlug: string
): DirectoryTool | undefined {
  return directoryTools.find(
    (t) => t.category === category && t.slug === toolSlug
  );
}

export function getCategory(slug: string): DirectoryCategory | undefined {
  return directoryCategories.find((c) => c.slug === slug);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
