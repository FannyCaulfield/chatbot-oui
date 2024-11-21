import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return document.cookie
          .split("; ")
          .find(row => row.startsWith(`${name}=`))
          ?.split("=")[1]
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
