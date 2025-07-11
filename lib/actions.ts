"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "./supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Authentication Functions
export async function authenticateClient(identifier: string, password: string) {
  try {
    // Demo credentials check
    if (identifier === "abccorp" && password === "password123") {
      const supabase = await createClient()

      // Sign in with demo email
      const { error } = await supabase.auth.signInWithPassword({
        email: "client@acmecorp.com",
        password: "password123",
      })

      if (error) {
        console.error("Auth error:", error)
        return { success: false, error: "Authentication failed" }
      }

      return { success: true }
    }

    return { success: false, error: "Invalid credentials" }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function authenticateAdmin(email: string, password: string) {
  try {
    // Demo credentials check
    if (email === "admin@santusahahero.com" && password === "admin123") {
      const supabase = await createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@santusahahero.com",
        password: "admin123",
      })

      if (error) {
        console.error("Admin auth error:", error)
        return { success: false, error: "Authentication failed" }
      }

      return { success: true }
    }

    return { success: false, error: "Invalid admin credentials" }
  } catch (error) {
    console.error("Admin authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Return demo user data based on email
    if (user.email === "admin@santusahahero.com") {
      return {
        id: user.id,
        email: user.email,
        username: "admin",
        role: "admin" as const,
      }
    } else if (user.email === "client@acmecorp.com") {
      return {
        id: user.id,
        email: user.email,
        username: "abccorp",
        role: "client" as const,
        client_id: "ACME_CORP",
      }
    }

    return null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Client Registration Functions
export async function checkClientIdAvailability(clientId: string) {
  try {
    const supabase = await createClient()

    const { data: existingClient } = await supabase.from("clients").select("id").eq("id", clientId).single()

    if (existingClient) {
      return { available: false, error: "Client ID already exists" }
    }

    return { available: true }
  } catch (error) {
    return { available: true }
  }
}

export async function verifyClientId(clientId: string) {
  try {
    const supabase = await createClient()

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("status", "active")
      .single()

    if (error || !client) {
      return { success: false, error: "Client ID not found or inactive" }
    }

    return { success: true, client }
  } catch (error) {
    console.error("Client verification error:", error)
    return { success: false, error: "Verification failed" }
  }
}

export async function registerClient(data: {
  clientId: string
  email: string
  username: string
  password: string
  isCustomId: boolean
}) {
  try {
    const supabase = await createClient()

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Create client record if custom ID
    if (data.isCustomId) {
      const { error: clientError } = await supabase.from("clients").insert({
        id: data.clientId,
        name: data.username,
        email: data.email,
        status: "active",
      })

      if (clientError) {
        return { success: false, error: "Failed to create client record" }
      }
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          client_id: data.clientId,
          role: "client",
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    // Create user record
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user?.id,
      email: data.email,
      username: data.username,
      role: "client",
      client_id: data.clientId,
      password_hash: passwordHash,
    })

    if (userError) {
      return { success: false, error: "Failed to create user record" }
    }

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function verifyOtp(email: string, otp: string) {
  // For demo purposes, accept any 6-digit code
  if (otp.length === 6) {
    return { success: true }
  }
  return { success: false, error: "Invalid OTP code" }
}

// Client Management
export async function getClients() {
  return [
    {
      id: "ACME_CORP",
      name: "ACME Corporation",
      email: "client@acmecorp.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business St, City, State 12345",
      contactPerson: "John Smith",
      status: "active" as const,
      documents: 5,
      lastActive: new Date().toLocaleString(),
      createdAt: "Jan 15, 2024",
      isRegistered: true,
      username: "abccorp",
    },
    {
      id: "TECH_SOLUTIONS",
      name: "Tech Solutions Inc",
      email: "contact@techsolutions.com",
      phone: "+1 (555) 987-6543",
      address: "456 Tech Ave, Innovation City, State 67890",
      contactPerson: "Sarah Johnson",
      status: "active" as const,
      documents: 3,
      lastActive: "2 hours ago",
      createdAt: "Feb 20, 2024",
      isRegistered: true,
      username: "techsol",
    },
  ]
}

export async function getClient(id: string) {
  const clients = await getClients()
  return clients.find((client) => client.id === id) || null
}

export async function createNewClient(formData: FormData) {
  const id =
    (formData.get("id") as string) ||
    `CLIENT${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const contactPerson = formData.get("contactPerson") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string

  if (!name || !email) {
    return { error: "Missing required fields" }
  }

  // Check if client ID already exists
  const { data: existingClient } = await supabaseAdmin.from("clients").select("id").eq("id", id).single()

  if (existingClient) {
    return { error: "Client ID already in use" }
  }

  // Check if email already exists
  const { data: existingEmail } = await supabaseAdmin.from("clients").select("email").eq("email", email).single()

  if (existingEmail) {
    return { error: "Email already in use" }
  }

  // Check if username already exists (if provided)
  if (username) {
    const { data: existingUsername } = await supabaseAdmin
      .from("clients")
      .select("username")
      .eq("username", username)
      .single()

    if (existingUsername) {
      return { error: "Username already taken" }
    }
  }

  const tempPassword = password || Math.random().toString(36).slice(2, 10)
  let authUserId = null

  // Create auth user if username and password are provided
  if (username && password) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      return { error: "Failed to create user account" }
    }

    authUserId = authData.user?.id
  }

  // Create client record
  const { data: newClient, error: clientError } = await supabaseAdmin
    .from("clients")
    .insert({
      id,
      name,
      email,
      phone,
      address,
      contact_person: contactPerson,
      username,
      status: "active",
      documents: 0,
      created_at: new Date().toISOString(),
      is_registered: !!username,
    })
    .select()
    .single()

  if (clientError) {
    // Clean up auth user if client creation fails
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
    }
    return { error: "Failed to create client" }
  }

  await createNotification({
    title: "Welcome to Santu Saha Hero",
    message: "Your account has been created. You can now access your financial documents securely.",
    type: "info",
    recipientId: id,
    recipientType: "client",
  })

  await logActivity({
    action: "Client created",
    details: `New client account created: ${name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/clients")

  return {
    client: {
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      contactPerson: newClient.contact_person,
      status: newClient.status,
      documents: newClient.documents || 0,
      lastActive: newClient.last_active ? new Date(newClient.last_active).toLocaleString() : undefined,
      createdAt: new Date(newClient.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isRegistered: newClient.is_registered,
      username: newClient.username,
    },
    tempPassword: username ? tempPassword : undefined,
  }
}

export async function updateClient(formData: FormData) {
  return { success: true, message: "Client updated successfully" }
}

export async function deleteClient(id: string) {
  return { success: true, message: "Client deleted successfully" }
}

// Document Management
export async function getDocuments() {
  return [
    {
      id: "DOC001",
      name: "Financial Report Q1 2024",
      type: "PDF",
      client: "ACME Corporation",
      clientId: "ACME_CORP",
      uploadDate: "Mar 15, 2024",
      size: "2.5 MB",
      viewed: true,
      downloaded: 3,
      shareLink: "https://portal.santusahahero.com/share/abc123",
      description: "Quarterly financial report for Q1 2024",
      file_url: "/placeholder.pdf",
    },
    {
      id: "DOC002",
      name: "Tax Documents 2023",
      type: "PDF",
      client: "ACME Corporation",
      clientId: "ACME_CORP",
      uploadDate: "Mar 10, 2024",
      size: "1.8 MB",
      viewed: false,
      downloaded: 0,
      description: "Annual tax documents for 2023",
      file_url: "/placeholder.pdf",
    },
    {
      id: "DOC003",
      name: "Investment Portfolio",
      type: "Excel",
      client: "Tech Solutions Inc",
      clientId: "TECH_SOLUTIONS",
      uploadDate: "Mar 12, 2024",
      size: "3.2 MB",
      viewed: true,
      downloaded: 1,
      description: "Current investment portfolio overview",
      file_url: "/placeholder.xlsx",
    },
  ]
}

export async function getClientDocuments(clientId: string) {
  const documents = await getDocuments()
  return documents.filter((doc) => doc.clientId === clientId)
}

export async function uploadDocument(formData: FormData) {
  return { success: true, message: "Document uploaded successfully" }
}

export async function generateDocumentShareLink(documentId: string) {
  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("name, client_id")
    .eq("id", documentId)
    .single()

  if (!document) {
    return { error: "Document not found" }
  }

  const randomId = Math.random().toString(36).substring(2, 15)
  const timestamp = Date.now().toString(36)
  const shareLink = `https://portal.santusahahero.com/share/${randomId}-${timestamp}`

  const { error } = await supabaseAdmin.from("documents").update({ share_link: shareLink }).eq("id", documentId)

  if (error) {
    return { error: "Failed to generate share link" }
  }

  await logActivity({
    action: "Share link generated",
    details: `Share link created for document "${document.name}"`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/documents")
  revalidatePath("/client/documents")

  return { success: true, shareLink }
}

export async function accessSharedDocument(linkId: string) {
  // For demo purposes, extract document ID from link
  const shareLink = `https://portal.santusahahero.com/share/${linkId}`

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select(`
      *,
      clients!inner(name)
    `)
    .eq("share_link", shareLink)
    .single()

  if (error || !document) {
    return { error: "Invalid or expired link" }
  }

  // Mark document as viewed
  await supabaseAdmin.from("documents").update({ viewed: true }).eq("id", document.id)

  await logActivity({
    action: "Document accessed via link",
    details: `Document "${document.name}" accessed via shared link`,
    user: "Anonymous",
    userType: "client",
  })

  return {
    document: {
      id: document.id,
      name: document.name,
      type: document.type,
      client: document.clients.name,
      clientId: document.client_id,
      uploadDate: new Date(document.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      size: document.size,
      viewed: document.viewed,
      downloaded: document.downloaded || 0,
      shareLink: document.share_link,
      description: document.description,
      file_url: document.file_url,
    },
    accessCount: 1,
  }
}

export async function downloadDocument(documentId: string, isSharedLink = false) {
  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select(`
      *,
      clients!inner(name)
    `)
    .eq("id", documentId)
    .single()

  if (error || !document) {
    return { error: "Document not found" }
  }

  // Increment download count
  const { data: updatedDoc } = await supabaseAdmin
    .from("documents")
    .update({ downloaded: (document.downloaded || 0) + 1 })
    .eq("id", documentId)
    .select("downloaded")
    .single()

  await logActivity({
    action: "Document downloaded",
    details: `Document "${document.name}" downloaded${isSharedLink ? " via shared link" : ""}`,
    user: isSharedLink ? "Anonymous" : document.clients.name,
    userType: "client",
  })

  revalidatePath("/admin/documents")
  revalidatePath("/client/documents")

  return {
    success: true,
    downloadCount: updatedDoc?.downloaded || (document.downloaded || 0) + 1,
    fileUrl: document.file_url,
  }
}

export async function deleteDocument(id: string) {
  return { success: true, message: "Document deleted successfully" }
}

export async function shareDocuments(formData: FormData) {
  const documentIds = formData.getAll("documentIds") as string[]
  const clientIds = formData.getAll("clientIds") as string[]

  if (!documentIds.length || !clientIds.length) {
    return { error: "Missing required fields" }
  }

  const sharedDocuments: any[] = []

  for (const docId of documentIds) {
    const { data: originalDoc, error } = await supabaseAdmin
      .from("documents")
      .select(`
        *,
        clients!inner(name)
      `)
      .eq("id", docId)
      .single()

    if (error || !originalDoc) continue

    for (const clientId of clientIds) {
      if (originalDoc.client_id === clientId) continue

      const { data: client } = await supabaseAdmin.from("clients").select("name").eq("id", clientId).single()

      if (!client) continue

      const id = `DOC${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      const { data: newDocument, error: createError } = await supabaseAdmin
        .from("documents")
        .insert({
          id,
          name: originalDoc.name,
          type: originalDoc.type,
          client_id: clientId,
          size: originalDoc.size,
          viewed: false,
          downloaded: 0,
          description: originalDoc.description,
          file_url: originalDoc.file_url,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) continue

      // Update client document count
      await supabaseAdmin
        .from("clients")
        .update({ documents: supabaseAdmin.raw("documents + 1") })
        .eq("id", clientId)

      sharedDocuments.push({
        id: newDocument.id,
        name: newDocument.name,
        type: newDocument.type,
        client: client.name,
        clientId: newDocument.client_id,
        uploadDate: new Date(newDocument.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        size: newDocument.size,
        viewed: newDocument.viewed,
        downloaded: newDocument.downloaded || 0,
        shareLink: newDocument.share_link,
        description: newDocument.description,
        file_url: newDocument.file_url,
      })

      await createNotification({
        title: "New Document Shared",
        message: `A new document "${originalDoc.name}" has been shared with you.`,
        type: "info",
        recipientId: clientId,
        recipientType: "client",
      })

      await logActivity({
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
export async function logActivity(userId: string, action: string, details: string) {
  try {
    const supabase = await createClient()

    await supabase.from("activities").insert({
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Activity logging error:", error)
  }
}

export async function getActivities() {
  return [
    {
      id: "ACT001",
      action: "Client login",
      details: "Client ACME Corporation logged in",
      user: "abccorp",
      userType: "client" as const,
      timestamp: new Date().toLocaleString(),
      ip: "192.168.1.100",
    },
    {
      id: "ACT002",
      action: "Document uploaded",
      details: "Financial Report Q1 2024 uploaded for ACME Corporation",
      user: "Admin User",
      userType: "admin" as const,
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      ip: "192.168.1.50",
    },
    {
      id: "ACT003",
      action: "Document downloaded",
      details: "Tax Documents 2023 downloaded by ACME Corporation",
      user: "abccorp",
      userType: "client" as const,
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
      ip: "192.168.1.100",
    },
  ]
}

export async function getClientActivities(clientId: string) {
  const { data: client } = await supabaseAdmin.from("clients").select("name").eq("id", clientId).single()

  if (!client) return []

  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("*")
    .or(`user.eq.${client.name},details.ilike.%${clientId}%`)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching client activities:", error)
    return []
  }

  return data.map((activity: any) => ({
    id: activity.id,
    action: activity.action,
    details: activity.details,
    user: activity.user,
    userType: activity.user_type,
    timestamp: new Date(activity.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    ip: activity.ip || "192.168.1.1",
  }))
}

// Notifications
export async function getNotifications(recipientId: string, recipientType: "admin" | "client") {
  return [
    {
      id: "NOT001",
      title: "New Document Available",
      message: "A new financial report has been uploaded to your account.",
      type: "info" as const,
      read: false,
      createdAt: new Date().toLocaleString(),
      recipientId,
      recipientType,
    },
    {
      id: "NOT002",
      title: "Account Update",
      message: "Your account information has been successfully updated.",
      type: "success" as const,
      read: true,
      createdAt: new Date(Date.now() - 86400000).toLocaleString(),
      recipientId,
      recipientType,
    },
  ]
}

export async function createNotification(data: any) {
  const id = `NOT${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  await supabaseAdmin.from("notifications").insert({
    id,
    title: data.title,
    message: data.message,
    type: data.type,
    recipient_id: data.recipientId,
    recipient_type: data.recipientType,
    read: false,
    created_at: new Date().toISOString(),
  })

  return {
    id,
    ...data,
    createdAt: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    read: false,
  }
}

export async function markNotificationAsRead(id: string) {
  return { success: true }
}

export async function deleteNotification(id: string) {
  const { error } = await supabaseAdmin.from("notifications").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete notification" }
  }

  return { success: true }
}

// Dashboard Data
export async function getAdminDashboardData() {
  return {
    totalClients: 2,
    activeClients: 2,
    totalDocuments: 3,
    documentsByType: {
      PDF: 2,
      Excel: 1,
    },
    recentActivities: await getActivities(),
    monthlyDocuments: [
      { month: "Jan", count: 12 },
      { month: "Feb", count: 19 },
      { month: "Mar", count: 25 },
      { month: "Apr", count: 32 },
    ],
    clientGrowth: [
      { month: "Jan", count: 5 },
      { month: "Feb", count: 8 },
      { month: "Mar", count: 12 },
      { month: "Apr", count: 15 },
    ],
  }
}

export async function getClientDashboardData(clientId: string) {
  const client = await getClient(clientId)
  const documents = await getClientDocuments(clientId)
  const notifications = await getNotifications(clientId, "client")

  return {
    client,
    totalDocuments: documents.length,
    recentDocuments: documents.slice(0, 5),
    documentsByType: documents.reduce((acc: Record<string, number>, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {}),
    notifications: notifications.slice(0, 5),
    documentActivity: [
      { month: "Jan", viewed: 3, downloaded: 2 },
      { month: "Feb", viewed: 5, downloaded: 3 },
      { month: "Mar", viewed: 8, downloaded: 4 },
      { month: "Apr", viewed: 6, downloaded: 3 },
    ],
  }
}

// Admin User Management
export async function getAdminUsers() {
  const { data, error } = await supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin users:", error)
    return []
  }

  return data.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: new Date(user.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    lastLogin: user.last_login
      ? new Date(user.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined,
  }))
}

export async function createAdminUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as "admin" | "manager" | "uploader"

  if (!name || !email || !role) {
    return { error: "Missing required fields" }
  }

  // Check if email already exists
  const { data: existingUser } = await supabaseAdmin.from("admin_users").select("email").eq("email", email).single()

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const tempPassword = Math.random().toString(36).slice(2, 10)

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user account" }
  }

  // Create admin user record
  const { data: newUser, error: userError } = await supabaseAdmin
    .from("admin_users")
    .insert({
      id: authData.user.id,
      name,
      email,
      role,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (userError) {
    // Clean up auth user if admin user creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { error: "Failed to create admin user record" }
  }

  await logActivity({
    action: "Admin user created",
    details: `New ${role} account created: ${name}`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date(newUser.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastLogin: undefined,
    },
    tempPassword,
  }
}

export async function updateAdminUser(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as "admin" | "manager" | "uploader"

  if (!id || !name || !email || !role) {
    return { error: "Missing required fields" }
  }

  // Check if email is already used by another admin user
  const { data: existingUser } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .neq("id", id)
    .single()

  if (existingUser) {
    return { error: "Email already in use" }
  }

  const { error } = await supabaseAdmin
    .from("admin_users")
    .update({
      name,
      email,
      role,
    })
    .eq("id", id)

  if (error) {
    return { error: "Failed to update admin user" }
  }

  // Update auth user email
  await supabaseAdmin.auth.admin.updateUserById(id, { email })

  await logActivity({
    action: "Admin user updated",
    details: `User ${name} (${id}) updated`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return { success: true }
}

export async function deleteAdminUser(id: string) {
  const { data: user } = await supabaseAdmin.from("admin_users").select("name").eq("id", id).single()

  if (!user) {
    return { error: "User not found" }
  }

  // Delete admin user record
  const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete admin user" }
  }

  // Delete auth user
  await supabaseAdmin.auth.admin.deleteUser(id)

  await logActivity({
    action: "Admin user deleted",
    details: `User ${user.name} (${id}) deleted`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/users")

  return { success: true }
}

export async function resetAdminPassword(id: string) {
  const { data: user } = await supabaseAdmin.from("admin_users").select("name").eq("id", id).single()

  if (!user) {
    return { error: "User not found" }
  }

  const tempPassword = Math.random().toString(36).slice(2, 10)

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: tempPassword,
  })

  if (error) {
    return { error: "Failed to reset password" }
  }

  await logActivity({
    action: "Admin password reset",
    details: `Password reset for ${user.name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  return { success: true, tempPassword }
}
