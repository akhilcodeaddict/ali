export interface PageDto {
  id: string;
  slug: string;
  title: string;
  htmlContent: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  sortOrder: number;
}

export interface UpsertPageDto {
  slug: string;
  title: string;
  htmlContent: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
  isPublished: boolean;
  sortOrder: number;
}

export type TestimonialApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface TestimonialDto {
  id: string;
  name: string;
  designation: string;
  headline?: string | null;
  message: string;
  photoUrl?: string | null;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  email?: string | null;
  approvalStatus: TestimonialApprovalStatus;
  servicesBooked?: string[] | null;
  extraImages?: string[] | null;
  extraVideos?: string[] | null;
  createdAt: string;
}

export interface UpsertTestimonialDto {
  name: string;
  designation: string;
  headline?: string | null;
  message: string;
  photoUrl?: string | null;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  email?: string | null;
  approvalStatus?: TestimonialApprovalStatus;
  servicesBooked?: string[] | null;
  extraImages?: string[] | null;
  extraVideos?: string[] | null;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface BookingDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceNames: string[];
  preferredDate: string;
  preferredTime?: string | null;
  notes?: string | null;
  status: BookingStatus;
  createdAt: string;
}

export interface ContactInfoDto {
  id: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl?: string | null;
}

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrafficSummaryDto {
  totalVisits: number;
  totalPageViews: number;
  bounceRatePercent: number;
  pagesPerVisit: number;
  avgSessionDurationSeconds: number;
  dailyVisits: number[];
  dailyPageViews: number[];
}

export interface HeroDto {
  id: string;
  title: string;
  subtitle: string;
  backgroundImageUrl?: string | null;
  primaryCtaLabel: string;
  primaryCtaUrl?: string | null;
  secondaryCtaLabel: string;
  secondaryCtaUrl?: string | null;
}

export interface HeroSlideDto {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export type ProductGender = "NotApplicable" | "Male" | "Female" | "Unisex" | "Kids";
export type ProductType = "Count" | "Service";

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  currency: string;
  sku: string;
  stockLevel: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId?: string | null;
  categoryName?: string | null;
  subCategoryId?: string | null;
  subCategoryName?: string | null;
  gender: ProductGender;
  productType: ProductType;
  tags?: string[] | null;
  allowRebooking?: boolean;
  tagline?: string | null;
  durationLabel?: string | null;
  includedItems?: string[] | null;
  benefits?: string[] | null;
  galleryImages?: string[] | null;
  createdAt: string;
}

export interface UpsertProductDto {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  currency: string;
  sku: string;
  stockLevel: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId?: string | null;
  subCategoryId?: string | null;
  gender: ProductGender;
  productType: ProductType;
  tags?: string[] | null;
  allowRebooking?: boolean;
  tagline?: string | null;
  durationLabel?: string | null;
  includedItems?: string[] | null;
  benefits?: string[] | null;
  galleryImages?: string[] | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string | null;
  parentId?: string | null;
  parentName?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface UpsertCategoryDto {
  name: string;
  module: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface SiteSettingsDto {
  id: string;
  siteName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedInUrl?: string | null;
  youtubeUrl?: string | null;
  googleMapsUrl?: string | null;
  websiteUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  googleAnalyticsId?: string | null;
  maintenanceMode: boolean;
  copyrightText?: string | null;
  defaultLanguage: string;
  timeZone?: string | null;
  requireTestimonialApproval: boolean;
  // SMTP
  smtpHost?: string | null;
  smtpPort: number;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromName?: string | null;
  smtpAdminEmail?: string | null;
  smtpUseSsl: boolean;
}

export interface SeoMetaDto {
  id: string;
  pageKey: string;
  label: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
}

export interface UpsertSeoMetaDto {
  label: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImageUrl?: string | null;
}

export type GalleryMediaType = "Image" | "Video";

export interface GalleryItemDto {
  id: string;
  title?: string | null;
  mediaUrl: string;
  mediaType: GalleryMediaType;
  categoryId: string;
  categoryName?: string | null;
  displayOrder: number;
  isActive: boolean;
  width?: number | null;
  height?: number | null;
  createdAt: string;
}

export interface UpsertGalleryItemDto {
  title?: string | null;
  mediaUrl: string;
  mediaType: GalleryMediaType;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
  width?: number | null;
  height?: number | null;
}

export interface GalleryAlbumImageDto {
  id: string;
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isLocationDivider: boolean;
  locationText?: string | null;
}

export interface UpsertGalleryAlbumImageDto {
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isLocationDivider: boolean;
  locationText?: string | null;
}

export interface GalleryAlbumDto {
  id: string;
  slug: string;
  title: string;
  coupleNames: string;
  coverImageUrl?: string | null;
  heroImageUrl?: string | null;
  location?: string | null;
  eventDate?: string | null;
  story?: string | null;
  photographerCredits?: string | null;
  filmmakerCredits?: string | null;
  editorCredits?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  displayOrder: number;
  isActive: boolean;
  images: GalleryAlbumImageDto[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpsertGalleryAlbumDto {
  slug: string;
  title: string;
  coupleNames: string;
  coverImageUrl?: string | null;
  heroImageUrl?: string | null;
  location?: string | null;
  eventDate?: string | null;
  story?: string | null;
  photographerCredits?: string | null;
  filmmakerCredits?: string | null;
  editorCredits?: string | null;
  categoryId?: string | null;
  displayOrder: number;
  isActive: boolean;
  images: UpsertGalleryAlbumImageDto[];
}

export interface AwardDto {
  id: string;
  name: string;
  logoUrl?: string | null;
  photoUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UpsertAwardDto {
  name: string;
  logoUrl?: string | null;
  photoUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface BannerDto {
  id: string;
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UpsertBannerDto {
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isActive: boolean;
}
