import axios from "axios";

import {
  GROQ_API_KEY,
  GROQ_BASE_URL,
  GROQ_CHAT_COMPLETIONS_URL,
  GROQ_MODEL_FROM_ENV,
  MAX_PRODUCTS_TO_LLM,
  MAX_PROMPT_CATALOG_CHARS,
  MODEL_CANDIDATES,
  applyBudgetConstraintFilter,
  buildCompactProductCatalog,
  buildPromptCatalog,
  buildRecommendationPrompt,
  detectStrictIntentGroups,
  extractBudgetConstraint,
  extractProductIds,
  getContextForPrompt,
  hasBudgetConstraint,
  isModelNotFoundError,
  matchesStrictIntentGroup,
  preselectCatalogForPrompt,
  trimPromptCatalogBySize,
} from "../../../utils/groq.utils";

let cachedGroqModel: string | null = null;

async function resolveGroqModelCandidates(): Promise<string[]> {
  if (GROQ_MODEL_FROM_ENV) {
    return [GROQ_MODEL_FROM_ENV];
  }

  const defaultCandidates = cachedGroqModel
    ? [
        cachedGroqModel,
        ...MODEL_CANDIDATES.filter((item) => item !== cachedGroqModel),
      ]
    : [...MODEL_CANDIDATES];

  try {
    const response = await axios.get(`${GROQ_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      timeout: 10000,
    });

    const modelIds: string[] = (response.data?.data ?? [])
      .map((item: any) => item?.id)
      .filter((id: unknown): id is string => typeof id === "string");

    const mergedCandidates = [...modelIds, ...defaultCandidates].filter(
      (value, index, arr) => arr.indexOf(value) === index,
    );

    return mergedCandidates.length > 0 ? mergedCandidates : defaultCandidates;
  } catch {
    return defaultCandidates;
  }
}

async function callGroq(prompt: string): Promise<string> {
  const modelCandidates = await resolveGroqModelCandidates();
  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const response = await axios.post(
        GROQ_CHAT_COMPLETIONS_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "Bạn là bộ máy xep hang san pham. Chi duoc tra ve mot mang JSON gom cac id san pham hop le ton tai trong danh sach dau vao. Cam tao id moi. Cam giai thich.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.05,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        },
      );

      console.log("[Groq] model:", model);
      console.log("[Groq] full response data:", response.data);
      console.log(
        "[Groq] message content:",
        response.data?.choices?.[0]?.message?.content ?? "",
      );

      cachedGroqModel = model;
      return response.data?.choices?.[0]?.message?.content ?? "";
    } catch (error: any) {
      lastError = error;

      if (isModelNotFoundError(error) && !GROQ_MODEL_FROM_ENV) {
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("No Groq model candidates available");
}

export async function getProductRecommendations(
  userInput: any,
  products: any[],
) {
  const latestMessage =
    typeof userInput?.message === "string" ? userInput.message.trim() : "";
  const conversationContext =
    typeof userInput?.context === "string" ? userInput.context.trim() : "";
  const contextForPrompt = getContextForPrompt(conversationContext);

  const compactCatalog = buildCompactProductCatalog(products);
  const inStockCatalog = compactCatalog.filter((item) => item.stock > 0);
  const strictIntentGroups = detectStrictIntentGroups(latestMessage);
  const budgetConstraint = extractBudgetConstraint(latestMessage);

  const candidateCatalog =
    strictIntentGroups.length > 0
      ? inStockCatalog.filter((item) =>
          matchesStrictIntentGroup(item.searchText, strictIntentGroups),
        )
      : inStockCatalog;

  if (strictIntentGroups.length > 0 && candidateCatalog.length === 0) {
    console.log(
      "[Groq] strict intent detected but no matching products in catalog:",
      strictIntentGroups.map((group) => group.key),
    );
    return [];
  }

  if (candidateCatalog.length === 0) {
    console.log("[Groq] candidate catalog is empty after stock/intent filter.");
    return [];
  }

  const budgetFilteredCatalog = applyBudgetConstraintFilter(
    candidateCatalog,
    budgetConstraint,
  );

  if (
    hasBudgetConstraint(budgetConstraint) &&
    budgetFilteredCatalog.length === 0
  ) {
    console.log("[Groq] budget constraint filtered out all products.", {
      budgetConstraint,
    });
    return [];
  }

  const rankedCatalog = preselectCatalogForPrompt(
    latestMessage,
    budgetFilteredCatalog,
    budgetConstraint,
  );

  const promptCatalog = trimPromptCatalogBySize(
    buildPromptCatalog(rankedCatalog.slice(0, MAX_PRODUCTS_TO_LLM)),
    MAX_PROMPT_CATALOG_CHARS,
  );

  if (promptCatalog.length === 0) {
    console.log("[Groq] prompt catalog is empty after size trimming.", {
      maxPromptCatalogChars: MAX_PROMPT_CATALOG_CHARS,
    });
    return [];
  }

  console.log("[Groq] retrieval stats:", {
    total: compactCatalog.length,
    inStock: inStockCatalog.length,
    strictIntentMatched: candidateCatalog.length,
    budgetMatched: budgetFilteredCatalog.length,
    sentToLlm: promptCatalog.length,
    maxProductsToLlm: MAX_PRODUCTS_TO_LLM,
    maxPromptCatalogChars: MAX_PROMPT_CATALOG_CHARS,
  });

  const allowedProductIdSet = new Set(promptCatalog.map((item) => item.id));
  const prompt = buildRecommendationPrompt({
    latestMessage,
    contextForPrompt,
    strictIntentGroups,
    budgetConstraint,
    promptCatalog,
  });

  if (!GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY in environment");
    return [];
  }

  try {
    const rawText = await callGroq(prompt);
    console.log("[Groq] raw text before parse:", rawText);

    const productIds = extractProductIds(rawText);
    console.log("[Groq] parsed product ids:", productIds);

    const validatedProductIds = productIds.filter((id) =>
      allowedProductIdSet.has(id),
    );

    if (validatedProductIds.length !== productIds.length) {
      console.warn("[Groq] dropped ids outside allowed catalog", {
        raw: productIds,
        validated: validatedProductIds,
      });
    }

    if (validatedProductIds.length === 0) {
      console.warn(
        "[Groq] parsed product ids is empty. Hãy kiểm tra format content model trả về.",
      );
    }

    return validatedProductIds;
  } catch (error: any) {
    if (isModelNotFoundError(error)) {
      console.error(
        "Không tìm thấy model Groq khả dụng cho key hiện tại. Hãy set GROQ_MODEL đúng model từ API /openai/v1/models.",
      );
    }

    if (error?.response?.status === 401) {
      console.error("Groq API 401: API key không hợp lệ hoặc đã hết hạn.");
    }

    if (error?.response?.status === 403) {
      console.error(
        "Groq API 403: API key không đủ quyền hoặc tài khoản bị giới hạn.",
      );
    }

    if (error?.response?.status === 429) {
      console.error("Groq API 429: vượt giới hạn tốc độ, hãy thử lại sau.");
    }

    console.error("Groq API error:", error.message);
    console.error("Raw response:", error.response?.data);
    return [];
  }
}
