// Currency formatting with support for different currencies
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency is not supported
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
      MXN: "$",
      KRW: "₩",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      PLN: "zł",
      CZK: "Kč",
      HUF: "Ft",
      RUB: "₽",
      TRY: "₺",
      ZAR: "R",
      SGD: "S$",
      HKD: "HK$",
      NZD: "NZ$",
      THB: "฿",
      PHP: "₱",
      IDR: "Rp",
      MYR: "RM",
      VND: "₫",
      AED: "د.إ",
      SAR: "﷼",
      ILS: "₪",
      EGP: "E£",
      NGN: "₦",
      PKR: "₨",
      BDT: "৳",
      UAH: "₴",
      RON: "lei",
      BGN: "лв",
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

// Get currency symbol only
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    INR: "₹",
    BRL: "R$",
    MXN: "$",
    KRW: "₩",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    RUB: "₽",
    TRY: "₺",
    ZAR: "R",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
  };
  return symbols[currency] || currency;
}

// Format number with thousands separator
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Format percentage
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num >= 0 ? "+" : ""}${num.toFixed(decimals)}%`;
}

// Format date range display
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
}
