const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;
const MONTH_NAME_PATTERN =
  /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)$/i;
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length === 0 || email.length > 254 || /\s/.test(email)) {
    return false;
  }
  const at = email.lastIndexOf("@");
  if (at <= 0 || at !== email.indexOf("@") || at === email.length - 1) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length === 0 || local.length > 64) return false;
  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..") ||
    !domain.includes(".")
  ) {
    return false;
  }
  return EMAIL_PATTERN.test(email);
}

export function isValidPhone(value: string): boolean {
  const phone = value.trim();
  if (!PHONE_PATTERN.test(phone)) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const hasScheme = SCHEME_PATTERN.test(trimmed);
  if (!hasScheme && !/^\S+\.\S+/.test(trimmed)) return false;

  try {
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function isValidDate(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^(present|current|now)$/i.test(trimmed)) return true;

  if (/^\d{4}$/.test(trimmed)) {
    return isPlausibleYear(Number(trimmed));
  }

  const yearMonth = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (yearMonth) {
    return (
      isPlausibleYear(Number(yearMonth[1])) && isMonth(Number(yearMonth[2]))
    );
  }

  const isoDate = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    return isRealIsoDate(
      Number(isoDate[1]),
      Number(isoDate[2]),
      Number(isoDate[3]),
    );
  }

  const monthYear = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    return (
      MONTH_NAME_PATTERN.test(monthYear[1]) &&
      isPlausibleYear(Number(monthYear[2]))
    );
  }

  const monthDayYear = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (monthDayYear) {
    return (
      MONTH_NAME_PATTERN.test(monthDayYear[1]) &&
      isPlausibleYear(Number(monthDayYear[3])) &&
      isDay(Number(monthDayYear[2]))
    );
  }

  const dayMonthYear = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dayMonthYear) {
    return (
      isDay(Number(dayMonthYear[1])) &&
      MONTH_NAME_PATTERN.test(dayMonthYear[2]) &&
      isPlausibleYear(Number(dayMonthYear[3]))
    );
  }

  const slashMonthYear = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMonthYear) {
    return (
      isMonth(Number(slashMonthYear[1])) &&
      isPlausibleYear(Number(slashMonthYear[2]))
    );
  }

  const slashYearMonth = trimmed.match(/^(\d{4})\/(\d{1,2})$/);
  if (slashYearMonth) {
    return (
      isPlausibleYear(Number(slashYearMonth[1])) &&
      isMonth(Number(slashYearMonth[2]))
    );
  }

  return false;
}

function isPlausibleYear(year: number): boolean {
  return year >= 1900 && year <= 2100;
}

function isMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}

function isDay(day: number): boolean {
  return day >= 1 && day <= 31;
}

function isRealIsoDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
