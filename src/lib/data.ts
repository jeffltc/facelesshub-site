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
    slug: 'competitor-monitor',
    title: 'Competitor Monitor',
    description:
      'Track rival YouTube channels and get daily alerts when their Shorts go viral. Stay ahead of competitors by spotting winning formats before they saturate your niche.',
    icon: '📊',
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
  // ── AI Voiceover (12) ──────────────────────────────────────────
  {
    slug: 'elevenlabs',
    name: 'ElevenLabs',
    description:
      'Industry-leading AI voice synthesis with ultra-realistic voices and voice cloning capabilities.',
    url: 'https://elevenlabs.io',
    pricing: 'freemium',
    rating: 4.8,
    category: 'ai-voiceover',
    features: ['Voice cloning', 'Multiple languages', 'Emotional control', 'API access'],
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
    features: ['Studio editor', 'Voice changer', 'Team collaboration', 'Commercial license'],
  },
  {
    slug: 'play-ht',
    name: 'Play.ht',
    description:
      'AI text-to-speech platform with 900+ voices across 140+ languages and ultra-realistic Ultra voices.',
    url: 'https://play.ht',
    pricing: 'freemium',
    rating: 4.5,
    category: 'ai-voiceover',
    features: ['900+ voices', 'WordPress plugin', 'Podcast hosting', 'API access'],
  },
  {
    slug: 'speechify',
    name: 'Speechify',
    description:
      'AI text-to-speech tool popular with creators for converting scripts into natural audio.',
    url: 'https://speechify.com',
    pricing: 'freemium',
    rating: 4.4,
    category: 'ai-voiceover',
    features: ['Celebrity voices', 'Chrome extension', 'Mobile app', 'Speed control'],
  },
  {
    slug: 'lovo-ai',
    name: 'Lovo AI',
    description:
      'Professional voiceover and text-to-speech platform with 500+ voices and an integrated video editor.',
    url: 'https://lovo.ai',
    pricing: 'freemium',
    rating: 4.4,
    category: 'ai-voiceover',
    features: ['500+ voices', 'Integrated editor', 'Sound effects', 'Voice cloning'],
  },
  {
    slug: 'replica-studios',
    name: 'Replica Studios',
    description:
      'AI voice actor platform built for creators and game developers with expressive, emotional voices.',
    url: 'https://replicastudios.com',
    pricing: 'freemium',
    rating: 4.3,
    category: 'ai-voiceover',
    features: ['Emotional control', 'Character voices', 'Studio quality', 'Bulk export'],
  },
  {
    slug: 'voicemaker',
    name: 'Voicemaker',
    description:
      'Affordable text-to-speech converter with 1000+ voices powered by AWS, Google, and Azure.',
    url: 'https://voicemaker.in',
    pricing: 'freemium',
    rating: 4.2,
    category: 'ai-voiceover',
    features: ['1000+ voices', 'SSML support', 'MP3/WAV export', 'Bulk conversion'],
  },
  {
    slug: 'narakeet',
    name: 'Narakeet',
    description:
      'Turn scripts into voiceover videos quickly with automated timing and subtitle generation.',
    url: 'https://www.narakeet.com',
    pricing: 'freemium',
    rating: 4.2,
    category: 'ai-voiceover',
    features: ['Script to video', 'Auto subtitles', '100+ languages', 'Slide sync'],
  },
  {
    slug: 'listnr',
    name: 'Listnr',
    description:
      'AI voice generator and podcast hosting platform with 900+ voices in 75+ languages.',
    url: 'https://listnr.com',
    pricing: 'freemium',
    rating: 4.1,
    category: 'ai-voiceover',
    features: ['Podcast hosting', '900+ voices', 'Audio widget', 'Analytics'],
  },
  {
    slug: 'wellsaid-labs',
    name: 'WellSaid Labs',
    description:
      'Enterprise-grade AI voiceover platform trusted by leading brands for professional content.',
    url: 'https://wellsaidlabs.com',
    pricing: 'paid',
    rating: 4.5,
    category: 'ai-voiceover',
    features: ['Studio quality', 'Brand voices', 'Team workspace', 'API access'],
  },
  {
    slug: 'resemble-ai',
    name: 'Resemble AI',
    description:
      'AI voice cloning and real-time voice synthesis platform for creators and enterprises.',
    url: 'https://www.resemble.ai',
    pricing: 'freemium',
    rating: 4.3,
    category: 'ai-voiceover',
    features: ['Voice cloning', 'Real-time synthesis', 'Emotion injection', 'API access'],
  },
  {
    slug: 'tiktok-tts',
    name: 'TikTok Text-to-Speech',
    description:
      'The viral TikTok voice generator — free to use via third-party tools for faceless content.',
    url: 'https://tiktokvoice.net',
    pricing: 'free',
    rating: 4.0,
    category: 'ai-voiceover',
    features: ['Iconic voices', 'Free to use', 'Instant generation', 'MP3 download'],
  },

  // ── Video Editing (15) ─────────────────────────────────────────
  {
    slug: 'capcut',
    name: 'CapCut',
    description:
      'Free all-in-one video editor with powerful effects, transitions, and AI features.',
    url: 'https://www.capcut.com',
    pricing: 'free',
    rating: 4.6,
    category: 'video-editing',
    features: ['Auto captions', 'Templates', 'Cloud editing', 'Mobile + Desktop'],
  },
  {
    slug: 'descript',
    name: 'Descript',
    description:
      'Edit video like a document — delete words in the transcript and the video edits itself.',
    url: 'https://www.descript.com',
    pricing: 'freemium',
    rating: 4.6,
    category: 'video-editing',
    features: ['Transcript editing', 'Screen recorder', 'AI voice', 'Podcast editor'],
  },
  {
    slug: 'veed-io',
    name: 'VEED.IO',
    description:
      'Browser-based video editor with one-click subtitles, translations, and AI tools.',
    url: 'https://www.veed.io',
    pricing: 'freemium',
    rating: 4.4,
    category: 'video-editing',
    features: ['Auto subtitles', 'Translation', 'Screen record', 'No install needed'],
  },
  {
    slug: 'runway-ml',
    name: 'Runway',
    description:
      'AI-powered video editor and generator with generative fill, motion tracking, and text-to-video.',
    url: 'https://runwayml.com',
    pricing: 'freemium',
    rating: 4.5,
    category: 'video-editing',
    features: ['Text-to-video', 'Generative fill', 'Background removal', 'Motion tracking'],
  },
  {
    slug: 'pictory',
    name: 'Pictory',
    description:
      'Turn blog posts and long-form content into short branded videos automatically.',
    url: 'https://pictory.ai',
    pricing: 'paid',
    rating: 4.3,
    category: 'video-editing',
    features: ['Blog to video', 'Auto highlights', 'Captions', 'Stock footage'],
  },
  {
    slug: 'invideo-ai',
    name: 'InVideo AI',
    description:
      'AI video generator that creates YouTube-ready videos from a text prompt in minutes.',
    url: 'https://invideo.io',
    pricing: 'freemium',
    rating: 4.3,
    category: 'video-editing',
    features: ['Text to video', '5000+ templates', 'Stock media', 'Voiceover'],
  },
  {
    slug: 'davinci-resolve',
    name: 'DaVinci Resolve',
    description:
      'Professional-grade free video editor used by Hollywood — powerful color grading and audio tools.',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    pricing: 'free',
    rating: 4.8,
    category: 'video-editing',
    features: ['Color grading', 'Fusion VFX', 'Fairlight audio', 'Free forever'],
  },
  {
    slug: 'clipchamp',
    name: 'Clipchamp',
    description:
      'Microsoft\'s free browser-based video editor with templates and AI features built into Windows.',
    url: 'https://clipchamp.com',
    pricing: 'free',
    rating: 4.1,
    category: 'video-editing',
    features: ['Built into Windows', 'AI script', 'Templates', 'Stock library'],
  },
  {
    slug: 'kdenlive',
    name: 'Kdenlive',
    description:
      'Free open-source video editor for Linux, Mac, and Windows with professional multi-track editing.',
    url: 'https://kdenlive.org',
    pricing: 'free',
    rating: 4.2,
    category: 'video-editing',
    features: ['Open source', 'Multi-track', 'Effects library', 'Cross-platform'],
  },
  {
    slug: 'synthesia',
    name: 'Synthesia',
    description:
      'Create AI avatar videos from text — 230+ avatars speak your script without any filming.',
    url: 'https://www.synthesia.io',
    pricing: 'paid',
    rating: 4.5,
    category: 'video-editing',
    features: ['AI avatars', '140+ languages', 'Custom avatars', 'Screen recorder'],
  },
  {
    slug: 'heygen',
    name: 'HeyGen',
    description:
      'Generate AI spokesperson videos or translate existing videos into 40+ languages with lip sync.',
    url: 'https://www.heygen.com',
    pricing: 'freemium',
    rating: 4.5,
    category: 'video-editing',
    features: ['AI avatars', 'Video translation', 'Lip sync', 'Voice cloning'],
  },
  {
    slug: 'steve-ai',
    name: 'Steve AI',
    description:
      'Convert text, audio, or blog to animated or live-action videos with AI automation.',
    url: 'https://www.steve.ai',
    pricing: 'freemium',
    rating: 4.1,
    category: 'video-editing',
    features: ['Blog to video', 'Animation', 'Live video', 'Team plan'],
  },
  {
    slug: 'lumen5',
    name: 'Lumen5',
    description:
      'Repurpose articles and scripts into social media videos with AI scene matching.',
    url: 'https://lumen5.com',
    pricing: 'freemium',
    rating: 4.2,
    category: 'video-editing',
    features: ['Blog to video', 'Brand templates', 'AI scene match', 'Auto captions'],
  },
  {
    slug: 'animaker',
    name: 'Animaker',
    description:
      'Create animated explainer videos and infographics with drag-and-drop ease.',
    url: 'https://www.animaker.com',
    pricing: 'freemium',
    rating: 4.1,
    category: 'video-editing',
    features: ['Animation library', 'Whiteboard', 'Infographic', 'Voice sync'],
  },
  {
    slug: 'adobe-premiere',
    name: 'Adobe Premiere Pro',
    description:
      'Industry-standard professional video editor with AI-powered tools for faster editing workflows.',
    url: 'https://www.adobe.com/products/premiere.html',
    pricing: 'paid',
    rating: 4.7,
    category: 'video-editing',
    features: ['AI speech to text', 'Lumetri color', 'After Effects integration', 'Collaborative editing'],
  },

  // ── Thumbnail Design (8) ───────────────────────────────────────
  {
    slug: 'canva',
    name: 'Canva',
    description:
      'Easy-to-use design platform with thousands of YouTube thumbnail templates.',
    url: 'https://www.canva.com',
    pricing: 'freemium',
    rating: 4.7,
    category: 'thumbnail-design',
    features: ['Templates', 'Brand kit', 'AI image generation', 'Team sharing'],
  },
  {
    slug: 'adobe-express',
    name: 'Adobe Express',
    description:
      'Free quick design tool by Adobe with YouTube thumbnail templates and AI-powered features.',
    url: 'https://www.adobe.com/express',
    pricing: 'freemium',
    rating: 4.4,
    category: 'thumbnail-design',
    features: ['Adobe assets', 'Remove background', 'Animate', 'Brand kits'],
  },
  {
    slug: 'snappa',
    name: 'Snappa',
    description:
      'Simple graphic design tool built for non-designers with preset YouTube thumbnail sizes.',
    url: 'https://snappa.com',
    pricing: 'freemium',
    rating: 4.1,
    category: 'thumbnail-design',
    features: ['Preset sizes', 'Stock photos', 'Font library', 'One-click resize'],
  },
  {
    slug: 'fotor',
    name: 'Fotor',
    description:
      'Online photo editor and thumbnail maker with AI background remover and enhancement tools.',
    url: 'https://www.fotor.com',
    pricing: 'freemium',
    rating: 4.2,
    category: 'thumbnail-design',
    features: ['AI enhance', 'Background remover', 'Photo effects', 'Templates'],
  },
  {
    slug: 'figma',
    name: 'Figma',
    description:
      'Professional collaborative design tool favoured by creators who want pixel-perfect thumbnails.',
    url: 'https://www.figma.com',
    pricing: 'freemium',
    rating: 4.8,
    category: 'thumbnail-design',
    features: ['Vector design', 'Prototyping', 'Plugin ecosystem', 'Team collab'],
  },
  {
    slug: 'photopea',
    name: 'Photopea',
    description:
      'Free browser-based Photoshop alternative with full PSD support — no install needed.',
    url: 'https://www.photopea.com',
    pricing: 'free',
    rating: 4.5,
    category: 'thumbnail-design',
    features: ['PSD support', 'Layers', 'Free to use', 'No install'],
  },
  {
    slug: 'midjourney',
    name: 'Midjourney',
    description:
      'AI image generator producing stunning visuals perfect for eye-catching YouTube thumbnails.',
    url: 'https://www.midjourney.com',
    pricing: 'paid',
    rating: 4.7,
    category: 'thumbnail-design',
    features: ['AI art', 'High resolution', 'Style control', 'Commercial use'],
  },
  {
    slug: 'befunky',
    name: 'BeFunky',
    description:
      'All-in-one online photo editor, collage maker, and graphic designer for quick thumbnails.',
    url: 'https://www.befunky.com',
    pricing: 'freemium',
    rating: 4.1,
    category: 'thumbnail-design',
    features: ['Photo effects', 'Collage maker', 'Text overlays', 'Touch-up tools'],
  },

  // ── Script & Writing (10) ──────────────────────────────────────
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    description:
      'Versatile AI assistant for generating scripts, titles, descriptions, and content ideas.',
    url: 'https://chat.openai.com',
    pricing: 'freemium',
    rating: 4.7,
    category: 'script-writing',
    features: ['Script generation', 'Title ideas', 'SEO descriptions', 'Research'],
  },
  {
    slug: 'claude-ai',
    name: 'Claude',
    description:
      'Anthropic\'s AI assistant known for long-form writing, nuanced scripts, and factual accuracy.',
    url: 'https://claude.ai',
    pricing: 'freemium',
    rating: 4.7,
    category: 'script-writing',
    features: ['Long-form scripts', 'Research', '200K context', 'Accurate writing'],
  },
  {
    slug: 'jasper-ai',
    name: 'Jasper AI',
    description:
      'AI writing platform built for marketers and creators with templates for YouTube scripts.',
    url: 'https://www.jasper.ai',
    pricing: 'paid',
    rating: 4.4,
    category: 'script-writing',
    features: ['50+ templates', 'Brand voice', 'SEO mode', 'Team features'],
  },
  {
    slug: 'copy-ai',
    name: 'Copy.ai',
    description:
      'AI copywriting tool with dedicated workflows for YouTube video scripts and descriptions.',
    url: 'https://www.copy.ai',
    pricing: 'freemium',
    rating: 4.3,
    category: 'script-writing',
    features: ['Video scripts', 'Workflows', '90+ languages', 'Bulk generation'],
  },
  {
    slug: 'writesonic',
    name: 'Writesonic',
    description:
      'AI writing assistant with a dedicated YouTube script writer and SEO-focused content tools.',
    url: 'https://writesonic.com',
    pricing: 'freemium',
    rating: 4.3,
    category: 'script-writing',
    features: ['Video scripts', 'SEO articles', 'Factual mode', 'API access'],
  },
  {
    slug: 'rytr',
    name: 'Rytr',
    description:
      'Affordable AI writer with a YouTube script use case and 30+ languages at a low price point.',
    url: 'https://rytr.me',
    pricing: 'freemium',
    rating: 4.1,
    category: 'script-writing',
    features: ['YouTube script', 'Tone selector', '30+ languages', 'Free plan'],
  },
  {
    slug: 'vidiq',
    name: 'vidIQ',
    description:
      'YouTube growth tool with an AI coach that generates daily video ideas and script outlines.',
    url: 'https://vidiq.com',
    pricing: 'freemium',
    rating: 4.4,
    category: 'script-writing',
    features: ['Video ideas', 'Script outlines', 'Keyword research', 'Channel audit'],
  },
  {
    slug: 'tubebuddy',
    name: 'TubeBuddy',
    description:
      'YouTube certified browser extension with AI title/description generator and A/B testing.',
    url: 'https://www.tubebuddy.com',
    pricing: 'freemium',
    rating: 4.3,
    category: 'script-writing',
    features: ['Title generator', 'Tag suggestions', 'A/B testing', 'Bulk editor'],
  },
  {
    slug: 'notion-ai',
    name: 'Notion AI',
    description:
      'AI writing assistant built into Notion — great for organising and drafting video scripts.',
    url: 'https://www.notion.so',
    pricing: 'freemium',
    rating: 4.4,
    category: 'script-writing',
    features: ['Script drafting', 'Summarise', 'Improve writing', 'Integrated notes'],
  },
  {
    slug: 'gravity-write',
    name: 'GravityWrite',
    description:
      'AI content creation tool with 250+ templates including YouTube scripts and channel ideas.',
    url: 'https://gravitywrite.com',
    pricing: 'freemium',
    rating: 4.1,
    category: 'script-writing',
    features: ['250+ templates', 'YouTube scripts', 'SEO tools', 'Free plan'],
  },

  // ── Stock Footage (9) ──────────────────────────────────────────
  {
    slug: 'pexels',
    name: 'Pexels',
    description:
      'Free stock videos and photos with no attribution required. Perfect for B-roll.',
    url: 'https://www.pexels.com',
    pricing: 'free',
    rating: 4.5,
    category: 'stock-footage',
    features: ['No attribution', 'HD/4K quality', 'Large library', 'API access'],
  },
  {
    slug: 'pixabay',
    name: 'Pixabay',
    description:
      'Free stock images, videos, and music with a permissive license for commercial use.',
    url: 'https://pixabay.com',
    pricing: 'free',
    rating: 4.4,
    category: 'stock-footage',
    features: ['No attribution', 'Videos + images', 'Music included', 'API access'],
  },
  {
    slug: 'mixkit',
    name: 'Mixkit',
    description:
      'Curated free stock videos, music, and sound effects by Envato — no sign-up needed.',
    url: 'https://mixkit.co',
    pricing: 'free',
    rating: 4.3,
    category: 'stock-footage',
    features: ['No sign-up', 'HD video', 'Music & SFX', 'After Effects templates'],
  },
  {
    slug: 'coverr',
    name: 'Coverr',
    description:
      'Beautiful free stock footage specifically curated for website headers and video backgrounds.',
    url: 'https://coverr.co',
    pricing: 'free',
    rating: 4.2,
    category: 'stock-footage',
    features: ['Curated quality', 'Free download', 'No attribution', 'Background video'],
  },
  {
    slug: 'videvo',
    name: 'Videvo',
    description:
      'Over 300,000 free and premium stock video clips, motion graphics, and AE templates.',
    url: 'https://www.videvo.net',
    pricing: 'freemium',
    rating: 4.2,
    category: 'stock-footage',
    features: ['300K+ clips', 'Motion graphics', 'AE templates', '4K footage'],
  },
  {
    slug: 'storyblocks',
    name: 'Storyblocks',
    description:
      'Subscription-based unlimited stock video library with 1M+ clips and motion graphics.',
    url: 'https://www.storyblocks.com',
    pricing: 'paid',
    rating: 4.4,
    category: 'stock-footage',
    features: ['1M+ assets', 'Unlimited downloads', 'Motion graphics', 'SFX included'],
  },
  {
    slug: 'pond5',
    name: 'Pond5',
    description:
      'Large marketplace for stock video, music, and sound effects with free and paid options.',
    url: 'https://www.pond5.com',
    pricing: 'freemium',
    rating: 4.3,
    category: 'stock-footage',
    features: ['30M+ clips', 'Free section', 'Music library', 'Editorial footage'],
  },
  {
    slug: 'artgrid',
    name: 'Artgrid',
    description:
      'Cinematic stock footage subscription with raw, ungraded clips from professional filmmakers.',
    url: 'https://artgrid.io',
    pricing: 'paid',
    rating: 4.5,
    category: 'stock-footage',
    features: ['Cinema quality', 'Raw footage', 'Filmmaker community', '4K/8K'],
  },
  {
    slug: 'envato-elements',
    name: 'Envato Elements',
    description:
      'All-in-one creative subscription with stock video, music, graphics, templates, and more.',
    url: 'https://elements.envato.com',
    pricing: 'paid',
    rating: 4.5,
    category: 'stock-footage',
    features: ['All-in-one', 'Video + music', 'After Effects', 'Unlimited use'],
  },

  // ── Music & SFX (7) ───────────────────────────────────────────
  {
    slug: 'epidemic-sound',
    name: 'Epidemic Sound',
    description:
      'Premium royalty-free music library with 40,000+ tracks for YouTube creators.',
    url: 'https://www.epidemicsound.com',
    pricing: 'paid',
    rating: 4.6,
    category: 'music-sfx',
    features: ['YouTube safe', 'Stems available', 'Sound effects', 'Spotify distribution'],
  },
  {
    slug: 'artlist',
    name: 'Artlist',
    description:
      'Flat-rate music licensing for unlimited projects — one subscription covers all platforms.',
    url: 'https://artlist.io',
    pricing: 'paid',
    rating: 4.6,
    category: 'music-sfx',
    features: ['Unlimited license', 'All platforms', 'SFX pack', 'Original music'],
  },
  {
    slug: 'musicbed',
    name: 'Musicbed',
    description:
      'Curated high-quality music for filmmakers and video creators, focused on emotional storytelling.',
    url: 'https://www.musicbed.com',
    pricing: 'paid',
    rating: 4.5,
    category: 'music-sfx',
    features: ['Curated quality', 'Film-grade music', 'Sync licensing', 'Mood search'],
  },
  {
    slug: 'youtube-audio-library',
    name: 'YouTube Audio Library',
    description:
      'YouTube\'s own free music and sound effects library — 100% safe for monetized channels.',
    url: 'https://www.youtube.com/audiolibrary',
    pricing: 'free',
    rating: 4.0,
    category: 'music-sfx',
    features: ['100% YouTube safe', 'Free forever', 'SFX included', 'Filter by mood'],
  },
  {
    slug: 'freesound',
    name: 'Freesound',
    description:
      'Community-driven sound effects database with 500,000+ sounds under Creative Commons.',
    url: 'https://freesound.org',
    pricing: 'free',
    rating: 4.1,
    category: 'music-sfx',
    features: ['500K+ sounds', 'Creative Commons', 'Community driven', 'API access'],
  },
  {
    slug: 'pixabay-music',
    name: 'Pixabay Music',
    description:
      'Free royalty-free music for videos — no attribution needed and safe for commercial use.',
    url: 'https://pixabay.com/music',
    pricing: 'free',
    rating: 4.0,
    category: 'music-sfx',
    features: ['No attribution', 'Commercial use', 'Mood filter', 'Genre filter'],
  },
  {
    slug: 'soundsnap',
    name: 'Soundsnap',
    description:
      'Professional sound effects library used by TV and film productions with 350,000+ sounds.',
    url: 'https://www.soundsnap.com',
    pricing: 'freemium',
    rating: 4.2,
    category: 'music-sfx',
    features: ['350K+ sounds', 'Pro quality', 'Searchable', 'Subscription plan'],
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
