// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { headers } from "next/headers" // 👈 Qo'shildi: Brauzer ma'lumotlarini olish uchun

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔵 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    // 🟡 OTP LOGIN
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp_code: { label: "OTP Code", type: "text" },
      },
      // req orqali brauzer nomini xavfsiz olamiz (OTP uchun)
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.otp_code) return null

        const userAgent = req?.headers?.["user-agent"] || "Noma'lum qurilma"

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              otp_code: String(credentials.otp_code),
              device_name: userAgent, // Laravelga yuboramiz
            }),
          }
        )

        const data = await res.json()

        if (res.ok && data.access_token) {
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            is_premium: data.user.is_premium,
            token: data.access_token,
            image: data.user?.avatar || null,
          }
        }
        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Session yangilanishi uchun qo'shildi
      if (trigger === "update") {
        if (session?.image && token.user) {
          (token.user as any).image = session.image
        }
        if (session?.name && token.user) {
          (token.user as any).name = session.name
        }
      }

      if (account && user) {
        // ===================================
        // GOOGLE UCHUN QISMI
        // ===================================
        if (account.provider === "google") {
          try {
            // 👈 Google uchun ham haqiqiy brauzer ma'lumotini xavfsiz olamiz
            let userAgent = "Noma'lum qurilma"
            try {
              const hdrs = await headers()
              userAgent = hdrs.get("user-agent") || "Noma'lum qurilma"
            } catch (err) {
              console.error("User-Agent olishda xatolik")
            }

            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  token: account.id_token,
                  device_name: userAgent, // 👈 Endi "Google Login" emas, haqiqiy brauzer nomi ketadi
                }),
              }
            )

            const data = await res.json()

            if (res.ok && data.access_token) {
              token.accessToken = data.access_token
              token.role = data.user?.role || "user"
              token.is_premium = data.user?.is_premium || false
              token.user = {
                name: data.user?.name || user.name,
                email: data.user?.email || user.email,
                image: data.user?.avatar || user.image,
                role: data.user?.role || "user",
                is_premium: data.user?.is_premium || false,
              }
            } else {
              token.role = "user"
              token.is_premium = false
              token.user = {
                name: user.name,
                email: user.email,
                image: user.image,
                role: "user",
                is_premium: false,
              }
            }
          } catch (error) {
            console.error("Google login error:", error)
            token.role = "user"
            token.is_premium = false
            token.user = {
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              is_premium: false,
            }
          }
        }

        // ===================================
        // OTP UCHUN QISMI
        // ===================================
        if (account.provider === "credentials") {
          token.accessToken = (user as any).token
          token.role = (user as any).role
          token.is_premium = (user as any).is_premium
          token.user = user
        }
      }
      return token
    },

    async session({ session, token }) {
      session.user = token.user as any
      ;(session as any).accessToken = token.accessToken

      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).is_premium = token.is_premium
      }

      return session
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
