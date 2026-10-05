import Groq from "groq-sdk";

/**
 * Adapter pattern (critical): every AI capability goes through AIProvider.
 * GroqProvider (real) <-> MockProvider (deterministic, no key, no network).
 * Selected by AI_PROVIDER=groq|mock; Groq errors/timeouts/rate-limits fall
 * back to Mock automatically with `degraded: true`.
 *
 * Model IDs change often — verify at console.groq.com/docs/models and set
 * via env (GROQ_MODEL_*), never hardcode. Defaults below are starting points.
 */

export const MODELS = {
  chat: process.env.GROQ_MODEL_CHAT || "openai/gpt-oss-120b",
  fast: process.env.GROQ_MODEL_FAST || "openai/gpt-oss-20b",
  vision: process.env.GROQ_MODEL_VISION || "qwen/qwen3.8-27b",
  stt: process.env.GROQ_MODEL_STT || "whisper-large-v3-turbo",
} as const;

export type VisionImage = { mediaType: string; data: string }; // base64

export type VisionInput = {
  system: string;
  userText: string;
  images: VisionImage[];
};

export type LLMResult = {
  text: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
};

export interface AIProvider {
  readonly name: "groq" | "mock";
  /** Structured vision call. Always requests JSON; caller Zod-validates. */
  vision(input: VisionInput, opts?: { timeoutMs?: number }): Promise<LLMResult>;
  /** Plain chat completion (Phase 5 chatbot, Phase 4 explainers). */
  chat(input: {
    system: string;
    userText: string;
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
    fast?: boolean;
    timeoutMs?: number;
  }): Promise<LLMResult>;
  /** Whisper STT fallback (Phase 1). Audio <=30s webm/opus. */
  transcribe(audio: Buffer, languageHint?: string): Promise<{ text: string; model: string }>;
}

function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export function configuredProvider(): "groq" | "mock" {
  if ((process.env.AI_PROVIDER || "mock").toLowerCase() === "groq" && isGroqConfigured()) {
    return "groq";
  }
  return "mock";
}

class GroqProvider implements AIProvider {
  readonly name = "groq" as const;
  private client: Groq;

  constructor() {
    if (!isGroqConfigured()) throw new Error("groq-missing-key");
    // Server-side only. The key never reaches the browser.
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async vision(input: VisionInput, opts?: { timeoutMs?: number }): Promise<LLMResult> {
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: input.userText }];
    for (const img of input.images.slice(0, 4)) {
      content.push({ type: "image_url", image_url: { url: `data:${img.mediaType};base64,${img.data}` } });
    }
    const res = await this.client.chat.completions.create(
      {
        model: MODELS.vision,
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content },
        ],
      },
      { signal: AbortSignal.timeout(opts?.timeoutMs ?? 12000) }
    );
    const choice = res.choices[0]?.message?.content ?? "";
    return {
      text: choice,
      model: MODELS.vision,
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
  }

  async chat(input: {
    system: string;
    userText: string;
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
    fast?: boolean;
    timeoutMs?: number;
  }): Promise<LLMResult> {
    const res = await this.client.chat.completions.create(
      {
        model: input.fast ? MODELS.fast : MODELS.chat,
        temperature: input.temperature ?? 0.6,
        max_tokens: input.maxTokens ?? 500,
        ...(input.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.userText },
        ],
      },
      { signal: AbortSignal.timeout(input.timeoutMs ?? 8000) }
    );
    return {
      text: res.choices[0]?.message?.content ?? "",
      model: input.fast ? MODELS.fast : MODELS.chat,
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
  }

  async transcribe(audio: Buffer, languageHint?: string): Promise<{ text: string; model: string }> {
    const file = new File([new Uint8Array(audio)], "audio.webm", { type: "audio/webm" });
    const res = await this.client.audio.transcriptions.create(
      {
        file,
        model: MODELS.stt,
        ...(languageHint ? { language: languageHint } : {}),
        response_format: "json",
      },
      { signal: AbortSignal.timeout(20000) }
    );
    return { text: res.text ?? "", model: MODELS.stt };
  }
}

class MockProvider implements AIProvider {
  readonly name = "mock" as const;
  async vision(): Promise<LLMResult> {
    // Mock vision has no pixels: callers use deterministic fixtures instead.
    throw new Error("mock-no-vision");
  }
  async chat(): Promise<LLMResult> {
    throw new Error("mock-no-chat");
  }
  async transcribe(): Promise<{ text: string; model: string }> {
    throw new Error("mock-no-stt");
  }
}

/** The active provider. Mock methods throw by design — callers use fixtures. */
export function getAIProvider(): AIProvider {
  if (configuredProvider() === "groq") {
    try {
      return new GroqProvider();
    } catch {
      return new MockProvider();
    }
  }
  return new MockProvider();
}
