"use client"

import { SubmitButton } from "@/components/ui/submit-button"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function KeycloakButton() {
  const router = useRouter()

  const handleKeycloakLogin = async () => {
    try {
      await signIn("keycloak", {
        callbackUrl: "/auth/callback",
        redirect: true
      })
    } catch (error) {
      console.error("Keycloak login error:", error)
      router.push(
        `/login?message=${encodeURIComponent("Authentication failed")}`
      )
    }
  }

  return (
    <SubmitButton
      onClick={handleKeycloakLogin}
      className="border-foreground/20 mb-2 flex items-center justify-center gap-2 rounded-md border px-4 py-2"
    >
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L1.815 6v12L12 24l10.185-6V6L12 0zm0 2.32l8.41 4.928L12 12.177l-8.41-4.929L12 2.32zm-9 6.847L11.18 14v8.964l-8.18-4.817V9.167zm10.82 13.797V14l8.18-4.833v8.147l-8.18 4.817z" />
      </svg>
      Login with Keycloak
    </SubmitButton>
  )
}
