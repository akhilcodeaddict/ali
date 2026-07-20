export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface RoleSummary {
  id: string;
  name: string;
  isSystem: boolean;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  lastLoginAt?: string | null;
  roles: RoleSummary[];
  createdAt: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  activity: string;
  module: string;
  entityId?: string | null;
  entityName?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  status: string;
  details?: string | null;
  timestamp: string;
}

export interface AuditLogPage {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
}
