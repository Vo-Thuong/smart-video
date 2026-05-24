// Simple in-memory cache: word → { data, cachedAt }
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Try Free Dictionary API */
async function tryFreeDictionary(word) {
  try {
    const r = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { headers: BROWSER_HEADERS }
    );
    const data = await r.json();
    if (!Array.isArray(data)) return null;
    const entry = data[0];

    let phonetic = entry.phonetic ?? null;
    if (!phonetic && entry.phonetics?.length) {
      phonetic = entry.phonetics.find((p) => p.text)?.text ?? null;
    }

    const meanings = (entry.meanings ?? []).slice(0, 3).map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definition: m.definitions?.[0]?.definition ?? "",
      example: m.definitions?.[0]?.example ?? null,
    }));

    return { phonetic, meanings };
  } catch {
    return null;
  }
}

/** Wiktionary fallback for definitions */
async function tryWiktionary(word) {
  try {
    const r = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      { headers: BROWSER_HEADERS }
    );
    const data = await r.json();
    const enEntries = data?.en;
    if (!Array.isArray(enEntries) || !enEntries.length) return null;

    const meanings = enEntries.slice(0, 3).map((entry) => ({
      partOfSpeech: entry.partOfSpeech ?? "",
      definition: entry.definitions?.[0]?.definition
        ?.replace(/<[^>]*>/g, "") ?? "",
      example: null,
    }));

    return { phonetic: null, meanings };
  } catch {
    return null;
  }
}

async function lookupWord(req, res) {
  const word = (req.query.word || "").toLowerCase().trim().replace(/[^a-z'-]/g, "");
  if (!word) return res.status(400).json({ success: false, message: "Missing word" });

  // Serve from cache if fresh
  const cached = cache.get(word);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return res.json({ success: true, ...cached.data });
  }

  // Run Free Dictionary + Google Translate (with bilingual dictionary) in parallel
  const [dictResult, transResult] = await Promise.allSettled([
    tryFreeDictionary(word).then((r) => r ?? tryWiktionary(word)),
    fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`
    )
      .then((r) => r.json())
      .catch(() => null),
  ]);

  const dict = dictResult.status === "fulfilled" ? dictResult.value : null;
  const transRaw = transResult.status === "fulfilled" ? transResult.value : null;

  const phonetic = dict?.phonetic ?? null;

  // Simple translation from dt=t (data[0])
  let translation = null;
  if (transRaw?.[0]) {
    translation = transRaw[0].map((item) => (Array.isArray(item) ? item[0] : "")).join("");
  }

  // Bilingual dictionary meanings from dt=bd (data[1])
  // Structure: [[partOfSpeech, [viWord1, viWord2, ...], ...], ...]
  const dictMeanings = [];
  if (Array.isArray(transRaw?.[1])) {
    for (const entry of transRaw[1]) {
      const partOfSpeech = entry[0];
      const translations = Array.isArray(entry[1])
        ? entry[1]
            .slice(0, 4)
            .map((t) => (Array.isArray(t) ? t[0] : String(t)))
            .filter((t) => t && t.trim().length > 1)
        : [];
      if (partOfSpeech && translations.length) {
        dictMeanings.push({ partOfSpeech, translations });
      }
    }
  }

  const data = { word, phonetic, dictMeanings, translation };
  cache.set(word, { data, cachedAt: Date.now() });

  return res.json({ success: true, ...data });
}

module.exports = { lookupWord };
