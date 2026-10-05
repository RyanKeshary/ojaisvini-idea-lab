/**
 * Deterministic eligibility engine. Rules live in DATA + THIS CODE —
 * the LLM never decides eligibility, it only explains.
 */

export type Profile = {
  state: string; // "MH" | "ALL"-ish | other state code
  age: number | null;
  gender: string; // "women" | "men"
  incomeAnnual: number | null;
  business: string; // food|tailoring|handicraft|farm|service|vendor|artisan|parent|any
  shg: boolean | null;
  caste: string | null; // SC|ST|OBC|General|null
};

export type Verdict = "ELIGIBLE" | "MAYBE" | "NOT_ELIGIBLE";
export type Reason = { code: string; want?: string };

export type SchemeRow = {
  states: string;
  categories: string;
  gender: string;
  ageMin: number | null;
  ageMax: number | null;
  incomeMax: number | null;
  occupations: string;
  businessTypes: string;
  casteList: string;
  shgOnly: boolean;
};

function arr(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function evaluate(scheme: SchemeRow, p: Profile): { verdict: Verdict; reasons: Reason[] } {
  const hard: Reason[] = [];
  const soft: Reason[] = [];
  const states = arr(scheme.states);
  const genders = arr(scheme.gender);
  const businesses = arr(scheme.businessTypes);
  const castes = arr(scheme.casteList);

  if (!states.includes("ALL") && !states.includes(p.state)) {
    hard.push({ code: "state", want: states.join("/") });
  }
  if (genders.length > 0 && !genders.includes(p.gender) && !genders.includes("any")) {
    hard.push({ code: "gender" });
  }
  if (p.age !== null) {
    if ((scheme.ageMin !== null && p.age < scheme.ageMin) || (scheme.ageMax !== null && p.age > scheme.ageMax)) {
      hard.push({ code: "age" });
    }
  } else if (scheme.ageMin !== null || scheme.ageMax !== null) {
    soft.push({ code: "ageNeeded" });
  }
  if (p.incomeAnnual !== null && scheme.incomeMax !== null && p.incomeAnnual > scheme.incomeMax) {
    hard.push({ code: "income" });
  } else if (p.incomeAnnual === null && scheme.incomeMax !== null) {
    soft.push({ code: "incomeNeeded" });
  }
  if (castes.length > 0) {
    if (p.caste && !castes.includes(p.caste)) hard.push({ code: "caste" });
    else if (!p.caste) soft.push({ code: "casteNeeded" });
  }
  if (businesses.length > 0 && !businesses.includes("any") && !businesses.includes(p.business)) {
    soft.push({ code: "business" });
  }
  if (scheme.shgOnly && p.shg === false) {
    soft.push({ code: "shg" });
  } else if (scheme.shgOnly && p.shg === null) {
    soft.push({ code: "shgNeeded" });
  }

  if (hard.length > 0) return { verdict: "NOT_ELIGIBLE", reasons: hard };
  if (soft.length > 0) return { verdict: "MAYBE", reasons: soft };
  return { verdict: "ELIGIBLE", reasons: [] };
}
