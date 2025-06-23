export type Role = "admin" | "manager" | "uploader"
export type ClientStatus = "active" | "inactive" | "pending"
export type DocumentType =
  | "Balance Sheet"
  | "Tax Return"
  | "GST Return"
  | "P&L Statement"
  | "Financial Report"
  | "Tax Planning"
  | "Financial Review"
  | "Other"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  lastLogin?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  contactPerson?: string
  status: ClientStatus
  documents: number
  lastActive?: string
  createdAt: string
}

export interface Document {
  id: string
  name: string
  type: DocumentType
  client: string
  clientId: string
  uploadDate: string
  size: string
  viewed?: boolean
  downloaded?: number
}

export interface Activity {
  id: string
  action: string
  details?: string
  user: string
  userType: "admin" | "client"
  timestamp: string
  ip?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  read: boolean
  createdAt: string
  recipientId: string
  recipientType: "admin" | "client"
}
