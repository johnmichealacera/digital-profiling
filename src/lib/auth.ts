import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/generated/prisma/client"
import { resolveTenantBranding } from "@/lib/tenant-branding"

declare module "next-auth" {
  interface User {
    role: UserRole
    position?: string | null
    barangayId?: string | null
    municipalityId?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      position?: string | null
      barangayId?: string | null
      municipalityId?: string | null
      /** Sidebar / header primary label */
      tenantTitle?: string | null
      /** Sidebar / header secondary (municipality, province, scope) */
      tenantSubtitle?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    position?: string | null
    barangayId?: string | null
    municipalityId?: string | null
    tenantTitle?: string | null
    tenantSubtitle?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          position: user.position,
          barangayId: user.barangayId,
          municipalityId: user.municipalityId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.position = user.position
        token.barangayId = user.barangayId
        token.municipalityId = user.municipalityId
        const branding = await resolveTenantBranding({
          role: user.role,
          barangayId: user.barangayId,
          municipalityId: user.municipalityId,
        })
        token.tenantTitle = branding.tenantTitle
        token.tenantSubtitle = branding.tenantSubtitle
      } else if (token.id && token.tenantTitle == null) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, barangayId: true, municipalityId: true },
        })
        if (dbUser) {
          const branding = await resolveTenantBranding({
            role: dbUser.role,
            barangayId: dbUser.barangayId,
            municipalityId: dbUser.municipalityId,
          })
          token.tenantTitle = branding.tenantTitle
          token.tenantSubtitle = branding.tenantSubtitle
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.position = token.position
        session.user.barangayId = token.barangayId
        session.user.municipalityId = token.municipalityId
        session.user.tenantTitle = token.tenantTitle ?? null
        session.user.tenantSubtitle = token.tenantSubtitle ?? null
      }
      return session
    },
  },
}
