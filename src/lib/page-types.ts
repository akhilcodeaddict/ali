export interface ContentBlock {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
  children?: ContentBlock[];
}

export interface PageContent {
  version: string;
  blocks: ContentBlock[];
}

export type PageStatus = "Draft" | "Review" | "Scheduled" | "Published" | "Archived";

export interface PageListItem {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  publishDate?: string | null;
  viewCount: number;
  currentVersion: number;
  showInMenu: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface HeroSettings {
  enabled: boolean;
  type?: string | null;
  imageUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  cta1Text?: string | null;
  cta1Url?: string | null;
  cta2Text?: string | null;
  cta2Url?: string | null;
  overlay: boolean;
  minHeight: number;
}

export interface SeoSettings {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  ogType: string;
  twitterCardType: string;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredData?: any;
  structuredDataType?: string | null;
  robotsIndex: string;
  robotsFollow: string;
}

export interface PageDetail {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  content: PageContent | null;
  contentFormat: string;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  featuredImageCaption?: string | null;
  hero: HeroSettings;
  seo: SeoSettings;
  status: PageStatus;
  publishDate?: string | null;
  publishEndDate?: string | null;
  scheduledPublishDate?: string | null;
  publishedAt?: string | null;
  showInMenu: boolean;
  menuLabel?: string | null;
  displayOrder: number;
  parentPageId?: string | null;
  viewCount: number;
  currentVersion: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpsertPagePayload {
  title: string;
  slug?: string;
  subtitle?: string | null;
  description?: string | null;
  content: PageContent;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  featuredImageCaption?: string | null;
  hero?: HeroSettings;
  seo?: SeoSettings;
  showInMenu: boolean;
  menuLabel?: string | null;
  displayOrder: number;
  parentPageId?: string | null;
  changeReason?: string | null;
}

export interface PageVersionItem {
  id: string;
  pageId: string;
  versionNumber: number;
  title: string;
  slug: string;
  changeReason?: string | null;
  createdAt: string;
}

export interface PublishResult {
  page: PageDetail;
  warnings: string[];
}

export interface PageDraft {
  id: string;
  pageId: string;
  title: string;
  content: PageContent | null;
  savedAt: string;
}

export function newBlockId(): string {
  return `block_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
