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

export interface BlogDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
}

export interface UpsertBlogDto {
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
}

export interface TeamMemberDto {
  id: string;
  name: string;
  title: string;
  experience?: string | null;
  isSpecial: boolean;
  order: number;
  bulletPoints: string[];
  photoUrl?: string | null;
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  isActive: boolean;
}

export interface UpsertTeamMemberDto {
  name: string;
  title: string;
  experience?: string | null;
  isSpecial: boolean;
  order: number;
  bulletPoints: string[];
  photoUrl?: string | null;
  linkedInUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  isActive: boolean;
}

export interface TeamStatsDto {
  id: string;
  qualifiedCAs: number;
  caFinalists: number;
  mbaOrBCom: number;
  articleAssistants: number;
}

export interface ClientLogoDto {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  isActive: boolean;
}

export type TestimonialApprovalStatus = "Pending" | "Approved" | "Rejected";

export interface TestimonialDto {
  id: string;
  name: string;
  designation: string;
  message: string;
  photoUrl?: string | null;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  email?: string | null;
  approvalStatus: TestimonialApprovalStatus;
  servicesBooked?: string[] | null;
  extraImages?: string[] | null;
}

export interface UpsertTestimonialDto {
  name: string;
  designation: string;
  message: string;
  photoUrl?: string | null;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  email?: string | null;
  approvalStatus?: TestimonialApprovalStatus;
  servicesBooked?: string[] | null;
  extraImages?: string[] | null;
}

export type JobApplicationStatus = "Pending" | "Reviewed" | "Shortlisted" | "Rejected";

export interface JobPostingDto {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  shortDescription: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

export interface UpsertJobPostingDto {
  title: string;
  department: string;
  location: string;
  type: string;
  shortDescription: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

export interface JobApplicationDto {
  id: string;
  jobPostingId: string;
  fullName: string;
  email: string;
  phone: string;
  coverNote?: string | null;
  resumeUrl: string;
  status: JobApplicationStatus;
  createdAt: string;
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

export interface NewsDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  coverImageUrl?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export interface UpsertNewsDto {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  coverImageUrl?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface DocumentDto {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  category: string;
  author: string;
  isPublished: boolean;
  downloadCount: number;
  version: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateDocumentDto {
  title: string;
  description?: string | null;
  category: string;
  author: string;
  isPublished: boolean;
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

export type BranchStatus = "Open" | "TemporarilyClosed" | "Closed";

export interface BranchDto {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  managerName: string;
  openingHours: string;
  mapUrl?: string | null;
  imageUrl?: string | null;
  isHeadquarters: boolean;
  displayOrder: number;
  status: BranchStatus;
  createdAt: string;
}

export interface UpsertBranchDto {
  name: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  managerName: string;
  openingHours: string;
  mapUrl?: string | null;
  imageUrl?: string | null;
  isHeadquarters: boolean;
  displayOrder: number;
  status: BranchStatus;
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

export interface FaqDto {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface UpsertFaqDto {
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
  isPublished: boolean;
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
  websiteUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  googleAnalyticsId?: string | null;
  maintenanceMode: boolean;
  copyrightText?: string | null;
  defaultLanguage: string;
  timeZone?: string | null;
  // SMTP
  smtpHost?: string | null;
  smtpPort: number;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromName?: string | null;
  smtpAdminEmail?: string | null;
  smtpUseSsl: boolean;
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
