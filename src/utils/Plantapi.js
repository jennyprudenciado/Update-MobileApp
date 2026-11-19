import { Platform } from "react-native";

// PlantSolve API endpoints (CC BY 4.0):
// - GET /api/v1/plants/index.json
// - GET /api/v1/plants/{slug}.json
// Web uses bundled sample data; native platforms request the live catalog.
// Response fields are checked because the API may return different shapes.
const BASE_URL = "https://www.plantsolve.com/api/v1/plants";
const REQUEST_TIMEOUT_MS = 10000;
const MAX_SEARCH_RESULTS = 8;

const FALLBACK_PLANT_CATALOG = [
  {
    slug: "monstera",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
    summary: "A tropical houseplant with split leaves and easygoing care.",
    care: {
      watering: "Water when the top 1-2 inches of soil feel dry.",
      sunlight: "Bright indirect light is ideal.",
      soil: "Use a well-draining indoor potting mix.",
      feeding: "Feed lightly during spring and summer.",
    },
  },
  {
    slug: "snake-plant",
    name: "Snake Plant",
    scientificName: "Dracaena trifasciata",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    summary: "A hardy, low-maintenance plant that tolerates missed waterings.",
    care: {
      watering: "Water every 2-3 weeks or when the soil is dry.",
      sunlight: "Low to bright indirect light works well.",
      soil: "Use a fast-draining mix.",
      feeding: "A light feeding once a month in active growth is enough.",
    },
  },
  {
    slug: "peace-lily",
    name: "Peace Lily",
    scientificName: "Spathiphyllum wallisii",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
    summary: "A popular foliage plant that rewards consistent moisture.",
    care: {
      watering: "Keep the soil lightly moist and water when the top inch dries.",
      sunlight: "Prefers filtered, indirect light.",
      soil: "Choose a rich, moisture-retaining mix.",
      feeding: "Feed monthly during the growing season.",
    },
  },
  {
    slug: "aloe-vera",
    name: "Aloe Vera",
    scientificName: "Aloe vera",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80",
    summary: "A succulent with soothing gel and strong drought tolerance.",
    care: {
      watering: "Allow the soil to dry completely between waterings.",
      sunlight: "Bright, direct or indirect sun works best.",
      soil: "Use a gritty, well-draining cactus mix.",
      feeding: "Feed lightly only during active growth.",
    },
  },
  {
    slug: "rose",
    name: "Rose",
    scientificName: "Rosa",
    difficulty: "medium",
    image:
      "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=900&q=80",
    summary: "Classic flowering shrub that needs frequent attention and pruning.",
    care: {
      watering: "Water deeply and consistently to keep the soil moist.",
      sunlight: "Full sun gives the best bloom quality.",
      soil: "Use nutrient-rich, well-drained soil.",
      feeding: "Provide a bloom fertilizer throughout the growing season.",
    },
  },
  {
    slug: "spider-plant",
    name: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80",
    summary: "An easy trailing plant that produces baby offshoots.",
    care: {
      watering: "Water when the top inch of soil dries out.",
      sunlight: " Bright indirect light helps it stay compact.",
      soil: "A light, well-draining mix is ideal.",
      feeding: "Feed once per month during active growth.",
    },
  },
  {
    slug: "jade-plant",
    name: "Jade Plant",
    scientificName: "Crassula ovata",
    difficulty: "easy",
    image:
      "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80",
    summary: "A succulent shrub with glossy leaves and a compact habit.",
    care: {
      watering: "Let the soil dry fully between waterings.",
      sunlight: "Bright, direct light keeps it bushy and strong.",
      soil: "Use a cactus or succulent mix.",
      feeding: "Feed lightly in spring and early summer.",
    },
  },
  {
    slug: "lavender",
    name: "Lavender",
    scientificName: "Lavandula angustifolia",
    difficulty: "medium",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    summary: "A fragrant herb with purple blooms and dry-soil preferences.",
    care: {
      watering: "Keep the soil on the dry side, especially in winter.",
      sunlight: "Full sun is best for flowering.",
      soil: "Use light, sandy, well-draining soil.",
      feeding: "Avoid heavy feeding; too much nitrogen reduces blooms.",
    },
  },
];

const FALLBACK_PLANT_MAP = new Map(
  FALLBACK_PLANT_CATALOG.map((plant) => [plant.slug.toLowerCase(), plant])
);

export const FALLBACK_TEXT = "Not available";

// Error codes let screens handle failures without parsing messages.
export class PlantApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PlantApiError";
    this.code = code;
  }
}

function abortError() {
  return Object.assign(new Error("Aborted"), { name: "AbortError" });
}

function parseJsonText(rawText) {
  const text = String(rawText ?? "").trim();

  if (!text) {
    throw new PlantApiError(
      "bad_response",
      "The plant service sent empty data."
    );
  }

  // The proxy may wrap its response in Markdown.
  const markdownPrefix = "Markdown Content:";
  const candidate = text.includes(markdownPrefix)
    ? text.slice(text.indexOf(markdownPrefix) + markdownPrefix.length).trim()
    : text;

  const withoutFence = candidate
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    throw new PlantApiError(
      "bad_response",
      "The plant service sent data that could not be read."
    );
  }
}

function toJinaProxyUrl(url) {
  const cleanUrl = String(url).replace(/^https?:\/\//i, "");
  return `https://r.jina.ai/http://https://${cleanUrl}`;
}

async function fetchJsonWithFallback(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (response.status === 404) {
    throw new PlantApiError("not_found", "That plant was not found.");
  }

  if (!response.ok) {
    throw new PlantApiError(
      "bad_response",
      `The plant service returned an error (${response.status}).`
    );
  }

  return parseJsonText(await response.text());
}

async function fetchJsonWithProxy(url, signal) {
  const proxyUrl = toJinaProxyUrl(url);
  const proxyResponse = await fetch(proxyUrl, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (proxyResponse.status === 404) {
    throw new PlantApiError("not_found", "That plant was not found.");
  }

  if (!proxyResponse.ok) {
    throw new PlantApiError(
      "bad_response",
      `The plant service returned an error (${proxyResponse.status}).`
    );
  }

  return parseJsonText(await proxyResponse.text());
}

async function getJson(url) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    try {
      return await fetchJsonWithFallback(url, controller.signal);
    } catch (directError) {
      if (directError?.name === "AbortError" && timedOut) {
        throw directError;
      }

      if (directError instanceof PlantApiError) {
        throw directError;
      }

      const proxyController = new AbortController();
      const proxyTimeoutId = setTimeout(() => {
        proxyController.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        console.warn(
          "PlantSolve direct request failed; retrying via Jina proxy:",
          url,
          directError?.message
        );
        return await fetchJsonWithProxy(url, proxyController.signal);
      } finally {
        clearTimeout(proxyTimeoutId);
      }
    }
  } catch (error) {
    if (error instanceof PlantApiError) {
      throw error;
    }

    if (error?.name === "AbortError" && timedOut) {
      throw new PlantApiError(
        "timeout",
        "The request took too long. Check your connection and retry."
      );
    }

    console.warn("PlantSolve request failed:", url, error?.message);

    throw new PlantApiError(
      "network",
      "Could not reach the plant service. Check your internet connection."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Stop one caller from waiting without cancelling the shared request.
function waitWithSignal(promise, signal) {
  if (!signal) {
    return promise;
  }

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => reject(abortError());

    signal.addEventListener("abort", onAbort);

    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", onAbort);
    });
  });
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Build a display name when the index provides only a slug.
function titleFromSlug(slug) {
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function labelFromKey(key) {
  const spaced = String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Support alternate field names in service responses.
function firstText(source, keys) {
  for (const key of keys) {
    const text = cleanText(source?.[key]);

    if (text) {
      return text;
    }
  }

  return "";
}

function firstImageUrl(source) {
  for (const key of ["image", "imageUrl", "thumbnail", "photo"]) {
    const value = source?.[key];
    const candidate = Array.isArray(value) ? value[0] : value;
    const url = typeof candidate === "string" ? candidate : candidate?.url;

    if (typeof url === "string" && /^https?:\/\//i.test(url.trim())) {
      return url.trim();
    }
  }

  return null;
}

// Web uses bundled data; native platforms fetch and cache the catalog index.
// Clear failed requests so a later attempt can retry.
let plantIndexPromise = null;

export function fetchAllPlants(signal) {
  if (Platform.OS === "web") {
    const list = FALLBACK_PLANT_CATALOG.map((item) => ({
      slug: item.slug,
      scientificName: cleanText(item.scientificName),
      difficulty: cleanText(item.difficulty),
      raw: item,
    }));

    return waitWithSignal(Promise.resolve(list), signal);
  }

  if (!plantIndexPromise) {
    plantIndexPromise = getJson(`${BASE_URL}/index.json`).then((data) => {
      // The service may return the list directly or under "plants".
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.plants)
          ? data.plants
          : null;

      if (!list) {
        throw new PlantApiError(
          "bad_response",
          "The plant service sent data in an unexpected format."
        );
      }

      return list
        .filter((item) => item && typeof item.slug === "string" && item.slug)
        .map((item) => ({
          slug: item.slug,
          scientificName: cleanText(item.scientificName),
          difficulty: cleanText(item.difficulty),
          raw: item,
        }));
    });

    plantIndexPromise.catch(() => {
      plantIndexPromise = null;
    });
  }

  return waitWithSignal(plantIndexPromise, signal);
}

const DIFFICULTY_ALIASES = {
  easy: ["easy", "beginner"],
  medium: ["medium", "intermediate", "moderate"],
  hard: ["hard", "advanced", "difficult", "expert"],
};

export function filterPlantsByDifficulty(plants, level = "easy") {
  const wanted = String(level).toLowerCase();
  const accepted = DIFFICULTY_ALIASES[wanted] || [wanted];

  return plants.filter((plant) =>
    accepted.includes(String(plant.difficulty ?? "").toLowerCase())
  );
}

export async function fetchEasyPlants(signal) {
  const plants = await fetchAllPlants(signal);

  return filterPlantsByDifficulty(plants, "easy");
}

export function mapApiPlant(indexEntry, detail = null) {
  const slug = indexEntry?.slug || detail?.slug || "";
  const record =
    detail?.plant && typeof detail.plant === "object" ? detail.plant : detail;
  const care =
    record?.care && typeof record.care === "object" ? record.care : {};

  const watering = firstText(care, ["water", "watering"]);
  const sunlight = firstText(care, ["light", "sunlight"]);
  const soil = firstText(care, ["soil"]);
  const careDifficulty = firstText(care, ["difficulty"]);

  const usedKeys = new Set(["water", "watering", "light", "sunlight", "soil"]);

  const careNotes = Object.keys(care)
    .filter((key) => !usedKeys.has(key) && key !== "difficulty")
    .filter((key) => cleanText(care[key]) !== "")
    .slice(0, 6)
    .map((key) => ({ label: labelFromKey(key), value: cleanText(care[key]) }));

  return {
    id: slug,
    slug,
    commonName: firstText(record, ["name"]) || titleFromSlug(slug),
    scientificName:
      firstText(record, ["scientificName"]) ||
      cleanText(indexEntry?.scientificName),
    image: firstImageUrl(record),
    difficulty: careDifficulty || cleanText(indexEntry?.difficulty),
    description: firstText(record, ["summary", "description", "overview"]),
    watering,
    sunlight,
    soil,
    careNotes,
    detailsLoaded: Boolean(record && typeof record === "object"),
    raw: detail,
  };
}

// Store only the catalog fields needed by the app.
export function toStoredApiInfo(info) {
  return {
    source: "PlantSolve",
    slug: info.slug,
    difficulty: info.difficulty,
    description: info.description,
    watering: info.watering,
    sunlight: info.sunlight,
    soil: info.soil,
    careNotes: info.careNotes,
  };
}

// Reuse detail requests for the same plant slug.
const detailCache = new Map();

export function fetchPlantDetails(slug, signal) {
  const key = typeof slug === "string" ? slug.trim() : "";

  if (!key) {
    return Promise.reject(
      new PlantApiError("empty", "No plant was selected.")
    );
  }

  if (Platform.OS === "web") {
    const fallback = FALLBACK_PLANT_MAP.get(key.toLowerCase());

    if (!fallback) {
      return Promise.reject(
        new PlantApiError("not_found", "That plant was not found.")
      );
    }

    return waitWithSignal(Promise.resolve({ plant: fallback }), signal);
  }

  if (!detailCache.has(key)) {
    const request = getJson(`${BASE_URL}/${encodeURIComponent(key)}.json`).then(
      (data) => {
        const record =
          data?.plant && typeof data.plant === "object" ? data.plant : data;

        if (!record || typeof record !== "object" || Array.isArray(record)) {
          throw new PlantApiError(
            "bad_response",
            "The plant service sent data in an unexpected format."
          );
        }

        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log(
            "PlantSolve detail keys:",
            Object.keys(record),
            "care keys:",
            Object.keys(record.care || {})
          );
        }

        return data;
      }
    );

    detailCache.set(key, request);

    request.catch(() => detailCache.delete(key));
  }

  return waitWithSignal(detailCache.get(key), signal);
}

export async function fetchPlantInfo(indexEntry, signal) {
  const detail = await fetchPlantDetails(indexEntry?.slug, signal);

  return mapApiPlant(indexEntry, detail);
}

// Load beginner plants in batches; keep index data if a detail request fails.
export async function fetchEasyPlantsWithDetails({
  limit = 6,
  concurrency = 3,
  signal,
} = {}) {
  const easy = await fetchEasyPlants(signal);

  if (easy.length === 0) {
    throw new PlantApiError(
      "not_found",
      "No beginner-friendly plants were found."
    );
  }

  const selected = easy
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, limit);

  const plants = [];

  for (let start = 0; start < selected.length; start += concurrency) {
    const batch = selected.slice(start, start + concurrency);

    const settled = await Promise.allSettled(
      batch.map((entry) => fetchPlantDetails(entry.slug, signal))
    );

    if (signal?.aborted) {
      throw abortError();
    }

    settled.forEach((result, position) => {
      plants.push(
        mapApiPlant(
          batch[position],
          result.status === "fulfilled" ? result.value : null
        )
      );
    });
  }

  return { total: easy.length, plants };
}

// PlantSolve has no search endpoint, so match each query word locally.
export async function searchPlants(searchText, signal) {
  const text = String(searchText ?? "").trim();

  if (!text) {
    throw new PlantApiError("empty", "Enter a plant name first.");
  }

  const query = text.toLowerCase();
  const words = query.split(/\s+/);
  const all = await fetchAllPlants(signal);

  const matches = all
    .map((entry) => mapApiPlant(entry, null))
    .filter((plant) => {
      const haystack =
        `${plant.commonName} ${plant.scientificName}`.toLowerCase();

      return words.every((word) => haystack.includes(word));
    })
    .sort((a, b) => {
      const aStarts = a.commonName.toLowerCase().startsWith(query) ? 0 : 1;
      const bStarts = b.commonName.toLowerCase().startsWith(query) ? 0 : 1;

      return aStarts - bStarts || a.commonName.localeCompare(b.commonName);
    })
    .slice(0, MAX_SEARCH_RESULTS);

  if (matches.length === 0) {
    throw new PlantApiError(
      "not_found",
      `No plants found for "${text}". Try another name, such as "monstera" or "aloe".`
    );
  }

  return matches;
}