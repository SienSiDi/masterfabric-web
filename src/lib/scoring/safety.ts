const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const PHONE_RE = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/;
const CREDIT_CARD_RE = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;
const API_KEY_RE = /\b(sk-|ak-|api[_-]?key[_-]?:?\s*['"]?[A-Za-z0-9_-]{20,})\b/i;

const SLURS = [
  "nigger", "nigga", "faggot", "fag", "retard", "retarded",
  "kike", "spic", "chink", "wetback", "beaner", "towelhead",
  "gook", "cracker", "honky",
];

const SLUR_RE = new RegExp(`\\b(${SLURS.join("|")})\\b`, "i");

export function checkSafety(text: string): boolean {
  if (EMAIL_RE.test(text)) return true;
  if (PHONE_RE.test(text)) return true;
  if (SSN_RE.test(text)) return true;
  if (CREDIT_CARD_RE.test(text)) return true;
  if (API_KEY_RE.test(text)) return true;
  if (SLUR_RE.test(text)) return true;
  return false;
}
