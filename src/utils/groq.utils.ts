const QUERY_STOPWORDS = new Set([
  "toi",
  "minh",
  "muon",
  "can",
  "tim",
  "goi",
  "y",
  "san",
  "pham",
  "cho",
  "nhe",
  "voi",
  "giup",
  "min",
  "max",
  "la",
  "va",
  "de",
  "di",
  "mac",
  "the",
  "nao",
  "gi",
]);

function parsePositiveInt(
  rawValue: string | undefined,
  fallback: number,
): number {
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

export const GROQ_API_KEY =
  process.env.GROQ_API_KEY?.trim() || process.env.XAI_API_KEY?.trim();
export const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
export const GROQ_CHAT_COMPLETIONS_URL = `${GROQ_BASE_URL}/chat/completions`;
export const GROQ_MODEL_FROM_ENV =
  process.env.GROQ_MODEL?.trim() || process.env.XAI_MODEL?.trim();

export const MODEL_CANDIDATES = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

export const MAX_PRODUCTS_TO_LLM = parsePositiveInt(
  process.env.GROQ_MAX_PRODUCTS_TO_LLM,
  80,
);
export const MAX_PROMPT_CATALOG_CHARS = parsePositiveInt(
  process.env.GROQ_MAX_PROMPT_CATALOG_CHARS,
  50000,
);
export const MAX_CONTEXT_CHARS = parsePositiveInt(
  process.env.GROQ_MAX_CONTEXT_CHARS,
  900,
);

export interface CompactProductCatalogItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  discount: number;
  finalPrice: number;
  colors: string[];
  sizes: string[];
  material: string;
  stock: number;
  searchText: string;
}

export type PromptCatalogItem = Omit<CompactProductCatalogItem, "searchText">;

export interface BudgetConstraint {
  minPrice?: number;
  maxPrice?: number;
}

export interface StrictIntentGroup {
  key: string;
  keywords: string[];
  normalizedKeywords: string[];
}

const createIntentGroup = (
  key: string,
  keywords: string[],
): StrictIntentGroup => ({
  key,
  keywords,
  normalizedKeywords: keywords.map((keyword) => normalizeText(keyword)),
});

const STRICT_INTENT_GROUPS: StrictIntentGroup[] = [
  createIntentGroup("bikini", [
    "bikini",
    "do boi",
    "do tam",
    "swimwear",
    "swimsuit",
    "monokini",
    "ao boi",
    "quan boi",
    "ao tam",
    "quan tam",
  ]),
  createIntentGroup("ao-thun", [
    "ao thun",
    "t shirt",
    "t-shirt",
    "tshirt",
    "tee",
  ]),
  createIntentGroup("ao-so-mi", ["ao so mi", "shirt", "dress shirt"]),
  createIntentGroup("vay-dam", ["vay", "dam", "dress", "gown"]),
  createIntentGroup("chan-vay", ["chan vay", "skirt"]),
  createIntentGroup("quan-short", ["quan short", "short", "shorts"]),
  createIntentGroup("ao-khoac", ["ao khoac", "jacket", "blazer"]),
  createIntentGroup("hoodie", ["hoodie", "sweatshirt"]),
  createIntentGroup("giay", ["giay", "sneaker", "boots", "sandal", "loafer"]),
  createIntentGroup("tui", ["tui", "bag", "handbag", "backpack"]),
];

export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsNormalizedTerm(
  normalizedText: string,
  normalizedTerm: string,
): boolean {
  if (!normalizedText || !normalizedTerm) {
    return false;
  }

  return ` ${normalizedText} `.includes(` ${normalizedTerm} `);
}

export function detectStrictIntentGroups(
  latestMessage: string,
): StrictIntentGroup[] {
  const normalizedMessage = normalizeText(latestMessage);

  if (!normalizedMessage) {
    return [];
  }

  return STRICT_INTENT_GROUPS.filter((group) =>
    group.normalizedKeywords.some((keyword) =>
      containsNormalizedTerm(normalizedMessage, keyword),
    ),
  );
}

export function matchesStrictIntentGroup(
  searchText: string,
  groups: StrictIntentGroup[],
): boolean {
  if (groups.length === 0) {
    return true;
  }

  return groups.some((group) =>
    group.normalizedKeywords.some((keyword) =>
      containsNormalizedTerm(searchText, keyword),
    ),
  );
}

function parseMoneyToVnd(rawAmount: string, rawUnit?: string): number | null {
  const parsedAmount = Number(String(rawAmount).replace(",", "."));

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  const normalizedUnit = normalizeText(rawUnit ?? "");

  if (
    normalizedUnit === "m" ||
    normalizedUnit.includes("trieu") ||
    normalizedUnit.includes("million")
  ) {
    return Math.round(parsedAmount * 1_000_000);
  }

  if (
    normalizedUnit === "k" ||
    normalizedUnit.includes("nghin") ||
    normalizedUnit.includes("ngan")
  ) {
    return Math.round(parsedAmount * 1_000);
  }

  if (
    normalizedUnit.includes("vnd") ||
    normalizedUnit.includes("dong") ||
    normalizedUnit === "d"
  ) {
    return Math.round(parsedAmount);
  }

  if (parsedAmount >= 50_000) {
    return Math.round(parsedAmount);
  }

  return null;
}

export function extractBudgetConstraint(message: string): BudgetConstraint {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return {};
  }

  const rangeMatch = normalizedMessage.match(
    /(?:tu|from)\s*(\d+(?:[.,]\d+)?)\s*(trieu|million|m|k|nghin|ngan|vnd|dong|d)?\s*(?:den|to|-)\s*(\d+(?:[.,]\d+)?)\s*(trieu|million|m|k|nghin|ngan|vnd|dong|d)?/,
  );

  if (rangeMatch) {
    const minCandidate = parseMoneyToVnd(rangeMatch[1], rangeMatch[2]);
    const maxCandidate = parseMoneyToVnd(
      rangeMatch[3],
      rangeMatch[4] || rangeMatch[2],
    );

    if (
      minCandidate != null &&
      maxCandidate != null &&
      minCandidate <= maxCandidate
    ) {
      return {
        minPrice: minCandidate,
        maxPrice: maxCandidate,
      };
    }
  }

  const maxMatch = normalizedMessage.match(
    /(?:duoi|under|toi da|khong qua|max|<=)\s*(\d+(?:[.,]\d+)?)\s*(trieu|million|m|k|nghin|ngan|vnd|dong|d)?/,
  );
  const minMatch = normalizedMessage.match(
    /(?:tren|over|toi thieu|it nhat|from|min|>=)\s*(\d+(?:[.,]\d+)?)\s*(trieu|million|m|k|nghin|ngan|vnd|dong|d)?/,
  );

  const maxPrice = maxMatch
    ? parseMoneyToVnd(maxMatch[1], maxMatch[2])
    : undefined;
  const minPrice = minMatch
    ? parseMoneyToVnd(minMatch[1], minMatch[2])
    : undefined;

  if (minPrice != null && maxPrice != null && minPrice <= maxPrice) {
    return { minPrice, maxPrice };
  }

  if (minPrice != null) {
    return { minPrice };
  }

  if (maxPrice != null) {
    return { maxPrice };
  }

  return {};
}

export function hasBudgetConstraint(budgetConstraint: BudgetConstraint): boolean {
  return budgetConstraint.minPrice != null || budgetConstraint.maxPrice != null;
}

export function applyBudgetConstraintFilter(
  catalog: CompactProductCatalogItem[],
  budgetConstraint: BudgetConstraint,
): CompactProductCatalogItem[] {
  const { minPrice, maxPrice } = budgetConstraint;

  if (minPrice == null && maxPrice == null) {
    return catalog;
  }

  return catalog.filter(
    (item) =>
      (minPrice == null || item.finalPrice >= minPrice) &&
      (maxPrice == null || item.finalPrice <= maxPrice),
  );
}

function extractQueryTokens(latestMessage: string): string[] {
  const normalizedMessage = normalizeText(latestMessage);

  if (!normalizedMessage) {
    return [];
  }

  return Array.from(
    new Set(
      normalizedMessage
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length >= 2 && !QUERY_STOPWORDS.has(token)),
    ),
  );
}

function scoreProductByQuery(
  item: CompactProductCatalogItem,
  queryTokens: string[],
  budgetConstraint: BudgetConstraint,
): number {
  const primaryText = normalizeText(`${item.name} ${item.category}`);
  const secondaryText = normalizeText(
    `${item.brand} ${item.material} ${item.colors.join(" ")} ${item.sizes.join(" ")}`,
  );

  let score = 0;

  for (const token of queryTokens) {
    if (containsNormalizedTerm(primaryText, token)) {
      score += 14;
      continue;
    }

    if (containsNormalizedTerm(secondaryText, token)) {
      score += 7;
      continue;
    }

    if (containsNormalizedTerm(item.searchText, token)) {
      score += 3;
    }
  }

  if (budgetConstraint.maxPrice != null) {
    score += item.finalPrice <= budgetConstraint.maxPrice ? 8 : -15;
  }

  if (budgetConstraint.minPrice != null) {
    score += item.finalPrice >= budgetConstraint.minPrice ? 4 : -8;
  }

  return score;
}

export function preselectCatalogForPrompt(
  latestMessage: string,
  catalog: CompactProductCatalogItem[],
  budgetConstraint: BudgetConstraint,
): CompactProductCatalogItem[] {
  const queryTokens = extractQueryTokens(latestMessage);

  const scoredCatalog = catalog.map((item) => ({
    item,
    score: scoreProductByQuery(item, queryTokens, budgetConstraint),
  }));

  scoredCatalog.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.item.stock !== left.item.stock) {
      return right.item.stock - left.item.stock;
    }

    return left.item.finalPrice - right.item.finalPrice;
  });

  const positiveScoredItems = scoredCatalog.filter((entry) => entry.score > 0);

  return (
    positiveScoredItems.length > 0 ? positiveScoredItems : scoredCatalog
  ).map((entry) => entry.item);
}

export function buildPromptCatalog(
  catalog: CompactProductCatalogItem[],
): PromptCatalogItem[] {
  return catalog.map(({ searchText, ...rest }) => rest);
}

export function trimPromptCatalogBySize(
  catalog: PromptCatalogItem[],
  maxChars: number,
): PromptCatalogItem[] {
  if (maxChars <= 0 || catalog.length === 0) {
    return [];
  }

  let nextSize = catalog.length;

  while (nextSize >= 1) {
    const candidateCatalog = catalog.slice(0, nextSize);

    if (JSON.stringify(candidateCatalog).length <= maxChars) {
      return candidateCatalog;
    }

    if (nextSize === 1) {
      return [];
    }

    nextSize = Math.max(1, Math.floor(nextSize * 0.8));
  }

  return [];
}

export function isModelNotFoundError(error: any): boolean {
  const statusCode = error?.response?.status;
  const responseData = error?.response?.data;
  const message = String(
    responseData?.error?.message ||
      responseData?.error ||
      responseData?.message ||
      "",
  );

  return (
    (statusCode === 400 || statusCode === 404) &&
    /model\s+not\s+found|not\s+found\s+for\s+model|invalid\s+argument|does\s+not\s+exist|not\s+supported|invalid\s+model/i.test(
      message,
    )
  );
}

export function extractProductIds(rawText: string): string[] {
  const cleanText = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const normalizeToIds = (parsed: unknown): string[] => {
    if (Array.isArray(parsed)) {
      return parsed
        .map((item: any) => {
          if (typeof item === "string" || typeof item === "number") {
            return String(item).trim();
          }

          if (item && typeof item === "object") {
            const candidate =
              item._id ?? item.id ?? item.productId ?? item.product_id;
            return candidate ? String(candidate).trim() : "";
          }

          return "";
        })
        .filter(Boolean);
    }

    if (parsed && typeof parsed === "object") {
      const wrappedIds =
        (parsed as any).productIds ??
        (parsed as any).products ??
        (parsed as any).ids;

      if (Array.isArray(wrappedIds)) {
        return normalizeToIds(wrappedIds);
      }
    }

    return [];
  };

  const tryParse = (value: string): string[] => {
    const parsed = JSON.parse(value);
    return normalizeToIds(parsed);
  };

  try {
    return tryParse(cleanText);
  } catch {
    const startIndex = cleanText.indexOf("[");
    const endIndex = cleanText.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      return [];
    }

    try {
      return tryParse(cleanText.slice(startIndex, endIndex + 1));
    } catch {
      return [];
    }
  }
}

export function buildCompactProductCatalog(
  products: any[],
): CompactProductCatalogItem[] {
  return products
    .map((product) => {
      const categoryValue =
        typeof product?.category === "string"
          ? product.category
          : product?.category?.title || "";

      const price = Number(product?.price ?? 0);
      const discount = Number(product?.discount ?? 0);
      const finalPrice =
        discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

      const colors = Array.isArray(product?.colors)
        ? product.colors
            .map((value: unknown) => String(value ?? "").trim())
            .filter(Boolean)
        : [];
      const sizes = Array.isArray(product?.sizes)
        ? product.sizes
            .map((value: unknown) => String(value ?? "").trim())
            .filter(Boolean)
        : [];

      const searchText = normalizeText(
        [
          product?.name,
          categoryValue,
          product?.brand,
          product?.material,
          ...colors,
          ...sizes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return {
        id: String(product?._id ?? "").trim(),
        name: String(product?.name ?? "").trim(),
        category: String(categoryValue ?? "").trim(),
        brand: String(product?.brand ?? "").trim(),
        price,
        discount,
        finalPrice,
        colors,
        sizes,
        material: String(product?.material ?? "").trim(),
        stock: Number(product?.stock ?? 0),
        searchText,
      };
    })
    .filter((item) => item.id && item.name);
}

export function getContextForPrompt(conversationContext: string): string {
  return conversationContext.slice(-MAX_CONTEXT_CHARS);
}

export function buildRecommendationPrompt(params: {
  latestMessage: string;
  contextForPrompt: string;
  strictIntentGroups: StrictIntentGroup[];
  budgetConstraint: BudgetConstraint;
  promptCatalog: PromptCatalogItem[];
}): string {
  const {
    latestMessage,
    contextForPrompt,
    strictIntentGroups,
    budgetConstraint,
    promptCatalog,
  } = params;

  return `
Ban dang lam nhiem vu goi y san pham thoi trang voi muc tieu do chinh xac cao nhat.

Du lieu nguoi dung:
- Tin nhan moi nhat (uu tien cao nhat): ${JSON.stringify(latestMessage)}
- Ngu canh hoi thoai truoc do (chi de tham khao): ${JSON.stringify(contextForPrompt)}
- Nhom loai san pham bat buoc (neu co): ${JSON.stringify(
    strictIntentGroups.map((group) => group.key),
  )}
- Rang gia trich xuat tu tin nhan (neu co): ${JSON.stringify(budgetConstraint)}

Danh sach san pham hop le (CHI duoc chon id tu danh sach nay):
${JSON.stringify(promptCatalog, null, 2)}

Quy trinh bat buoc:
1) Trich xuat nhu cau chinh tu tin nhan moi nhat: loai san pham, muc dich su dung, gioi han ngan sach, mau sac, size, thuong hieu, chat lieu.
2) Neu context mau thuan voi tin nhan moi nhat, luon uu tien tin nhan moi nhat.
3) Loai bo san pham khong hop le:
   - khac loai ro rang voi nhu cau (vd user tim vay ma san pham la giay)
   - stock <= 0
   - neu Nhom loai san pham bat buoc khac rong, chi duoc chon san pham thuoc cac nhom do
   - neu Rang gia trich xuat khac rong, uu tien manh cac san pham nam trong khoang gia do
4) Cham diem tung san pham theo thang 100:
   - 60 diem: do khop loai san pham va tu khoa chinh (name, category)
   - 20 diem: do khop thuoc tinh phu (mau, size, chat lieu, brand)
   - 20 diem: do khop ngan sach (uu tien trong tam gia yeu cau; gan ngan sach hon thi diem cao hon)
5) Sap xep giam dan theo tong diem.
6) Chi tra ve toi da 6 id co diem >= 70. Neu khong co san pham dat nguong thi tra ve []

Rang buoc output:
- Chi duoc tra ve MANG JSON THUAN cac id, VD: ["id1","id2"]
- Khong markdown, khong giai thich, khong object, khong them text.
`;
}
