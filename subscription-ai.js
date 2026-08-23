import { CreateMLCEngine, prebuiltAppConfig } from "https://esm.run/@mlc-ai/web-llm";

// The 3B local instruct model is materially stronger than the previous 1B
// default. It remains fully browser-local but needs a capable WebGPU device.
export const MODEL_ID = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
export const FALLBACK_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
export const SEARCH_QUERY = "in:anywhere";

let engine = null;
let activeModelId = null;
let fallbackUsed = false;

const MODEL_RESPONSE_KEYS = Object.freeze([
    "is_target_email",
    "service_name",
    "category",
    "action_required",
    "action_url",
    "unsubscribe_url",
]);

const TRIAGE_CATEGORIES = Object.freeze([
    "Sign-Up",
    "Newsletter",
    "Promotional",
    "System",
    "Spam",
    "Junk",
    "Personal",
    "Work",
    "Social",
    "Travel",
    "Financial",
    "Health",
    "Education",
    "Other",
]);

const CATEGORY_SET = new Set(TRIAGE_CATEGORIES);
const RELATIONSHIP_CATEGORIES = new Set([
    "Sign-Up",
    "Newsletter",
    "Promotional",
    "System",
]);
const PRIORITIES = new Set(["High", "Normal", "Low"]);

const FREE_MAIL_DOMAINS = new Set([
    "gmail.com", "googlemail.com", "outlook.com", "hotmail.com",
    "live.com", "yahoo.com", "icloud.com", "me.com", "aol.com",
    "proton.me", "protonmail.com", "fastmail.com", "gmx.com",
    "mail.com", "yandex.com", "zoho.com",
]);

const GENERIC_LOCAL_PARTS = new Set([
    "admin", "alerts", "billing", "contact", "help", "hello", "info",
    "mail", "news", "no-reply", "noreply", "notifications", "office",
    "reply", "security", "support", "team", "updates", "welcome",
]);

const URL_SHORTENERS = new Set([
    "bit.ly", "buff.ly", "cutt.ly", "goo.gl", "is.gd", "lnkd.in",
    "ow.ly", "rb.gy", "rebrand.ly", "shorturl.at", "t.co", "tinyurl.com",
]);

const HIGH_RISK_FILE_EXTENSIONS = new Set([
    "ade", "adp", "apk", "app", "bat", "cmd", "com", "cpl", "dll",
    "exe", "hta", "img", "inf", "iso", "jar", "js", "jse", "lnk",
    "msc", "msi", "msp", "pif", "ps1", "reg", "scr", "sct", "vbe",
    "vbs", "wsf", "wsh",
]);

const STOP_WORDS = new Set([
    "about", "after", "again", "against", "also", "and", "are", "been",
    "before", "being", "between", "but", "can", "could", "does", "for",
    "from", "have", "here", "into", "just", "more", "most", "much",
    "not", "now", "our", "out", "please", "that", "the", "their", "then",
    "there", "these", "they", "this", "those", "through", "under", "very",
    "was", "were", "what", "when", "where", "which", "with", "would",
    "your", "you", "redacted", "email", "password", "code", "financial",
    "identifier", "credential",
]);

const CATEGORY_RULES = Object.freeze({
    "Sign-Up": {
        weight: 1.0,
        patterns: [
            /\b(?:verify|confirm)\b[^\n.]{0,70}\b(?:email|e-?mail|account|registration|signup|sign-up)\b/i,
            /\b(?:activate|finish|complete|set up)\b[^\n.]{0,55}\b(?:account|profile|registration|signup|sign-up)\b/i,
            /\b(?:welcome\s+(?:aboard|to)|thanks?\s+for\s+(?:signing|sign)\s+up|account\s+(?:created|approved)|registration\s+(?:complete|confirmed)|email\s+verification)\b/i,
            /\b(?:confirma(?:r)?\s+tu\s+(?:cuenta|correo)|gracias\s+por\s+registrarte|activa\s+tu\s+cuenta|bienvenue\s+chez|confirmez\s+votre\s+compte|activer\s+votre\s+compte|willkommen\s+(?:bei|zu)|bestätig(?:e|en)\s+(?:dein|ihr)\s+konto)\b/i,
        ],
        strong: 2.5,
    },
    "Newsletter": {
        weight: 0.9,
        patterns: [
            /\b(?:newsletter|news\s*letter|digest|roundup|weekly|monthly|daily\s+(?:brief|update|edition)|mailing\s+list|subscriber(?:\s+update)?|issue\s+\d+|read\s+online|view\s+in\s+browser)\b/i,
            /\b(?:new\s+(?:post|article|issue)|editor(?:'s|ial)\s+(?:note|letter)|supporter\s+update|community\s+roundup|table\s+of\s+contents)\b/i,
            /\b(?:bolet[ií]n|resumen\s+semanal|lettre\s+d'information|bulletin|r[ée]capitulatif|newsletter)\b/i,
        ],
        strong: 2.1,
    },
    "Promotional": {
        weight: 0.85,
        patterns: [
            /\b(?:sale|deal|discount|coupon|promo(?:tion)?|save\s+\d+%|free\s+shipping|shop\s+now|special\s+offer|exclusive\s+offer|limited[- ]time|early[- ]bird|flash\s+sale)\b/i,
            /\b(?:new\s+collection|(?:introducing|discover)\b[^\n.]{0,45}\bcollection|(?:spring|summer|autumn|fall|winter)\s+collection|we\s+miss\s+you|members?-only|price\s+(?:drops?|changes?)|last\s+chance|ends?\s+(?:today|tonight|soon))\b/i,
            /\b(?:oferta|descuento|env[ií]o\s+gratis|soldes|promotion|livraison\s+gratuite|rabatt|angebot)\b/i,
        ],
        strong: 1.8,
    },
    "System": {
        weight: 1.0,
        patterns: [
            /\b(?:receipt|invoice|billing|renewal|subscription|membership|trial|order\s+(?:confirmed|shipped|delivered|updated)|payment\s+(?:received|failed|due)|refund|cancellation)\b/i,
            /\b(?:account\s+update|service\s+update|scheduled\s+maintenance|status\s+incident|security\s+(?:alert|notice)|password\s+reset|new\s+sign[- ]in|login\s+(?:attempt|alert)|verify\s+identity)\b/i,
            /\b(?:facture|reçu|paiement|commande|renouvellement|recibo|factura|pedido|mantenimiento|rechnung|zahlung|bestellung)\b/i,
        ],
        strong: 2.0,
    },
    "Financial": {
        weight: 1.05,
        patterns: [
            /\b(?:bank|credit\s+union|debit[ -]?card|credit[ -]?card|transaction\s+alert|recent\s+activity|payment\s+posted|wire\s+transfer|direct\s+deposit|investment|brokerage|insurance|payroll|tax\s+(?:notice|statement|document))\b/i,
            /\b(?:saldo|transferencia|tarjeta|banco|compte\s+bancaire|virement|carte\s+bancaire|konto|überweisung|kreditkarte)\b/i,
        ],
        strong: 2.2,
    },
    "Health": {
        weight: 0.95,
        patterns: [
            /\b(?:clinic|patient\s+portal|appointment(?:\s+reminder)?|pharmacy|prescription|medical|health\s+(?:plan|benefit)|doctor|provider|lab\s+result|telehealth)\b/i,
            /\b(?:cita|cl[ií]nica|receta|farmacia|rendez-vous|ordonnance|pharmacie|arzt|termin|rezept)\b/i,
        ],
        strong: 1.9,
    },
    "Travel": {
        weight: 0.95,
        patterns: [
            /\b(?:flight|itinerary|reservation|boarding\s+pass|check[- ]in|hotel|rail|train|rental\s+car|departure|arrival|gate\s+change|baggage|travel\s+alert)\b/i,
            /\b(?:vuelo|itinerario|reserva|embarque|hotel|tren|vol|itinéraire|réservation|embarquement|flug|reiseplan)\b/i,
        ],
        strong: 2.0,
    },
    "Education": {
        weight: 0.85,
        patterns: [
            /\b(?:course|academy|school|university|instructor|assignment|student|classroom|learning\s+platform|tuition|grade(?:d|book)?|syllabus)\b/i,
            /\b(?:curso|universidad|tarea|profesor|escuela|cours|universit[ée]|devoir|enseignant|schule|universität|aufgabe)\b/i,
        ],
        strong: 1.7,
    },
    "Social": {
        weight: 0.8,
        patterns: [
            /\b(?:replied\s+to\s+your|commented\s+on\s+your|liked\s+your|community|group|member\s+responded|connection\s+request|event\s+invitation|new\s+follower|mentioned\s+you)\b/i,
            /\b(?:respondi[oó]\s+a\s+tu|coment[oó]\s+tu|invitation\s+[àa]\s+un\s+[ée]v[ée]nement|vous\s+a\s+mentionn[ée])\b/i,
        ],
        strong: 1.5,
    },
    "Work": {
        weight: 0.85,
        patterns: [
            /\b(?:project|meeting|milestone|colleague|recruit(?:er|ing)|position|role|interview|client|proposal|team|agenda|standup|sprint|deliverable)\b/i,
            /\b(?:reuni[oó]n|proyecto|entrevista|cliente|proposition|r[ée]union|entretien|projet|auftrag|besprechung|bewerbung)\b/i,
        ],
        strong: 1.6,
    },
    "Junk": {
        weight: 0.85,
        patterns: [
            /\b(?:page\s+one|search\s+results|seo|free\s+audit|business\s+(?:profile|directory|listing)|website\s+traffic|press\s+release|reply\s+yes|complimentary\s+(?:listing|profile))\b/i,
            /\b(?:guest\s+post|backlinks?|lead\s+generation|increase\s+your\s+rankings?|cold\s+outreach|media\s+opportunity)\b/i,
        ],
        strong: 1.7,
    },
});

const SPAM_RULES = Object.freeze([
    { id: "credential-request", weight: 4.0, pattern: /\b(?:confirm|verify|update|enter|provide|validate)\b[^.\n]{0,100}\b(?:password|passcode|credential|card\s+number|bank\s+details|social\s+security|one[- ]time\s+code)\b/i },
    { id: "prize-fee", weight: 3.8, pattern: /\b(?:cash\s+prize|guaranteed\s+reward|processing\s+fee|selected\s+for\s+a\s+prize|winner|claim\s+your\s+prize)\b/i },
    { id: "investment-guarantee", weight: 3.8, pattern: /\b(?:guaranteed\s+\d+%|cannot\s+lose|risk[- ]free\s+(?:profit|return)|private\s+trading|financially\s+free|double\s+your\s+money|deposit\s+now)\b/i },
    { id: "government-threat", weight: 3.5, pattern: /\b(?:gift\s+card|law\s+enforcement|arrest|legal\s+action|enforcement\s+begins|warrant|tax\s+evasion)\b/i },
    { id: "malware-lure", weight: 4.2, pattern: /\b(?:enable\s+macros|enable\s+content|download\s+(?:the\s+)?(?:file|attachment)|install\s+(?:this\s+)?(?:app|update)|open\s+the\s+attached\s+(?:document|invoice))\b/i },
    { id: "romance-scam", weight: 2.8, pattern: /\b(?:dear\s+(?:beloved|friend)|need\s+your\s+help\s+moving\s+money|inheritance\s+fund|military\s+(?:officer|deployment))\b/i },
    { id: "account-closure-pressure", weight: 1.5, pattern: /\b(?:account\s+(?:will\s+be|has\s+been)\s+(?:suspended|closed)|avoid\s+(?:suspension|closure)|final\s+(?:notice|warning)|act\s+now|within\s+24\s+hours)\b/i },
    { id: "suspicious-unsubscribe", weight: 1.0, pattern: /\b(?:unsubscribe|opt[- ]out)\b[^\n]{0,65}\b(?:confirm\s+password|verify\s+identity|fee)\b/i },
]);

const ACTION_RULES = Object.freeze([
    { pattern: /\b(?:verify|confirm|activate|complete|finish|set\s+up|confirma(?:r)?|activa(?:r)?|confirmez|activer|bestätig(?:e|en))\b/i, action: "Complete the account verification or setup step" },
    { pattern: /\b(?:password|sign[- ]in|login|security\s+alert|unrecognized\s+activity)\b/i, action: "Review the account security notice" },
    { pattern: /\b(?:transaction|card\s+purchase|payment\s+posted|recent\s+activity)\b/i, action: "Review the financial activity notice" },
    { pattern: /\b(?:check[- ]in|itinerary|departure|gate\s+change)\b/i, action: "Review itinerary or check-in details" },
    { pattern: /\b(?:appointment|reschedule|patient\s+portal)\b/i, action: "Review or confirm the appointment details" },
    { pattern: /\b(?:invoice\s+(?:due|overdue)|payment\s+failed|renewal\s+required)\b/i, action: "Review the billing or renewal notice" },
]);

export function supportsWebGPU() {
    return Boolean(globalThis.navigator?.gpu);
}

function registeredModelIds() {
    const modelList = prebuiltAppConfig?.model_list;
    return Array.isArray(modelList)
        ? new Set(modelList.map((model) => model?.model_id).filter(Boolean))
        : new Set();
}

export function selectModelCandidates() {
    const registry = registeredModelIds();
    const preferred = [MODEL_ID, FALLBACK_MODEL_ID];
    // When a registry is exposed by the installed WebLLM build, request only
    // advertised model IDs. A registry-free build still uses engine creation
    // as the authoritative availability check with the same fallback order.
    return registry.size
        ? preferred.filter((modelId) => registry.has(modelId))
        : preferred;
}

export function getModelStatus() {
    return Object.freeze({
        preferred_model_id: MODEL_ID,
        fallback_model_id: FALLBACK_MODEL_ID,
        active_model_id: activeModelId,
        fallback_used: fallbackUsed,
        webgpu_supported: supportsWebGPU(),
        inference_available: Boolean(engine),
    });
}

export async function loadModelIfNeeded(onProgress) {
    if (engine) return engine;
    if (!supportsWebGPU()) {
        const error = new Error("WebGPU is unavailable in this browser. Local model inference will be skipped.");
        error.code = "WEBGPU_UNAVAILABLE";
        throw error;
    }

    const candidates = selectModelCandidates();
    if (!candidates.length) {
        const error = new Error("No supported local WebLLM model is available in this browser build.");
        error.code = "MODEL_UNAVAILABLE";
        throw error;
    }

    let lastError = null;
    for (const [index, modelId] of candidates.entries()) {
        const isFallback = modelId !== MODEL_ID;
        const initOptions = {
            initProgressCallback: (progress) => {
                const percent = Math.round(Math.max(0, Math.min(1, Number(progress?.progress) || 0)) * 100);
                if (onProgress) onProgress(percent, { modelId, fallbackUsed: isFallback });
            },
        };
        try {
            engine = await CreateMLCEngine(modelId, initOptions);
            activeModelId = modelId;
            fallbackUsed = isFallback;
            return engine;
        } catch (error) {
            lastError = error;
            if (index === candidates.length - 1) break;
        }
    }

    const error = new Error("A compatible local WebGPU model could not be initialized. Safe deterministic triage remains available.");
    error.code = "MODEL_INITIALIZATION_FAILED";
    error.cause = lastError?.name || "unknown";
    throw error;
}

export function getHeader(headers, name) {
    const match = headers.find(
        (header) => header.name.toLowerCase() === name.toLowerCase()
    );
    return match ? match.value : "";
}

export async function fetchAllMessageIds(accessToken, query = SEARCH_QUERY) {
    const ids = [];
    let pageToken = null;

    do {
        const url = new URL(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        );
        url.searchParams.set("q", query);
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 401) throw new Error("UNAUTHORIZED");
        if (!response.ok) {
            throw new Error(`Gmail search failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data.messages) ids.push(...data.messages.map((message) => message.id));
        pageToken = data.nextPageToken || null;
    } while (pageToken);

    return ids;
}

/* =========================================================
   PRIVACY BOUNDARY
   Sanitization happens before rule analysis, model prompting, URL extraction,
   callbacks, logs, or result construction.
========================================================= */
function redactSensitiveText(value = "") {
    let text = String(value);
    const replacements = [
        [/\b(?:password|passcode|pwd)\s*(?:is|:|=)\s*[^\s,;]{4,}\b/gi, "[REDACTED_PASSWORD]"],
        [/\b(?:one[-\s]?time\s*(?:password|passcode)|otp|verification\s*code|security\s*code|pin)\s*(?:is|:|=)\s*\d{4,10}\b/gi, "[REDACTED_CODE]"],
        [/\b\d{4,10}\s+(?:is|for)\s+(?:your\s+)?(?:code|otp|passcode|pin)\b/gi, "[REDACTED_CODE]"],
        [/\b(?:ssn|social\s+security(?:\s+number)?|national\s+id|personal\s+identification\s+number|tax\s+id)\s*(?:is|:|=)\s*[A-Z0-9-]{5,}\b/gi, "[REDACTED_IDENTIFIER]"],
        [/\b(?:card(?:\s+number)?|credit\s+card|debit\s+card|cvv|cvc|iban|routing\s+number|account\s+number)\s*(?:is|:|=)\s*[A-Z0-9\s-]{3,}\b/gi, "[REDACTED_FINANCIAL]"],
        [/\b(?:bearer\s+|api[_-]?key\s*(?:is|:|=)?\s*|access[_-]?token\s*(?:is|:|=)?\s*)[A-Za-z0-9._~+/=-]{12,}\b/gi, "[REDACTED_CREDENTIAL]"],
        [/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_IDENTIFIER]"],
        [/\b(?:\d[ -]?){13,19}\b/g, "[REDACTED_FINANCIAL]"],
        [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]"],
    ];

    for (const [pattern, replacement] of replacements) {
        text = text.replace(pattern, replacement);
    }

    // Query strings and fragments frequently contain private action tokens.
    text = text.replace(
        /((?:https?:\/\/)[^\s?#]+)(?:\?[^\s#]*)?(?:#[^\s]*)?/gi,
        "$1"
    );
    return text.replace(/\s+/g, " ").trim();
}

function getSenderAddress(from = "") {
    return String(from).match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i)?.[0] || "";
}

function getSenderDomain(from = "") {
    return getSenderAddress(from).split("@")[1]?.toLowerCase() || "";
}

function getHeaderDomain(value = "") {
    return String(value).match(/@([A-Z0-9.-]+\.[A-Z]{2,})/i)?.[1]?.toLowerCase() || "";
}

function rootDomain(domain = "") {
    const parts = String(domain).toLowerCase().split(".").filter(Boolean);
    return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
}

function senderDisplayName(from = "") {
    return String(from)
        .replace(/<[^>]*>/g, "")
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
        .replace(/["']/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function senderLabel(from = "") {
    const domain = getSenderDomain(from);
    const displayName = senderDisplayName(from);
    return redactSensitiveText(
        displayName
            ? `${displayName} <sender-domain:${domain || "unknown"}>`
            : `<sender-domain:${domain || "unknown"}>`
    );
}

function sanitizeInput({
    from,
    subject,
    snippet,
    listUnsubscribe = "",
    precedence = "",
    autoSubmitted = "",
    replyTo = "",
    returnPath = "",
    authenticationResults = "",
}) {
    return {
        from: senderLabel(from),
        subject: redactSensitiveText(subject).slice(0, 400),
        snippet: redactSensitiveText(snippet).slice(0, 1800),
        listUnsubscribe: redactSensitiveText(listUnsubscribe).slice(0, 900),
        precedence: redactSensitiveText(precedence).slice(0, 80),
        autoSubmitted: redactSensitiveText(autoSubmitted).slice(0, 80),
        // Keep only root-domain comparisons for header anomaly checks; raw
        // Reply-To and Return-Path addresses are not retained after this point.
        replyToDomain: rootDomain(getHeaderDomain(replyTo)),
        returnPathDomain: rootDomain(getHeaderDomain(returnPath)),
        authenticationResults: redactSensitiveText(authenticationResults).slice(0, 500),
    };
}

/* =========================================================
   SAFE URL ANALYSIS
========================================================= */
function normalizeSafeUrl(candidate) {
    if (!candidate) return null;
    const cleaned = String(candidate)
        .trim()
        .replace(/^[<(\["']+|[>)\],.;"']+$/g, "");

    try {
        const url = new URL(cleaned);
        if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
            return null;
        }
        const safeSegments = url.pathname.split("/").filter(Boolean).map((segment) => {
            const decoded = decodeURIComponent(segment);
            const highEntropy = decoded.length >= 24 && /[A-Za-z]/.test(decoded) && /\d/.test(decoded);
            const longNumber = /^\d{6,}$/.test(decoded);
            return highEntropy || longNumber
                ? "[redacted]"
                : encodeURIComponent(decoded).replace(/%2F/gi, "");
        });
        const safePath = safeSegments.length ? `/${safeSegments.join("/")}` : "";
        return `${url.protocol}//${url.host}${safePath}`;
    } catch {
        return null;
    }
}

function extractSafeUrls(...sources) {
    const raw = sources.filter(Boolean)
        .flatMap((value) => String(value).match(/https?:\/\/[^\s<>"']+/gi) || []);
    return [...new Set(raw.map(normalizeSafeUrl).filter(Boolean))];
}

function analyzeUrls(urls) {
    const findings = [];
    for (const value of urls) {
        try {
            const url = new URL(value);
            const host = url.hostname.toLowerCase();
            if (URL_SHORTENERS.has(host)) findings.push("shortened-link");
            if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) findings.push("ip-address-link");
            if (host.includes("xn--")) findings.push("punycode-link");
            if ((host.match(/-/g) || []).length >= 3) findings.push("excessive-hyphens");
            const extension = url.pathname.split(".").pop()?.toLowerCase();
            if (HIGH_RISK_FILE_EXTENSIONS.has(extension)) findings.push("executable-link");
        } catch {
            // normalizeSafeUrl prevents malformed values from reaching here.
        }
    }
    return [...new Set(findings)];
}

function firstMatchingUrl(urls, pattern) {
    return urls.find((url) => pattern.test(url)) || null;
}

/* =========================================================
   EXPLAINABLE SIGNAL ANALYSIS
========================================================= */
function countRuleMatches(text, patterns) {
    return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function detectHeaderSignals(metadata, originalFrom) {
    const senderDomain = getSenderDomain(originalFrom);
    const replyDomain = metadata.replyToDomain || "";
    const returnDomain = metadata.returnPathDomain || "";
    const auth = metadata.authenticationResults.toLowerCase();
    const localPart = getSenderAddress(originalFrom).split("@")[0]?.toLowerCase() || "";

    return {
        senderDomain,
        senderRoot: rootDomain(senderDomain),
        freeMail: FREE_MAIL_DOMAINS.has(senderDomain),
        genericLocalPart: GENERIC_LOCAL_PARTS.has(localPart),
        replyToMismatch: Boolean(replyDomain && senderDomain && rootDomain(replyDomain) !== rootDomain(senderDomain)),
        returnPathMismatch: Boolean(returnDomain && senderDomain && rootDomain(returnDomain) !== rootDomain(senderDomain)),
        authFailure: /\b(?:spf|dkim|dmarc)=(?:fail|softfail|neutral|temperror|permerror)\b/i.test(auth),
        bulkHeader: /(?:bulk|list)/i.test(metadata.precedence) || /auto-(?:generated|replied)/i.test(metadata.autoSubmitted),
        hasListUnsubscribe: Boolean(metadata.listUnsubscribe),
    };
}

function analyzeMessage(metadata, originalFrom) {
    const text = [
        metadata.subject,
        metadata.snippet,
        metadata.listUnsubscribe,
        metadata.precedence,
        metadata.autoSubmitted,
    ].join("\n");
    const headers = detectHeaderSignals(metadata, originalFrom);
    const urls = extractSafeUrls(metadata.snippet, metadata.listUnsubscribe);
    const urlFindings = analyzeUrls(urls);
    const categoryScores = {};
    const categorySignals = {};

    for (const [category, definition] of Object.entries(CATEGORY_RULES)) {
        const matches = countRuleMatches(text, definition.patterns);
        categoryScores[category] = matches * definition.weight;
        categorySignals[category] = matches;
    }

    if (headers.hasListUnsubscribe) categoryScores.Newsletter += 2.2;
    if (headers.bulkHeader) categoryScores.Newsletter += 1.3;
    if (headers.freeMail && !headers.bulkHeader) categoryScores.Personal = 1.0;

    let spamScore = 0;
    const spamReasons = [];
    for (const rule of SPAM_RULES) {
        if (rule.pattern.test(text)) {
            spamScore += rule.weight;
            spamReasons.push(rule.id);
        }
    }
    if (headers.replyToMismatch) {
        spamScore += 1.8;
        spamReasons.push("reply-to-domain-mismatch");
    }
    if (headers.returnPathMismatch) {
        spamScore += 1.1;
        spamReasons.push("return-path-domain-mismatch");
    }
    if (headers.authFailure) {
        spamScore += 1.6;
        spamReasons.push("authentication-failure");
    }
    for (const finding of urlFindings) {
        const weight = finding === "executable-link" ? 3.0 :
            finding === "ip-address-link" || finding === "punycode-link" ? 1.8 : 0.8;
        spamScore += weight;
        spamReasons.push(finding);
    }

    // Marketing mail from an unrecognized sender is not automatically spam.
    // It remains Promotional/Newsletter unless high-risk signals accumulate.
    categoryScores.Spam = spamScore;

    return {
        text,
        headers,
        urls,
        urlFindings,
        categoryScores,
        categorySignals,
        spamScore,
        spamReasons,
    };
}

function fallbackServiceName(from = "", category = "Other") {
    const displayName = senderDisplayName(from);
    if (displayName && !/@/.test(displayName)) {
        return redactSensitiveText(displayName).slice(0, 80);
    }

    const domain = getSenderDomain(from);
    if (domain && !FREE_MAIL_DOMAINS.has(domain)) {
        return domain.split(".")[0]
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
            .slice(0, 80);
    }
    return category === "Personal" ? "Personal contact" : "Unknown sender";
}

function cleanServiceName(value, fallback) {
    const cleaned = redactSensitiveText(value || "")
        .replace(/^SERVICE\s*:\s*/i, "")
        .replace(/["'`]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
    return cleaned && !cleaned.includes("[REDACTED") ? cleaned : fallback;
}

function cleanAction(value) {
    const cleaned = redactSensitiveText(value || "")
        .replace(/^(?:ACTION(?:_REQUIRED)?|ACTION REQUIRED)\s*:\s*/i, "")
        .replace(/["'`]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    return !cleaned || cleaned.includes("[REDACTED") || /^(?:none|null|n\/a|no action)$/i.test(cleaned)
        ? null
        : cleaned;
}

function cleanReason(value, fallback) {
    const cleaned = redactSensitiveText(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 150);
    return !cleaned || cleaned.includes("[REDACTED") ? fallback : cleaned;
}

function choosePriority(category, analysis) {
    if (category === "Spam") return "High";
    if (["Financial"].includes(category)) return "High";
    if (["Newsletter", "Promotional", "Junk"].includes(category)) return "Low";

    const text = analysis.text;
    if (category === "Sign-Up" && /\b(?:verify|confirm|activate|complete|confirma(?:r)?|activa(?:r)?|confirmez|activer|bestätig(?:e|en))\b/i.test(text)) return "High";
    if (category === "System" && /\b(?:security|sign[- ]in|login|password|payment\s+failed|invoice\s+due)\b/i.test(text)) return "High";
    if (category === "Travel" && /\b(?:check[- ]in|departure|gate\s+change|flight)\b/i.test(text)) return "High";
    if (category === "Health" && /\b(?:appointment|reschedule|prescription|lab\s+result)\b/i.test(text)) return "High";
    return "Normal";
}

function defaultAction(category, analysis) {
    if (["Spam", "Junk", "Newsletter", "Promotional", "Personal", "Work", "Social", "Education", "Other"].includes(category)) {
        return null;
    }
    for (const rule of ACTION_RULES) {
        if (rule.pattern.test(analysis.text)) return rule.action;
    }
    return null;
}

function deterministicTriage(metadata, originalFrom) {
    const analysis = analyzeMessage(metadata, originalFrom);
    const ranked = Object.entries(analysis.categoryScores)
        .filter(([category]) => category !== "Spam")
        .sort((left, right) => right[1] - left[1]);
    let [category, topScore] = ranked[0] || ["Other", 0];
    let secondScore = ranked[1]?.[1] || 0;

    if (analysis.spamScore >= 3.2) {
        category = "Spam";
        topScore = analysis.spamScore;
        secondScore = ranked[0]?.[1] || 0;
    } else if (topScore < 0.8) {
        category = analysis.headers.freeMail ? "Personal" : "Other";
        topScore = category === "Personal" ? 1.0 : 0.4;
        secondScore = 0;
    }

    // A List-Unsubscribe header is common in both newsletters and marketing.
    // Explicit promotion terms win when no editorial/newsletter terms appear.
    if (
        category === "Newsletter" &&
        analysis.categorySignals.Promotional > 0 &&
        analysis.categorySignals.Newsletter === 0
    ) {
        category = "Promotional";
        topScore = analysis.categoryScores.Promotional;
    }

    // A strongly structured transactional message outweighs generic marketing
    // terms such as “offer” in a receipt or account notification.
    if (category === "Promotional" && analysis.categoryScores.System >= 2.0) {
        category = "System";
        topScore = analysis.categoryScores.System;
    }

    const confidence = Math.max(0.5, Math.min(
        0.99,
        0.52 + Math.min(0.34, topScore * 0.09) + Math.min(0.12, Math.max(0, topScore - secondScore) * 0.06)
    ));
    const priority = choosePriority(category, analysis);
    const actionRequired = defaultAction(category, analysis);

    const reason = category === "Spam"
        ? `Suspicious signals: ${analysis.spamReasons.slice(0, 3).join(", ") || "high-risk content"}`
        : category === "Other"
            ? "No reliable category signal was identified"
            : `${category} signals detected from message content and headers`;

    return {
        category,
        priority,
        confidence,
        reason,
        actionRequired,
        serviceName: fallbackServiceName(originalFrom, category),
        analysis,
    };
}

function parseModelJson(raw) {
    if (!raw) return null;
    const candidate = raw.trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
        const parsed = JSON.parse(objectMatch[0]);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
        const keys = Object.keys(parsed).sort();
        const approved = [...MODEL_RESPONSE_KEYS].sort();
        if (keys.length !== approved.length || keys.some((key, index) => key !== approved[index])) return null;
        if (typeof parsed.is_target_email !== "boolean") return null;
        if (typeof parsed.service_name !== "string" || !CATEGORY_SET.has(parsed.category)) return null;
        for (const key of ["action_required", "action_url", "unsubscribe_url"]) {
            if (parsed[key] !== null && typeof parsed[key] !== "string") return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function canModelRefine(deterministic) {
    // The local model can help on ambiguous benign mail only. It cannot
    // override explicit spam, sign-up, financial, travel, health, or system signals.
    return ["Other", "Personal", "Work", "Social", "Education", "Junk"].includes(
        deterministic.category
    ) && deterministic.confidence < 0.82;
}

function companyKeyFrom(originalFrom, serviceName) {
    const domain = rootDomain(getSenderDomain(originalFrom));
    if (domain && !FREE_MAIL_DOMAINS.has(domain)) return `domain:${domain}`;
    const safeName = cleanServiceName(serviceName, "Unknown company")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `service:${safeName || "unknown-company"}`;
}

function buildResult({ deterministic, modelResult, originalFrom }) {
    const model = modelResult || {};
    const allowModel = canModelRefine(deterministic);
    const modelCategory = CATEGORY_SET.has(model.category) ? model.category : null;
    const category = allowModel && modelCategory && !["Spam"].includes(modelCategory)
        ? modelCategory
        : deterministic.category;
    const modelChangedCategory = category !== deterministic.category;
    const analysis = deterministic.analysis;

    const serviceName = cleanServiceName(
        modelChangedCategory ? model.service_name : null,
        fallbackServiceName(originalFrom, category)
    );
    const actionRequired = category === "Spam"
        ? null
        : cleanAction(modelChangedCategory ? model.action_required : null) ||
            defaultAction(category, analysis);
    const unsubscribeUrl = firstMatchingUrl(
        analysis.urls,
        /unsubscribe|opt[\/-]?out|email[-\/]?preferences|subscription[-\/]?preferences/i
    ) || (analysis.headers.hasListUnsubscribe ? analysis.urls[0] || null : null);
    const actionUrl = category === "Spam" || !actionRequired
        ? null
        : firstMatchingUrl(
            analysis.urls,
            /verify|confirm|activate|account|login|sign[-\/]?in|reset|action|review|approve|check[-\/]?in|reschedule|billing/i
        ) || null;

    return {
        is_target_email: RELATIONSHIP_CATEGORIES.has(category),
        service_name: serviceName,
        category,
        action_required: actionRequired,
        action_url: actionUrl,
        unsubscribe_url: unsubscribeUrl,
        triage_label: category,
        priority: category === "Spam" ? "High" : choosePriority(category, analysis),
        confidence: deterministic.confidence,
        classification_reason: deterministic.reason,
        model_used: activeModelId || "deterministic-rules",
        fallback_used: fallbackUsed,
        company_key: companyKeyFrom(originalFrom, serviceName),
    };
}

/* =========================================================
   COMPANY-LEVEL LEDGER
   This runs only in memory after individual classification. It uses only
   already-sanitized result fields and never combines or stores raw message text.
========================================================= */
function companyCategoryRank(category) {
    const ranks = {
        Spam: 100,
        Financial: 90,
        Health: 85,
        Travel: 80,
        System: 75,
        "Sign-Up": 70,
        Work: 60,
        Education: 55,
        Social: 50,
        Personal: 45,
        Newsletter: 35,
        Promotional: 30,
        Junk: 25,
        Other: 10,
    };
    return ranks[category] || 0;
}

function safeCompanyName(value) {
    return cleanServiceName(value, "Unknown company") || "Unknown company";
}

function summarizeCompany(category, count, actionRequired) {
    const messageLabel = `${count} message${count === 1 ? "" : "s"}`;
    if (category === "Spam") {
        return `${messageLabel} from this company contained suspicious signals. Avoid links and attachments.`;
    }
    if (actionRequired) {
        return `${messageLabel} from this company. ${actionRequired}.`;
    }
    const summaries = {
        "Sign-Up": `${messageLabel} about account setup or verification.`,
        Newsletter: `${messageLabel} in this company’s newsletter stream.`,
        Promotional: `${messageLabel} with promotional activity.`,
        System: `${messageLabel} with service or account updates.`,
        Junk: `${messageLabel} identified as low-value unsolicited outreach.`,
        Personal: `${messageLabel} from a personal contact.`,
        Work: `${messageLabel} with work-related activity.`,
        Social: `${messageLabel} with social or community activity.`,
        Travel: `${messageLabel} with travel-related activity.`,
        Financial: `${messageLabel} with financial activity.`,
        Health: `${messageLabel} with health-related activity.`,
        Education: `${messageLabel} with education-related activity.`,
        Other: `${messageLabel} with no stronger category signal.`,
    };
    return summaries[category] || summaries.Other;
}

function safeMailboxLocation(value) {
    const cleaned = String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
    return cleaned || null;
}

function safeMailboxLocations(value) {
    const candidates = Array.isArray(value) ? value : [value];
    return [...new Set(candidates.map(safeMailboxLocation).filter(Boolean))];
}

export function aggregateCompanyResults(messageResults = []) {
    const groups = new Map();
    for (const item of messageResults) {
        if (!item || typeof item !== "object") continue;
        const name = safeCompanyName(item.name || item.service_name);
        const key = typeof item.company_key === "string" && item.company_key
            ? item.company_key
            : `service:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown-company"}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({
            name,
            category: CATEGORY_SET.has(item.category || item.triage_label) ? (item.category || item.triage_label) : "Other",
            action_required: cleanAction(item.action_required),
            locations: safeMailboxLocations(item.locations || item.location),
        });
    }

    return [...groups.entries()].map(([companyKey, entries]) => {
        const category = entries
            .map((entry) => entry.category)
            .sort((left, right) => companyCategoryRank(right) - companyCategoryRank(left))[0] || "Other";
        const actionRequired = entries.find((entry) => entry.category === category && entry.action_required)?.action_required || null;
        const locations = [...new Set(entries.flatMap((entry) => entry.locations))];
        const nameCounts = new Map();
        for (const entry of entries) nameCounts.set(entry.name, (nameCounts.get(entry.name) || 0) + 1);
        const name = [...nameCounts.entries()]
            .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || "Unknown company";

        return {
            company_key: companyKey,
            name,
            category,
            message_count: entries.length,
            summary: summarizeCompany(category, entries.length, actionRequired),
            location: locations.join(" · ") || "No Gmail label returned",
        };
    }).sort((left, right) => companyCategoryRank(right.category) - companyCategoryRank(left.category) || left.name.localeCompare(right.name));
}

/* =========================================================
   LOCAL EMAIL TRIAGE
   This does not train, persist, or self-modify the AI model. It combines
   privacy-filtered deterministic analysis with a local-model second opinion
   only where the deterministic result is benign and low-confidence.
========================================================= */
export async function classifyEmail(from, subject, snippet, onFound, metadata = {}) {
    const sanitized = sanitizeInput({
        from,
        subject,
        snippet,
        listUnsubscribe: metadata.listUnsubscribe || "",
        precedence: metadata.precedence || "",
        autoSubmitted: metadata.autoSubmitted || "",
        replyTo: metadata.replyTo || "",
        returnPath: metadata.returnPath || "",
        authenticationResults: metadata.authenticationResults || "",
    });
    const deterministic = deterministicTriage(sanitized, from);

    let modelResult = null;
    if (engine && canModelRefine(deterministic)) {
        const prompt = `Classify this sanitized email into exactly one category.\n\nAllowed categories: ${TRIAGE_CATEGORIES.join(", ")}.\n\nRules:\n- Spam includes phishing, impersonation, payment threats, prize-fee scams, impossible investment returns, and malware lures.\n- Junk is low-value unsolicited outreach that is not clearly malicious.\n- Never infer or output private information. The input is already redacted.\n- Return JSON only with exactly these keys and no extra keys: is_target_email, service_name, category, action_required, action_url, unsubscribe_url.\n- action_required, action_url, and unsubscribe_url must be a string or null.\n\nSANITIZED EMAIL:\nFrom: ${sanitized.from}\nSubject: ${sanitized.subject}\nPreview: ${sanitized.snippet}\nList-Unsubscribe: ${sanitized.listUnsubscribe || "[absent]"}\nPrecedence: ${sanitized.precedence || "[absent]"}\nAuto-Submitted: ${sanitized.autoSubmitted || "[absent]"}\nReply-To domain: ${sanitized.replyToDomain || "[absent]"}\nAuthentication-Results: ${sanitized.authenticationResults || "[absent]"}`;

        try {
            const reply = await engine.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a privacy-preserving, conservative email triage classifier. Output valid JSON only with the exact required keys and no Markdown.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0,
                max_tokens: 220,
            });
            modelResult = parseModelJson(reply.choices?.[0]?.message?.content || "");
        } catch {
            // Safe deterministic triage remains the result if local inference is interrupted.
        }
    }

    const result = buildResult({ deterministic, modelResult, originalFrom: from });
    if (onFound) onFound(result);
    return result;
}

export const __testables = {
    redactSensitiveText,
    sanitizeInput,
    normalizeSafeUrl,
    extractSafeUrls,
    analyzeUrls,
    detectHeaderSignals,
    analyzeMessage,
    deterministicTriage,
    buildResult,
    parseModelJson,
    canModelRefine,
    fallbackServiceName,
    companyKeyFrom,
    summarizeCompany,
    resetModelState: () => {
        engine = null;
        activeModelId = null;
        fallbackUsed = false;
    },
};
