"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "./supabase"
import type { Document, Activity, Notification } from "./types"

// Helper to get Supabase client for server actions (with user session)
function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient("https://lkepqhkrwbhwzsokhtbm.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Authentication Functions
export async function authenticateClient(identifier: string, password: string) {
  const supabase = getSupabaseServerClient()

  // Try to sign in with email/password first
  let { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  })

  // If email/password fails, try to find client by username and then sign in with their associated email
  if (error || !data.user) {
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("email, id, name, username")
      .ilike("username", identifier)
      .single()

    if (clientError || !clientData) {
      return { success: false, error: "Invalid credentials" }
    }
    // Now try to sign in with the found email
    ;({ data, error } = await supabase.auth.signInWithPassword({
      email: clientData.email,
      password,
    }))

    if (error || !data.user) {
      return { success: false, error: "Invalid credentials" }
    }
  }

  // Update last_active for the client
  const { data: clientUpdateData, error: clientUpdateError } = await supabaseAdmin
    .from("clients")
    .update({ last_active: new Date().toISOString() })
    .eq("email", data.user.email)
    .select("id, name, username, email, status, documents, last_active, created_at, is_registered")
    .single()

  if (clientUpdateError || !clientUpdateData) {
    console.error("Error updating client last_active:", clientUpdateError)
    return { success: false, error: "Login successful, but failed to update client data." }
  }

  await logActivity({
    action: "Client login",
    details: `Client ${clientUpdateData.name} (${clientUpdateData.id}) logged in`,
    user: clientUpdateData.name,
    userType: "client",
  })

  return {
    success: true,
    user: {
      id: clientUpdateData.id,
      name: clientUpdateData.name,
      username: clientUpdateData.username,
      email: clientUpdateData.email,
      role: "client",
    },
  }
}

export async function authenticateAdmin(email: string, password: string) {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { success: false, error: error?.message || "Invalid credentials" }
  }

  // Fetch admin user details from our custom table
  const { data: adminUserData, error: adminUserError } = await supabaseAdmin
    .from("admin_users")
    .select("id, name, email, role")
    .eq("id", data.user.id)
    .single()

  if (adminUserError || !adminUserData) {
    // This user is authenticated by Supabase Auth but not found in our admin_users table
    await supabase.auth.signOut()
    return { success: false, error: "User not authorized for admin access." }
  }

  // Update last_login for the admin user
  await supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUserData.id)

  await logActivity({
    action: "Admin login",
    details: `Admin ${adminUserData.name} (${adminUserData.id}) logged in`,
    user: adminUserData.name,
    userType: "admin",
  })

  return {
    success: true,
    user: {
      id: adminUserData.id,
      name: adminUserData.name,
      email: adminUserData.email,
      role: adminUserData.role,
    },
  }
}

export async function logout() {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/dashboard")
  revalidatePath("/client/dashboard")
  revalidatePath("/")
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Check if it's an admin user
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single()

  if (adminData) {
    return {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      type: "admin",
    }
  }

  // Check if it's a client user
  const { data: clientData, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("id, name, username, email, status")
    .eq("email", user.email)
    .single()

  if (clientData) {
    return {
      id: clientData.id,
      name: clientData.name,
      username: clientData.username,
      email: clientData.email,
      role: "client",
      type: "client",
    }
  }

  return null
}

// Client Registration Functions
export async function checkClientIdAvailability(clientId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (clientId.length < 4) {
    return { available: false, error: "Client ID must be at least 4 characters" }
  }

  const { data, error } = await supabaseAdmin.from("clients").select("id").eq("id", clientId).single()

  if (data) {
    return { available: false, error: "This Client ID is already in use" }
  }

  return { available: true }
}

export async function verifyClientId(clientId: string, isCustomId = false) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (isCustomId) {
    const { available, error } = await checkClientIdAvailability(clientId)

    if (!available) {
      return { success: false, error }
    }

    return { success: true }
  }

  const { data: client, error } = await supabaseAdmin.from("clients").select("*").eq("id", clientId).single()

  if (error || !client) {
    return { success: false, error: "Client ID not found" }
  }

  if (client.is_registered) {
    return { success: false, error: "Client is already registered" }
  }

  if (client.status !== "active") {
    return { success: false, error: "Client account is not active" }
  }

  return { success: true, client }
}

export async function registerClient({
  clientId,
  email,
  username,
  password,
  isCustomId = false,
}: {
  clientId: string
  email: string
  username: string
  password: string
  isCustomId?: boolean
}) {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  if (username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters" }
  }

  // Check if username is already taken
  const { data: existingUsername } = await supabaseAdmin
    .from("clients")
    .select("username")
    .eq("username", username)
    .single()

  if (existingUsername) {
    return { success: false, error: "Username is already taken" }
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || "Failed to create user account" }
  }

  if (isCustomId) {
    // Create new client record
    const { error: clientError } = await supabaseAdmin.from("clients").insert({
      id: clientId,
      name: username,
      email,
      username,
      status: "active",
      documents: 0,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_registered: true,
    })

    if (clientError) {
      // Clean up auth user if client creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: "Failed to create client record" }
    }

    await logActivity({
      action: "Client registered",
      details: `New client ${username} (${clientId}) registered with custom ID`,
      user: username,
      userType: "client",
    })

    await createNotification({
      title: "Welcome to Santu Saha Hero",
      message: "Your account has been created. You can now access your financial documents securely.",
      type: "info",
      recipientId: clientId,
      recipientType: "client",
    })

    revalidatePath("/admin/clients")
    return { success: true }
  } else {
    // Update existing client record
    const { error: updateError } = await supabaseAdmin
      .from("clients")
      .update({
        email,
        username,
        is_registered: true,
        last_active: new Date().toISOString(),
      })
      .eq("id", clientId)

    if (updateError) {
      // Clean up auth user if update fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: "Failed to update client record" }
    }

    const { data: client } = await supabaseAdmin.from("clients").select("name").eq("id", clientId).single()

    await logActivity({
      action: "Client registered",
      details: `Client ${client?.name} (${clientId}) completed registration`,
      user: client?.name || username,
      userType: "client",
    })

    await createNotification({
      title: "Registration Complete",
      message: "Welcome to Santu Saha Hero Secure Client Portal. Your account is now active.",
      type: "info",
      recipientId: clientId,
      recipientType: "client",
    })

    revalidatePath("/admin/clients")
    return { success: true }
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
  const { data, error } = await supabaseAdmin.from("clients").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
    return []
  }

  return data.map((client: any) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    contactPerson: client.contact_person,
    status: client.status,
    documents: client.documents || 0,
    lastActive: client.last_active ? new Date(client.last_active).toLocaleString() : undefined,
    createdAt: new Date(client.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isRegistered: client.is_registered,
    username: client.username,
  }))
}

export async function getClient(id: string) {
  const { data, error } = await supabaseAdmin.from("clients").select("*").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    contactPerson: data.contact_person,
    status: data.status,
    documents: data.documents || 0,
    lastActive: data.last_active ? new Date(data.last_active).toLocaleString() : undefined,
    createdAt: new Date(data.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isRegistered: data.is_registered,
    username: data.username,
  }
}

export async function createClient(formData: FormData) {
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
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const contactPerson = formData.get("contactPerson") as string
  const status = formData.get("status") as "active" | "inactive" | "pending"
  const username = formData.get("username") as string

  if (!id || !name || !email) {
    return { error: "Missing required fields" }
  }

  // Check if email is already used by another client
  const { data: existingEmail } = await supabaseAdmin
    .from("clients")
    .select("id")
    .eq("email", email)
    .neq("id", id)
    .single()

  if (existingEmail) {
    return { error: "Email already in use" }
  }

  // Check if username is already used by another client
  if (username) {
    const { data: existingUsername } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .single()

    if (existingUsername) {
      return { error: "Username already taken" }
    }
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      name,
      email,
      phone,
      address,
      contact_person: contactPerson,
      status,
      username,
    })
    .eq("id", id)

  if (error) {
    return { error: "Failed to update client" }
  }

  await logActivity({
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
  // Get client info before deletion
  const { data: client } = await supabaseAdmin.from("clients").select("name, email").eq("id", id).single()

  if (!client) {
    return { error: "Client not found" }
  }

  // Delete related records first
  await supabaseAdmin.from("documents").delete().eq("client_id", id)
  await supabaseAdmin.from("notifications").delete().eq("recipient_id", id)
  await supabaseAdmin.from("activities").delete().eq("user", client.name)

  // Delete auth user if exists
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = authUsers.users.find((user) => user.email === client.email)
  if (authUser) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
  }

  // Delete client record
  const { error } = await supabaseAdmin.from("clients").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete client" }
  }

  await logActivity({
    action: "Client deleted",
    details: `Client ${client.name} (${id}) deleted`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/clients")

  return { success: true }
}

export async function resetClientPassword(id: string) {
  const { data: client } = await supabaseAdmin.from("clients").select("name, email").eq("id", id).single()

  if (!client) {
    return { error: "Client not found" }
  }

  const tempPassword = Math.random().toString(36).slice(2, 10)

  // Find and update auth user password
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = authUsers.users.find((user) => user.email === client.email)

  if (authUser) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      password: tempPassword,
    })

    if (error) {
      return { error: "Failed to reset password" }
    }
  } else {
    return { error: "User account not found" }
  }

  await createNotification({
    title: "Password Reset",
    message: "Your password has been reset. Please use the temporary password to log in and set a new password.",
    type: "warning",
    recipientId: id,
    recipientType: "client",
  })

  await logActivity({
    action: "Client password reset",
    details: `Password reset for ${client.name} (${id})`,
    user: "Admin User",
    userType: "admin",
  })

  return { success: true, tempPassword }
}

// Document Management
export async function getDocuments() {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select(`
      *,
      clients!inner(name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error)
    return []
  }

  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    client: doc.clients.name,
    clientId: doc.client_id,
    uploadDate: new Date(doc.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    size: doc.size,
    viewed: doc.viewed,
    downloaded: doc.downloaded || 0,
    shareLink: doc.share_link,
    description: doc.description,
    file_url: doc.file_url,
  }))
}

export async function getClientDocuments(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select(`
      *,
      clients!inner(name)
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client documents:", error)
    return []
  }

  return data.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    client: doc.clients.name,
    clientId: doc.client_id,
    uploadDate: new Date(doc.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    size: doc.size,
    viewed: doc.viewed,
    downloaded: doc.downloaded || 0,
    shareLink: doc.share_link,
    description: doc.description,
    file_url: doc.file_url,
  }))
}

export async function uploadDocument(formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const clientId = formData.get("clientId") as string
  const description = formData.get("description") as string
  const file = formData.get("file") as File
  const generateLink = formData.get("generateLink") === "true"

  if (!name || !type || !clientId || !file) {
    return { error: "Missing required fields" }
  }

  const { data: client } = await supabaseAdmin.from("clients").select("name").eq("id", clientId).single()

  if (!client) {
    return { error: "Client not found" }
  }

  const id = `DOC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`
  const size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  // Upload file to Supabase Storage
  const fileName = `${clientId}/${id}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from("documents").upload(fileName, file)

  if (uploadError) {
    return { error: "Failed to upload file" }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from("documents").getPublicUrl(fileName)

  let shareLink = undefined
  if (generateLink) {
    const randomId = Math.random().toString(36).substring(2, 15)
    const timestamp = Date.now().toString(36)
    shareLink = `https://portal.santusahahero.com/share/${randomId}-${timestamp}`
  }

  // Create document record
  const { data: newDocument, error: docError } = await supabaseAdmin
    .from("documents")
    .insert({
      id,
      name,
      type,
      client_id: clientId,
      size,
      viewed: false,
      downloaded: 0,
      description,
      share_link: shareLink,
      file_url: publicUrl,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (docError) {
    // Clean up uploaded file if document creation fails
    await supabaseAdmin.storage.from("documents").remove([fileName])
    return { error: "Failed to create document record" }
  }

  // Update client document count
  await supabaseAdmin
    .from("clients")
    .update({ documents: supabaseAdmin.raw("documents + 1") })
    .eq("id", clientId)

  await createNotification({
    title: "New Document Available",
    message: `A new document "${name}" has been uploaded to your account.`,
    type: "info",
    recipientId: clientId,
    recipientType: "client",
  })

  await logActivity({
    action: "Document uploaded",
    details: `Document "${name}" uploaded for ${client.name} (${clientId})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/documents")
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath("/client/documents")

  return {
    document: {
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
    },
  }
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
  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select(`
      *,
      clients!inner(name)
    `)
    .eq("id", id)
    .single()

  if (error || !document) {
    return { error: "Document not found" }
  }

  // Delete file from storage
  if (document.file_url) {
    const fileName = document.file_url.split("/").pop()
    if (fileName) {
      await supabaseAdmin.storage.from("documents").remove([`${document.client_id}/${fileName}`])
    }
  }

  // Delete document record
  const { error: deleteError } = await supabaseAdmin.from("documents").delete().eq("id", id)

  if (deleteError) {
    return { error: "Failed to delete document" }
  }

  // Update client document count
  await supabaseAdmin
    .from("clients")
    .update({ documents: supabaseAdmin.raw("GREATEST(documents - 1, 0)") })
    .eq("id", document.client_id)

  await logActivity({
    action: "Document deleted",
    details: `Document "${document.name}" deleted for ${document.clients.name} (${document.client_id})`,
    user: "Admin User",
    userType: "admin",
  })

  revalidatePath("/admin/documents")
  revalidatePath(`/admin/clients/${document.client_id}`)
  revalidatePath("/client/documents")

  return { success: true }
}

export async function shareDocuments(formData: FormData) {
  const documentIds = formData.getAll("documentIds") as string[]
  const clientIds = formData.getAll("clientIds") as string[]

  if (!documentIds.length || !clientIds.length) {
    return { error: "Missing required fields" }
  }

  const sharedDocuments: Document[] = []

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
export async function getActivities() {
  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching activities:", error)
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

export async function logActivity(data: Omit<Activity, "id" | "timestamp" | "ip">) {
  const id = `ACT${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  await supabaseAdmin.from("activities").insert({
    id,
    action: data.action,
    details: data.details,
    user: data.user,
    user_type: data.userType,
    ip: "192.168.1.1",
    created_at: new Date().toISOString(),
  })

  return {
    id,
    ...data,
    timestamp: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    ip: "192.168.1.1",
  }
}

// Notifications
export async function getNotifications(recipientId: string, recipientType: "admin" | "client") {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .eq("recipient_type", recipientType)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data.map((notification: any) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    createdAt: new Date(notification.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    recipientId: notification.recipient_id,
    recipientType: notification.recipient_type,
  }))
}

export async function createNotification(data: Omit<Notification, "id" | "createdAt" | "read">) {
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
  const { error } = await supabaseAdmin.from("notifications").update({ read: true }).eq("id", id)

  if (error) {
    return { error: "Notification not found" }
  }

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
  const { data: clients } = await supabaseAdmin.from("clients").select("*")
  const { data: documents } = await supabaseAdmin.from("documents").select("*")
  const { data: activities } = await supabaseAdmin
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const totalClients = clients?.length || 0
  const activeClients = clients?.filter((client) => client.status === "active").length || 0
  const totalDocuments = documents?.length || 0

  const documentsByType =
    documents?.reduce((acc: Record<string, number>, doc: any) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {}) || {}

  const recentActivities =
    activities?.map((activity: any) => ({
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
    })) || []

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
  const { data: client } = await supabaseAdmin.from("clients").select("*").eq("id", clientId).single()

  if (!client) {
    return { error: "Client not found" }
  }

  const { data: clientDocuments } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const { data: clientNotifications } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("recipient_id", clientId)
    .eq("recipient_type", "client")
    .order("created_at", { ascending: false })
    .limit(5)

  const recentDocuments = (clientDocuments || []).slice(0, 5).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    client: client.name,
    clientId: doc.client_id,
    uploadDate: new Date(doc.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    size: doc.size,
    viewed: doc.viewed,
    downloaded: doc.downloaded || 0,
    shareLink: doc.share_link,
    description: doc.description,
    file_url: doc.file_url,
  }))

  const documentsByType = (clientDocuments || []).reduce((acc: Record<string, number>, doc: any) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1
    return acc
  }, {})

  const notifications = (clientNotifications || []).map((notification: any) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    createdAt: new Date(notification.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
    recipientId: notification.recipient_id,
    recipientType: notification.recipient_type,
  }))

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
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      contactPerson: client.contact_person,
      status: client.status,
      documents: client.documents || 0,
      lastActive: client.last_active ? new Date(client.last_active).toLocaleString() : undefined,
      createdAt: new Date(client.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isRegistered: client.is_registered,
      username: client.username,
    },
    totalDocuments: clientDocuments?.length || 0,
    recentDocuments,
    documentsByType,
    notifications,
    documentActivity,
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
