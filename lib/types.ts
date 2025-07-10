export interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "uploader"
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
  status: "active" | "inactive" | "pending"
  documents: number
  lastActive?: string
  createdAt: string
  isRegistered: boolean
  username?: string
}

export interface Document {
  id: string
  name: string
  type:
    | "Balance Sheet"
    | "Tax Return"
    | "GST Return"
    | "P&L Statement"
    | "Financial Report"
    | "Tax Planning"
    | "Financial Review"
    | "Other"
  client: string
  clientId: string
  uploadDate: string
  size: string
  viewed: boolean
  downloaded: number
  shareLink?: string
  description?: string
  file_url?: string
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
  type: "info" | "warning" | "error" | "success"
  read: boolean
  createdAt: string
  recipientId: string
  recipientType: "admin" | "client"
}
