import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { CustomSupabaseAdapter } from "@/lib/auth/supabase-adapter"
import { Adapter } from "next-auth/adapters"

const adapter = CustomSupabaseAdapter() as Required<Adapter>

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid email profile roles offline_access organization"
        }
      }
    })
  ],
  adapter,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("🔑 [NextAuth] SignIn callback for user:", user.id)
        console.log(user)
        console.log(account)
        console.log("END OF REQUEST")

        if (account?.provider !== "keycloak") {
          console.error(
            "❌ [NextAuth] Unsupported provider:",
            account?.provider
          )
          return false
        }

        const existingUser = await adapter.getUserByAccount({
          providerAccountId: account.providerAccountId,
          provider: account.provider
        })

        if (!existingUser) {
          try {
            const newUser = await adapter.createUser({
              id: user.id,
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: null
            })

            if (account && newUser) {
              await adapter.linkAccount({
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state
              })
            }
          } catch (error) {
            console.error("❌ [NextAuth] Error in user creation:", error)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("❌ [NextAuth] SignIn error:", error)
        return false
      }
    },

    async session({ session, token }) {
      if (!token.sub) {
        throw new Error("No user ID in token")
      }

      session.user.id = token.sub
      session.accessToken = token.accessToken as string

      return session
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
    error: "/error"
  }
})

export { handler as GET, handler as POST }
