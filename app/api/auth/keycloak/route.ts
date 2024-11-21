// import { createClient } from '@supabase/supabase-js'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function POST(request: Request) {
//     console.log('📥 API: Received Keycloak login request')

//     const supabase = createClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.SUPABASE_SERVICE_ROLE_KEY!
//     )

//     console.log('🔌 API: Created Supabase client with:', {
//       url: process.env.NEXT_PUBLIC_SUPABASE_URL,
//       hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
//       redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
//     })

//     try {
//       console.log('🔄 API: Initiating OAuth flow with Keycloak')
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: 'keycloak',
//         options: {
//           redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
//           skipBrowserRedirect: true
//         }
//       })

//       if (error) {
//         console.error('❌ API: OAuth initiation error:', {
//           message: error.message,
//           status: error.status,
//           name: error.name
//         })
//         throw error
//       }

//       console.log('✅ API: OAuth URL generated:', {
//         url: data?.url,
//         hasUrl: !!data?.url,
//         provider: 'keycloak',
//         redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
//       })

//       return NextResponse.json({ url: data?.url })

//     } catch (error) {
//       console.error('💥 API: Fatal error:', {
//         error,
//         message: error.message,
//         name: error.name,
//         stack: error.stack
//       })
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }
// }
