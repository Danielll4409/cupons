// ==========================
// 🔒 Autenticação completa
// ==========================
import { cookies } from "next/headers"
import { query } from "./db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// ==========================
// Tipos
// ==========================
export interface User {
  id: number
  nome: string
  email: string
  papel: "usuario" | "admin"
  avatar_url?: string | null
  criado_em?: Date
}

export interface JWTPayload {
  id: number
  nome: string
  email: string
  papel: "usuario" | "admin"
}

// ==========================
// Hash e verificação de senha
// ==========================
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// ==========================
// JWT - geração e verificação
// ==========================
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    papel: user.papel,
  }

  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

// ==========================
// Criar sessão (gera cookie JWT)
// ==========================
export async function createSession(userId: number): Promise<string> {
  const [user] = await query(
    "SELECT id, nome, email, papel FROM usuarios WHERE id = ? LIMIT 1",
    [userId]
  )

  if (!user) throw new Error("Usuário não encontrado")

  const token = generateToken({
    id: user.id,
    nome: user.nome,
    email: user.email,
    papel: user.papel,
  })

  // ✅ grava o cookie JWT
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  })

  return token
}

// ==========================
// Obter usuário atual (pelo cookie JWT)
// ==========================
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const [usuario] = await query(
      "SELECT id, nome, email, papel, avatar_url, criado_em FROM usuarios WHERE id = ? LIMIT 1",
      [payload.id]
    )

    if (!usuario) return null

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      avatar_url: usuario.avatar_url,
      criado_em: usuario.criado_em,
    }
  } catch (error) {
    console.error("❌ Erro ao obter usuário atual:", error)
    return null
  }
}

// ==========================
// Encerrar sessão (apaga cookie)
// ==========================
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}

// ==========================
// Verificações de papel
// ==========================
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.papel === "admin"
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Usuário não autenticado. Faça login para continuar.")
  }

  if (user.papel !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem acessar esta rota.")
  }

  return user
}
