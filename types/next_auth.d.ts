import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      is_sso_user?: boolean
      instance_id?: string
      aud?: string
      role?: string
      customAccessToken?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    is_sso_user?: boolean
    instance_id?: string
    aud?: string
    role?: string
    customAccessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    is_sso_user?: boolean
    instance_id?: string
    aud?: string
    role?: string
    customAccessToken?: string
  }
}
