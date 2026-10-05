/** Luhn check for demo card inputs (client + server share this). */
export function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): string {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(51|52|53|54|55)/.test(d)) return "Mastercard";
  if (/^(60|65)/.test(d)) return "RuPay";
  return "Card";
}

export function validUpiId(id: string): boolean {
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(id.trim());
}
