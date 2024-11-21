"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId, updateProfile } from "@/db/profile"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import {
  fetchHostedModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { TablesUpdate } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { APIStep } from "../../../components/setup/api-step"
import { FinishStep } from "../../../components/setup/finish-step"
import { ProfileStep } from "../../../components/setup/profile-step"
import {
  SETUP_STEP_COUNT,
  StepContainer
} from "../../../components/setup/step-container"
import { useSession } from "next-auth/react"

export default function SetupPage() {
  const {
    profile,
    setProfile,
    setWorkspaces,
    setSelectedWorkspace,
    setEnvKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(1)

  // Profile Step
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  // API Step
  const [useAzureOpenai, setUseAzureOpenai] = useState(false)
  const [openaiAPIKey, setOpenaiAPIKey] = useState("")
  const [openaiOrgID, setOpenaiOrgID] = useState("")
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState("")
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState("")
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState("")
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState("")
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState("")
  const [azureOpenaiEmbeddingsID, setAzureOpenaiEmbeddingsID] = useState("")
  const [anthropicAPIKey, setAnthropicAPIKey] = useState("")
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState("")
  const [mistralAPIKey, setMistralAPIKey] = useState("")
  const [groqAPIKey, setGroqAPIKey] = useState("")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState("")
  const [openrouterAPIKey, setOpenrouterAPIKey] = useState("")

  useEffect(() => {
    ;(async () => {
      console.log("🔄 [Setup] Starting setup effect with status:", status)
      console.log("👤 [Setup] Session data:", {
        exists: !!session,
        user: session?.user,
        expires: session?.expires
      })

      if (status === "loading") {
        console.log("⏳ [Setup] Session loading, waiting...")
        return
      }

      if (!session) {
        console.log("❌ [Setup] No session found, redirecting to login")
        return router.push("/login")
      } else {
        const userId = session.user.id
        console.log("✅ [Setup] User authenticated:", { userId })

        try {
          console.log("🔍 [Setup] Fetching user profile...")
          const profile = await getProfileByUserId(userId)
          console.log("📋 [Setup] Profile found:", profile)

          setProfile(profile)
          setUsername(profile.username)

          if (!profile.has_onboarded) {
            console.log("👋 [Setup] User not onboarded, showing setup wizard")
            setLoading(false)
          } else {
            console.log("🔄 [Setup] User already onboarded, fetching models...")
            const data = await fetchHostedModels(profile)

            if (!data) {
              console.log("❌ [Setup] No hosted models data found")
              return
            }

            console.log("📦 [Setup] Setting env keys and hosted models")
            setEnvKeyMap(data.envKeyMap)
            setAvailableHostedModels(data.hostedModels)

            if (profile["openrouter_api_key"] || data.envKeyMap["openrouter"]) {
              console.log("🔄 [Setup] Fetching OpenRouter models...")
              const openRouterModels = await fetchOpenRouterModels()
              if (!openRouterModels) {
                console.log("❌ [Setup] No OpenRouter models found")
                return
              }
              console.log("✅ [Setup] OpenRouter models fetched")
              setAvailableOpenRouterModels(openRouterModels)
            }

            console.log("🏠 [Setup] Getting home workspace...")
            const homeWorkspaceId = await getHomeWorkspaceByUserId(userId)
            console.log("↪️ [Setup] Redirecting to chat:", homeWorkspaceId)
            return router.push(`/${homeWorkspaceId}/chat`)
          }
        } catch (error) {
          console.error("💥 [Setup] Error in setup process:", error)
        }
      }
    })()
  }, [status, session])

  const handleShouldProceed = (proceed: boolean) => {
    if (proceed) {
      if (currentStep === SETUP_STEP_COUNT) {
        handleSaveSetupSetting()
      } else {
        setCurrentStep(currentStep + 1)
      }
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveSetupSetting = async () => {
    console.log("💾 [Setup] Starting save setup settings")

    if (!session) {
      console.log("❌ [Setup] No session found, redirecting to login")
      return router.push("/login")
    }

    const userId = session.user.id
    console.log("👤 [Setup] Saving settings for user:", userId)

    try {
      console.log("🔍 [Setup] Fetching current profile...")
      const profile = await getProfileByUserId(userId)

      const updateProfilePayload: TablesUpdate<"profiles"> = {
        ...profile,
        has_onboarded: true,
        display_name: displayName,
        username,
        openai_api_key: openaiAPIKey,
        openai_organization_id: openaiOrgID,
        anthropic_api_key: anthropicAPIKey,
        google_gemini_api_key: googleGeminiAPIKey,
        mistral_api_key: mistralAPIKey,
        groq_api_key: groqAPIKey,
        perplexity_api_key: perplexityAPIKey,
        openrouter_api_key: openrouterAPIKey,
        use_azure_openai: useAzureOpenai,
        azure_openai_api_key: azureOpenaiAPIKey,
        azure_openai_endpoint: azureOpenaiEndpoint,
        azure_openai_35_turbo_id: azureOpenai35TurboID,
        azure_openai_45_turbo_id: azureOpenai45TurboID,
        azure_openai_45_vision_id: azureOpenai45VisionID,
        azure_openai_embeddings_id: azureOpenaiEmbeddingsID
      }
      console.log("📝 [Setup] Update payload:", updateProfilePayload)

      console.log("💾 [Setup] Updating profile...")
      const updatedProfile = await updateProfile(
        profile.id,
        updateProfilePayload
      )
      console.log("✅ [Setup] Profile updated:", updatedProfile)
      setProfile(updatedProfile)

      console.log("🔍 [Setup] Fetching workspaces...")
      const workspaces = await getWorkspacesByUserId(userId)
      const homeWorkspace = workspaces.find(w => w.is_home)
      console.log("🏠 [Setup] Home workspace found:", homeWorkspace)

      setSelectedWorkspace(homeWorkspace!)
      setWorkspaces(workspaces)

      console.log("↪️ [Setup] Redirecting to chat")
      return router.push(`/${homeWorkspace?.id}/chat`)
    } catch (error) {
      console.error("💥 [Setup] Error saving setup settings:", error)
    }
  }

  const renderStep = (stepNum: number) => {
    switch (stepNum) {
      // Profile Step
      case 1:
        return (
          <StepContainer
            stepDescription="Let's create your profile."
            stepNum={currentStep}
            stepTitle="Welcome to Chatbot UI"
            onShouldProceed={handleShouldProceed}
            showNextButton={!!(username && usernameAvailable)}
            showBackButton={false}
          >
            <ProfileStep
              username={username}
              usernameAvailable={usernameAvailable}
              displayName={displayName}
              onUsernameAvailableChange={setUsernameAvailable}
              onUsernameChange={setUsername}
              onDisplayNameChange={setDisplayName}
            />
          </StepContainer>
        )

      // API Step
      case 2:
        return (
          <StepContainer
            stepDescription="Enter API keys for each service you'd like to use."
            stepNum={currentStep}
            stepTitle="Set API Keys (optional)"
            onShouldProceed={handleShouldProceed}
            showNextButton={true}
            showBackButton={true}
          >
            <APIStep
              openaiAPIKey={openaiAPIKey}
              openaiOrgID={openaiOrgID}
              azureOpenaiAPIKey={azureOpenaiAPIKey}
              azureOpenaiEndpoint={azureOpenaiEndpoint}
              azureOpenai35TurboID={azureOpenai35TurboID}
              azureOpenai45TurboID={azureOpenai45TurboID}
              azureOpenai45VisionID={azureOpenai45VisionID}
              azureOpenaiEmbeddingsID={azureOpenaiEmbeddingsID}
              anthropicAPIKey={anthropicAPIKey}
              googleGeminiAPIKey={googleGeminiAPIKey}
              mistralAPIKey={mistralAPIKey}
              groqAPIKey={groqAPIKey}
              perplexityAPIKey={perplexityAPIKey}
              useAzureOpenai={useAzureOpenai}
              onOpenaiAPIKeyChange={setOpenaiAPIKey}
              onOpenaiOrgIDChange={setOpenaiOrgID}
              onAzureOpenaiAPIKeyChange={setAzureOpenaiAPIKey}
              onAzureOpenaiEndpointChange={setAzureOpenaiEndpoint}
              onAzureOpenai35TurboIDChange={setAzureOpenai35TurboID}
              onAzureOpenai45TurboIDChange={setAzureOpenai45TurboID}
              onAzureOpenai45VisionIDChange={setAzureOpenai45VisionID}
              onAzureOpenaiEmbeddingsIDChange={setAzureOpenaiEmbeddingsID}
              onAnthropicAPIKeyChange={setAnthropicAPIKey}
              onGoogleGeminiAPIKeyChange={setGoogleGeminiAPIKey}
              onMistralAPIKeyChange={setMistralAPIKey}
              onGroqAPIKeyChange={setGroqAPIKey}
              onPerplexityAPIKeyChange={setPerplexityAPIKey}
              onUseAzureOpenaiChange={setUseAzureOpenai}
              openrouterAPIKey={openrouterAPIKey}
              onOpenrouterAPIKeyChange={setOpenrouterAPIKey}
            />
          </StepContainer>
        )

      // Finish Step
      case 3:
        return (
          <StepContainer
            stepDescription="You are all set up!"
            stepNum={currentStep}
            stepTitle="Setup Complete"
            onShouldProceed={handleShouldProceed}
            showNextButton={true}
            showBackButton={true}
          >
            <FinishStep displayName={displayName} />
          </StepContainer>
        )
      default:
        return null
    }
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center">
      {renderStep(currentStep)}
    </div>
  )
}
