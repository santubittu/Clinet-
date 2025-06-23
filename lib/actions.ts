"use server"

import { revalidatePath } from "next/cache"
import type { AdminUser, Client, Document, Activity, Notification } from "./types"

// Mock database for demo purposes
let adminUsers: AdminUser[] = [
  {
    id: "admin-001",
    name: "Admin User",
    email: "admin@santusahahero.com",
    role: "admin",
    createdAt: "Jan 1, 2024",
    lastLogin: "Apr 14, 2024",
  },
  {
    id: "admin-002",
    name: "Manager User",
    email: "manager@santusahahero.com",
    role: "manager",
    createdAt: "Jan 15, 2024",
    lastLogin: "Apr 12, 2024",
  },
  {
    id: "admin-003",
    name: "Document Uploader",
    email: "uploader@santusahahero.com",
    role: "uploader",
    createdAt: "Feb 1, 2024",
    lastLogin: "Apr 13, 2024",
  },
]

let clients: Client[] = [
  {
    id: "CLIENT123",
    name: "ABC Corporation",
    email: "contact@abccorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    contactPerson: "John Smith",
    status: "active",
    documents: 24,
    lastActive: "2 hours ago",
    createdAt: "Jan 15, 2023",
  },
  {
    id: "CLIENT456",
    name: "XYZ Enterprises",
    email: "info@xyzent.com",
    phone: "+1 (555) 987-6543",
    contactPerson: "Jane Doe",
    status: "active",
    documents: 18,
    lastActive: "1 day ago",
    createdAt: "Mar 10, 2023",
  },
  {
    id: "CLIENT789",
    name: "LMN Limited",
    email: "hello@lmnltd.com",
    status: "inactive",
    documents: 32,
    lastActive: "3 days ago",
    createdAt: "Jun 22, 2023",
  },
  {
    id: "CLIENT321",
    name: "PQR Inc",
    email: "support@pqrinc.com",
    status: "active",
    documents: 15,
    lastActive: "1 week ago",
    createdAt: "Sep 5, 2023",
  },
  {
    id: "CLIENT654",
    name: "EFG Solutions",
    email: "info@efgsolutions.com",
    status: "pending",
    documents: 27,
    lastActive: "2 weeks ago",
    createdAt: "Nov 18, 2023",
  },
]

let documents: Document[] = [
  {
    id: "DOC001",
    name: "Balance Sheet Q1 2024.pdf",
    type: "Balance Sheet",
    client: "ABC Corporation",
    clientId: "CLIENT123",
    uploadDate: "Apr 10, 2024",
    size: "1.2 MB",
    viewed: true,
    downloaded: 2,
  },
  {
    id: "DOC002",
    name: "Tax Return 2023.pdf",
    type: "Tax Return",
    client: "XYZ Enterprises",
    clientId: "CLIENT456",
    uploadDate: "Apr 8, 2024",
    size: "3.5 MB",
    viewed: true,
    downloaded: 1,
  },
  {
    id: "DOC003",
    name: "GST Return Q4 2023.pdf",
    type: "GST Return",
    client: "LMN Limited",
    clientId: "CLIENT789",
    uploadDate: "Apr 5, 2024",
    size: "0.8 MB",
    viewed: false,
    downloaded: 0,
  },
  {
    id: "DOC004",
    name: "Profit & Loss Statement Q1 2024.pdf",
    type: "P&L Statement",
    client: "ABC Corporation",
    clientId: "CLIENT123",
    uploadDate: "Apr 10, 2024",
    size: "1.5 MB",
    viewed: true,
    downloaded: 3,
  },
]

let activities: Activity[] = [
  {
    id: "ACT001",
    action: "Document uploaded",
    details: "Balance Sheet Q1 2024 for ABC Corp",
    user: "Admin User",
    userType: "admin",
    timestamp: "Apr 10, 2024 10:23 AM",
    ip: "192.168.1.1",
  },
  {
    id: "ACT002",
    action: "Client added",
    details: "New client XYZ Enterprises registered",
    user: "Manager User",
    userType: "admin",
    timestamp: "Apr 9, 2024 3:45 PM",
    ip: "192.168.1.2",
  },
  {
    id: "ACT003",
    action: "Document viewed",
    details: "Balance Sheet Q1 2024.pdf",
    user: "ABC Corporation",
    userType: "client",
    timestamp: "Apr 12, 2024 10:23 AM",
    ip: "192.168.1.3",
  },
]

let notifications: Notification[] = [
  {
    id: "NOT001",
    title: "New document available",
    message: "Your Q1 2024 financial statements have been uploaded",
    type: "info",
    read: false,
    createdAt: "Apr 10, 2024 10:30 AM",
    recipientId: "CLIENT123",
    recipientType: "client",
  },
  {
    id: "NOT002",
    title: "GST Return reminder",
    message: "Your Q1 2024 GST Return is due in 7 days",
    type: "warning",
    read: false,
    createdAt: "Apr 8, 2024 9:15 AM",
    recipientId: "CLIENT456",
    recipientType: "client",
  },
]

// Admin User Management
export async function getAdminUsers() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return adminUsers
}

export async function createAdminUser(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as "admin" | "manager" | "uploader"

  if (!name || !email || !role) {
    return { error: "Missing required fields" }
  }

  // Check if email already exists
  if (adminUsers.some((user) => user.email === email)) {
    return { error: "Email already in use" }
  }

  // Generate a random ID
  const id = `admin-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(2, 10)

  const newUser: AdminUser = {
    id,
    name,
    email,
    role,
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }

  adminUsers.push(newUser)

  // Log activity
  logActivity({
    action: "Admin user created",
    details: `New ${role} account created: ${name}`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return { user: newUser, tempPassword }
}

export async function updateAdminUser(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as "admin" | "manager" | "uploader"

  if (!id || !name || !email || !role) {
    return { error: "Missing required fields" }
  }

  // Find the user
  const userIndex = adminUsers.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    return { error: "User not found" }
  }

  // Check if email already exists (except for this user)
  if (adminUsers.some((user) => user.email === email && user.id !== id)) {
    return { error: "Email already in use" }
  }

  // Update the user
  adminUsers[userIndex] = {
    ...adminUsers[userIndex],
    name,
    email,
    role,
  }

  // Log activity
  logActivity({
    action: "Admin user updated",
    details: `User ${name} (${id}) updated`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return { success: true }
}

export async function deleteAdminUser(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the user
  const userIndex = adminUsers.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    return { error: "User not found" }
  }

  const deletedUser = adminUsers[userIndex]

  // Remove the user
  adminUsers = adminUsers.filter((user) => user.id !== id)

  // Log activity
  logActivity({
    action: "Admin user deleted",
    details: `User ${deletedUser.name} (${id}) deleted`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return { success: true }
}

export async function resetAdminPassword(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the user
  const user = adminUsers.find((user) => user.id === id)

  if (!user) {
    return { error: "User not found" }
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(2, 10)

  // Log activity
  logActivity({
    action: "Admin password reset",
    details: `Password reset for ${user.name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  return { success: true, tempPassword }
}

// Client Management
export async function getClients() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return clients
}

export async function getClient(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return clients.find((client) => client.id === id) || null
}

export async function createClient(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  let id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const contactPerson = formData.get("contactPerson") as string

  if (!name || !email) {
    return { error: "Missing required fields" }
  }

  // Generate a client ID if not provided
  if (!id) {
    id = `CLIENT${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }

  // Check if ID already exists
  if (clients.some((client) => client.id === id)) {
    return { error: "Client ID already in use" }
  }

  // Check if email already exists
  if (clients.some((client) => client.email === email)) {
    return { error: "Email already in use" }
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(2, 10)

  const newClient: Client = {
    id,
    name,
    email,
    phone,
    address,
    contactPerson,
    status: "active",
    documents: 0,
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }

  clients.push(newClient)

  // Create welcome notification
  createNotification({
    title: "Welcome to Santu Saha Hero",
    message: "Your account has been created. You can now access your financial documents securely.",
    type: "info",
    recipientId: id,
    recipientType: "client",
  })

  // Log activity
  logActivity({
    action: "Client created",
    details: `New client account created: ${name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/clients")

  return { client: newClient, tempPassword }
}

export async function updateClient(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const contactPerson = formData.get("contactPerson") as string
  const status = formData.get("status") as "active" | "inactive" | "pending"

  if (!id || !name || !email) {
    return { error: "Missing required fields" }
  }

  // Find the client
  const clientIndex = clients.findIndex((client) => client.id === id)

  if (clientIndex === -1) {
    return { error: "Client not found" }
  }

  // Check if email already exists (except for this client)
  if (clients.some((client) => client.email === email && client.id !== id)) {
    return { error: "Email already in use" }
  }

  // Update the client
  clients[clientIndex] = {
    ...clients[clientIndex],
    name,
    email,
    phone,
    address,
    contactPerson,
    status,
  }

  // Log activity
  logActivity({
    action: "Client updated",
    details: `Client ${name} (${id}) updated`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/clients")
  revalidatePath(`/admin/clients/${id}`)

  return { success: true }
}

export async function deleteClient(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the client
  const clientIndex = clients.findIndex((client) => client.id === id)

  if (clientIndex === -1) {
    return { error: "Client not found" }
  }

  const deletedClient = clients[clientIndex]

  // Remove the client
  clients = clients.filter((client) => client.id !== id)

  // Remove client's documents
  documents = documents.filter((doc) => doc.clientId !== id)

  // Log activity
  logActivity({
    action: "Client deleted",
    details: `Client ${deletedClient.name} (${id}) deleted`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/clients")

  return { success: true }
}

export async function resetClientPassword(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the client
  const client = clients.find((client) => client.id === id)

  if (!client) {
    return { error: "Client not found" }
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(2, 10)

  // Create notification
  createNotification({
    title: "Password Reset",
    message: "Your password has been reset. Please use the temporary password to log in and set a new password.",
    type: "warning",
    recipientId: id,
    recipientType: "client",
  })

  // Log activity
  logActivity({
    action: "Client password reset",
    details: `Password reset for ${client.name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  return { success: true, tempPassword }
}

// Document Management
export async function getDocuments() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return documents
}

export async function getClientDocuments(clientId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return documents.filter((doc) => doc.clientId === clientId)
}

export async function uploadDocument(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const clientId = formData.get("clientId") as string
  const file = formData.get("file") as File

  if (!name || !type || !clientId || !file) {
    return { error: "Missing required fields" }
  }

  // Find the client
  const client = clients.find((client) => client.id === clientId)

  if (!client) {
    return { error: "Client not found" }
  }

  // Generate a document ID
  const id = `DOC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  // Calculate file size
  const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  const newDocument: Document = {
    id,
    name,
    type: type as any,
    client: client.name,
    clientId,
    uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    size,
    viewed: false,
    downloaded: 0,
  }

  documents.push(newDocument)

  // Update client document count
  const clientIndex = clients.findIndex((c) => c.id === clientId)
  if (clientIndex !== -1) {
    clients[clientIndex].documents += 1
  }

  // Create notification
  createNotification({
    title: "New Document Available",
    message: `A new document "${name}" has been uploaded to your account.`,
    type: "info",
    recipientId: clientId,
    recipientType: "client",
  })

  // Log activity
  logActivity({
    action: "Document uploaded",
    details: `Document "${name}" uploaded for ${client.name} (${clientId})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/documents")
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath("/client/documents")

  return { document: newDocument }
}

export async function deleteDocument(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find the document
  const documentIndex = documents.findIndex((doc) => doc.id === id)

  if (documentIndex === -1) {
    return { error: "Document not found" }
  }

  const deletedDocument = documents[documentIndex]

  // Remove the document
  documents = documents.filter((doc) => doc.id !== id)

  // Update client document count
  const clientIndex = clients.findIndex((c) => c.id === deletedDocument.clientId)
  if (clientIndex !== -1 && clients[clientIndex].documents > 0) {
    clients[clientIndex].documents -= 1
  }

  // Log activity
  logActivity({
    action: "Document deleted",
    details: `Document "${deletedDocument.name}" deleted for ${deletedDocument.client} (${deletedDocument.clientId})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/documents")
  revalidatePath(`/admin/clients/${deletedDocument.clientId}`)
  revalidatePath("/client/documents")

  return { success: true }
}

export async function shareDocuments(formData: FormData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const documentIds = formData.getAll("documentIds") as string[]
  const clientIds = formData.getAll("clientIds") as string[]

  if (!documentIds.length || !clientIds.length) {
    return { error: "Missing required fields" }
  }

  // Process each document for each client
  const sharedDocuments: Document[] = []

  for (const docId of documentIds) {
    const originalDoc = documents.find((doc) => doc.id === docId)

    if (!originalDoc) continue

    for (const clientId of clientIds) {
      // Skip if document already belongs to this client
      if (originalDoc.clientId === clientId) continue

      // Find the client
      const client = clients.find((client) => client.id === clientId)

      if (!client) continue

      // Generate a document ID
      const id = `DOC${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      const newDocument: Document = {
        ...originalDoc,
        id,
        client: client.name,
        clientId,
        viewed: false,
        downloaded: 0,
      }

      documents.push(newDocument)
      sharedDocuments.push(newDocument)

      // Update client document count
      const clientIndex = clients.findIndex((c) => c.id === clientId)
      if (clientIndex !== -1) {
        clients[clientIndex].documents += 1
      }

      // Create notification
      createNotification({
        title: "New Document Shared",
        message: `A new document "${originalDoc.name}" has been shared with you.`,
        type: "info",
        recipientId: clientId,
        recipientType: "client",
      })

      // Log activity
      logActivity({
        action: "Document shared",
        details: `Document "${originalDoc.name}" shared with ${client.name} (${clientId})`,
        user: "Admin User",
        userType: "admin",
      })
    }
  }

  revalidatePath("/admin/documents")
  clientIds.forEach((clientId) => {
    revalidatePath(`/admin/clients/${clientId}`)
  })
  revalidatePath("/client/documents")

  return { documents: sharedDocuments }
}

// Activity Logging
export async function getActivities() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return activities
}

export async function getClientActivities(clientId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return activities.filter(
    (activity) =>
      (activity.userType === "client" && activity.user === clients.find((c) => c.id === clientId)?.name) ||
      (activity.action.includes("Document") && activity.details?.includes(clientId)),
  )
}

export async function logActivity(data: Omit<Activity, "id" | "timestamp" | "ip">) {
  const id = `ACT${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const newActivity: Activity = {
    id,
    ...data,
    timestamp,
    ip: "192.168.1.1", // Mock IP address
  }

  activities.unshift(newActivity) // Add to beginning of array

  // Keep only the last 1000 activities
  if (activities.length > 1000) {
    activities = activities.slice(0, 1000)
  }

  return newActivity
}

// Notifications
export async function getNotifications(recipientId: string, recipientType: "admin" | "client") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return notifications.filter(
    (notification) => notification.recipientId === recipientId && notification.recipientType === recipientType,
  )
}

export async function createNotification(data: Omit<Notification, "id" | "createdAt" | "read">) {
  const id = `NOT${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const createdAt = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })

  const newNotification: Notification = {
    id,
    ...data,
    createdAt,
    read: false,
  }

  notifications.unshift(newNotification) // Add to beginning of array

  return newNotification
}

export async function markNotificationAsRead(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const notificationIndex = notifications.findIndex((notification) => notification.id === id)

  if (notificationIndex === -1) {
    return { error: "Notification not found" }
  }

  notifications[notificationIndex].read = true

  return { success: true }
}

export async function deleteNotification(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  notifications = notifications.filter((notification) => notification.id !== id)

  return { success: true }
}

// Dashboard Data
export async function getAdminDashboardData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const totalClients = clients.length
  const activeClients = clients.filter((client) => client.status === "active").length
  const totalDocuments = documents.length
  const documentsByType = documents.reduce(
    (acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recentActivities = activities.slice(0, 10)

  const monthlyDocuments = [
    { month: "Jan", count: 12 },
    { month: "Feb", count: 19 },
    { month: "Mar", count: 25 },
    { month: "Apr", count: 32 },
    { month: "May", count: 0 },
    { month: "Jun", count: 0 },
    { month: "Jul", count: 0 },
    { month: "Aug", count: 0 },
    { month: "Sep", count: 0 },
    { month: "Oct", count: 0 },
    { month: "Nov", count: 0 },
    { month: "Dec", count: 0 },
  ]

  const clientGrowth = [
    { month: "Jan", count: 5 },
    { month: "Feb", count: 8 },
    { month: "Mar", count: 12 },
    { month: "Apr", count: 15 },
    { month: "May", count: 0 },
    { month: "Jun", count: 0 },
    { month: "Jul", count: 0 },
    { month: "Aug", count: 0 },
    { month: "Sep", count: 0 },
    { month: "Oct", count: 0 },
    { month: "Nov", count: 0 },
    { month: "Dec", count: 0 },
  ]

  return {
    totalClients,
    activeClients,
    totalDocuments,
    documentsByType,
    recentActivities,
    monthlyDocuments,
    clientGrowth,
  }
}

export async function getClientDashboardData(clientId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const client = clients.find((c) => c.id === clientId)

  if (!client) {
    return { error: "Client not found" }
  }

  const clientDocuments = documents.filter((doc) => doc.clientId === clientId)
  const recentDocuments = [...clientDocuments]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5)

  const documentsByType = clientDocuments.reduce(
    (acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const clientNotifications = notifications
    .filter((n) => n.recipientId === clientId && n.recipientType === "client")
    .slice(0, 5)

  const documentActivity = [
    { month: "Jan", viewed: 3, downloaded: 2 },
    { month: "Feb", viewed: 5, downloaded: 3 },
    { month: "Mar", viewed: 8, downloaded: 4 },
    { month: "Apr", viewed: 6, downloaded: 3 },
    { month: "May", viewed: 0, downloaded: 0 },
    { month: "Jun", viewed: 0, downloaded: 0 },
    { month: "Jul", viewed: 0, downloaded: 0 },
    { month: "Aug", viewed: 0, downloaded: 0 },
    { month: "Sep", viewed: 0, downloaded: 0 },
    { month: "Oct", viewed: 0, downloaded: 0 },
    { month: "Nov", viewed: 0, downloaded: 0 },
    { month: "Dec", viewed: 0, downloaded: 0 },
  ]

  return {
    client,
    totalDocuments: clientDocuments.length,
    recentDocuments,
    documentsByType,
    notifications: clientNotifications,
    documentActivity,
  }
}
