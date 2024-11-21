import { createClient } from "@supabase/supabase-js"
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken
} from "next-auth/adapters"

interface CustomAdapterUser extends AdapterUser {
  is_sso_user?: boolean
  instance_id?: string
  aud?: string
  role?: string
  customAccessToken?: string
}

interface CreateUserParams {
  id?: string
  email: string
  emailVerified?: Date | null
  name?: string | null
  image?: string | null
}

export function CustomSupabaseAdapter(): Adapter {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: "next_auth"
      }
    }
  )

  return {
    async createUser(user: CreateUserParams): Promise<CustomAdapterUser> {
      console.log("📝 [Adapter] Creating user:", user)
      try {
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              ...user,
              is_sso_user: true,
              instance_id: user.id,
              aud: "authenticated",
              role: "authenticated"
            }
          ])
          .select()
          .single()

        if (error) {
          console.error("❌ [Adapter] Error creating user:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }
        console.log("✅ [Adapter] User created:", data)
        return data as CustomAdapterUser
      } catch (e: any) {
        console.error("💥 [Adapter] Unexpected error in createUser:", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
          cause: e?.cause,
          error: e
        })
        throw e
      }
    },

    async getUser(id: string): Promise<CustomAdapterUser | null> {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .single()

      if (error) return null
      return data as CustomAdapterUser
    },

    async getUserByEmail(email: string): Promise<CustomAdapterUser | null> {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .single()

      if (error) return null
      return data as CustomAdapterUser
    },

    async getUserByAccount({
      providerAccountId,
      provider
    }: {
      providerAccountId: string
      provider: string
    }): Promise<CustomAdapterUser | null> {
      console.log("🔍 [Adapter] Getting user by account:", {
        providerAccountId,
        provider
      })
      try {
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("user_id")
          .eq("provider_account_id", providerAccountId)
          .eq("provider", provider)
          .single()

        if (accountError) {
          console.error("❌ [Adapter] Error getting account:", {
            code: accountError.code,
            message: accountError.message,
            details: accountError.details,
            hint: accountError.hint
          })
          return null
        }

        console.log("📋 [Adapter] Found account:", account)

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", account.user_id)
          .single()

        if (userError) {
          console.error("❌ [Adapter] Error getting user:", {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint
          })
          return null
        }

        console.log("✅ [Adapter] Found user:", user)
        return user as CustomAdapterUser
      } catch (e: any) {
        console.error("💥 [Adapter] Unexpected error in getUserByAccount:", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
          cause: e?.cause,
          error: e
        })
        return null
      }
    },

    async updateUser(
      user: Partial<CustomAdapterUser> & { id: string }
    ): Promise<CustomAdapterUser> {
      const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error
      return data as CustomAdapterUser
    },

    async deleteUser(userId: string): Promise<void> {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error
    },

    async linkAccount(account: AdapterAccount): Promise<AdapterAccount> {
      console.log("🔗 [Adapter] Linking account:", {
        userId: account.userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId
      })

      const { error } = await supabase.from("accounts").insert([
        {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state
        }
      ])

      if (error) {
        console.error("❌ [Adapter] Error linking account:", error)
        throw error
      }

      console.log("✅ [Adapter] Account linked successfully")
      return account
    },

    async unlinkAccount({
      providerAccountId,
      provider
    }: {
      providerAccountId: string
      provider: string
    }): Promise<void> {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("provider_account_id", providerAccountId)
        .eq("provider", provider)

      if (error) throw error
    },

    async createSession(session: {
      sessionToken: string
      userId: string
      expires: Date
    }): Promise<AdapterSession> {
      const { data, error } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: session.userId,
            expires: session.expires,
            session_token: session.sessionToken
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data as AdapterSession
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession
      user: CustomAdapterUser
    } | null> {
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*, user:users(*)")
        .eq("session_token", sessionToken)
        .single()

      if (sessionError) return null

      const { user, ...sessionData } = session

      return {
        session: sessionData as AdapterSession,
        user: user as CustomAdapterUser
      }
    },

    async updateSession(
      session: Partial<AdapterSession> & { sessionToken: string }
    ): Promise<AdapterSession | null> {
      const { data, error } = await supabase
        .from("sessions")
        .update({
          expires: session.expires
        })
        .eq("session_token", session.sessionToken)
        .select()
        .single()

      if (error) throw error
      return data as AdapterSession
    },

    async deleteSession(sessionToken: string): Promise<void> {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken)

      if (error) throw error
    },

    async createVerificationToken(
      token: VerificationToken
    ): Promise<VerificationToken> {
      const { data, error } = await supabase
        .from("verification_tokens")
        .insert([
          {
            identifier: token.identifier,
            token: token.token,
            expires: token.expires
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },

    async useVerificationToken({
      identifier,
      token
    }: {
      identifier: string
      token: string
    }): Promise<VerificationToken | null> {
      const { data, error } = await supabase
        .from("verification_tokens")
        .delete()
        .match({ identifier, token })
        .select()
        .single()

      if (error) return null
      return data
    }
  }
}
