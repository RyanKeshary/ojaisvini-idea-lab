import { PrismaClient } from "@prisma/client";

/**
 * 26 REAL schemes for women entrepreneurs (central + Maharashtra).
 * Honesty rules: amounts only where widely documented, otherwise
 * "see official site". Every row carries sourceUrl + lastVerifiedAt,
 * and the UI always shows a "verify on the official site" note.
 * JSON fields: states/categories/gender/occupations/businessTypes/casteList
 * are string arrays; benefits/nameI18n are {en,hi,mr}.
 */
const V = new Date("2026-09-01");
const J = (v) => JSON.stringify(v);

const SCHEMES = [
  {
    name: "PM Mudra Yojana", nameI18n: J({ hi: "PM Mudra Yojana", mr: "PM Mudra Yojana" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "tailoring", "handicraft", "farm", "service", "vendor", "artisan", "any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Collateral-free business loans: Shishu to ₹50K, Kishore to ₹5L, Tarun to ₹10L.", hi: "Bina guarantee business loan: Shishu ₹50 hazar, Kishore ₹5 lakh, Tarun ₹10 lakh tak.", mr: "Guarantee shivay business loan: Shishu ₹50 hajar, Kishore ₹5 lakh, Tarun ₹10 lakh paryant." }),
    documents: J(["Aadhaar card", "Bank passbook / statement", "Business proof or plan", "Passport photo"]),
    applyUrl: "https://www.mudra.org.in", sourceUrl: "https://www.mudra.org.in", lastVerifiedAt: V,
  },
  {
    name: "Stand-Up India", nameI18n: J({ hi: "Stand-Up India", mr: "Stand-Up India" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Bank loans ₹10L–₹1Cr for SC/ST and women entrepreneurs starting greenfield ventures.", hi: "SC/ST aur mahilaon ke naye business ke liye ₹10 lakh–₹1 crore bank loan.", mr: "SC/ST aani mahilanchya navin business sathi ₹10 lakh–₹1 crore bank loan." }),
    documents: J(["Aadhaar card", "Caste certificate (for SC/ST)", "Business project report", "Bank account"]),
    applyUrl: "https://www.standupmitra.in", sourceUrl: "https://www.standupmitra.in", lastVerifiedAt: V,
  },
  {
    name: "PMEGP", nameI18n: J({ hi: "PMEGP", mr: "PMEGP" }),
    level: "central", states: J(["ALL"]), categories: J(["loan", "subsidy"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "tailoring", "handicraft", "artisan", "service", "any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Manufacturing up to ₹50L / services up to ₹20L with 15–35% subsidy. Special rates for women.", hi: "Manufacturing ₹50 lakh / service ₹20 lakh tak, 15–35% subsidy. Mahilaon ko special rate.", mr: "Manufacturing ₹50 lakh / service ₹20 lakh paryant, 15–35% subsidy. Mahilanna special dar." }),
    documents: J(["Aadhaar card", "Project report", "Education proof (8th pass+)", "Bank account"]),
    applyUrl: "https://www.kviconline.gov.in", sourceUrl: "https://www.kviconline.gov.in", lastVerifiedAt: V,
  },
  {
    name: "PMFME", nameI18n: J({ hi: "PMFME", mr: "PMFME" }),
    level: "central", states: J(["ALL"]), categories: J(["loan", "subsidy", "training"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "For micro food businesses (pickle, papad!): 35% credit-linked subsidy up to ₹10L + training.", hi: "Chhote food business (achaar, papad!) ke liye: 35% subsidy ₹10 lakh tak + training.", mr: "Lahan food business (loncha, papad!) sathi: 35% subsidy ₹10 lakh paryant + training." }),
    documents: J(["Aadhaar card", "Food business proof", "Bank account", "DPR (project report)"]),
    applyUrl: "https://pmfme.mofpi.gov.in", sourceUrl: "https://pmfme.mofpi.gov.in", lastVerifiedAt: V,
  },
  {
    name: "PM Vishwakarma", nameI18n: J({ hi: "PM Vishwakarma", mr: "PM Vishwakarma" }),
    level: "central", states: J(["ALL"]), categories: J(["loan", "training", "subsidy"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["artisan"]), businessTypes: J(["artisan", "tailoring", "handicraft"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Artisans: collateral-free loans (₹1L + ₹2L at 5%), toolkit support, paid skill training.", hi: "Karigaron ko: bina guarantee loan, toolkit madad, stipend wali training.", mr: "Karagiranna: guarantee shivay loan, toolkit madat, stipend wali training." }),
    documents: J(["Aadhaar card", "Artisan proof / trade certificate", "Bank account"]),
    applyUrl: "https://pmvishwakarma.gov.in", sourceUrl: "https://pmvishwakarma.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Mahila Udyam Nidhi (SIDBI)", nameI18n: J({ hi: "Mahila Udyam Nidhi", mr: "Mahila Udyam Nidhi" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "SIDBI loans for women micro/small enterprises — see official site for current limits.", hi: "Mahila micro/small business ke liye SIDBI loan — limit official site par dekhein.", mr: "Mahila micro/small business sathi SIDBI loan — limit official site var paha." }),
    documents: J(["Aadhaar card", "Business proof", "Bank account"]),
    applyUrl: "https://www.sidbi.in", sourceUrl: "https://www.sidbi.in", lastVerifiedAt: V,
  },
  {
    name: "Annapurna Scheme (SBI)", nameI18n: J({ hi: "Annapurna Yojana", mr: "Annapurna Yojana" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: 60, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "SBI loans for women food-catering businesses — see official site for current limits.", hi: "Mahila food-catering business ke liye SBI loan — limit official site par dekhein.", mr: "Mahila food-catering business sathi SBI loan — limit official site var paha." }),
    documents: J(["Aadhaar card", "Food business proof", "Bank account"]),
    applyUrl: "https://sbi.co.in", sourceUrl: "https://sbi.co.in", lastVerifiedAt: V,
  },
  {
    name: "Mahila Samriddhi Yojana (NSFDC)", nameI18n: J({ hi: "Mahila Samriddhi Yojana", mr: "Mahila Samriddhi Yojana" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: 300000,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J(["SC"]), shgOnly: false,
    benefits: J({ en: "Microfinance for Scheduled Caste women entrepreneurs via NSFDC channel partners.", hi: "Anusuchit jaati mahilaon ke liye NSFDC microfinance.", mr: "Anusuchit jaati mahilansathi NSFDC microfinance." }),
    documents: J(["Aadhaar card", "Caste certificate", "Income proof", "Bank account"]),
    applyUrl: "https://nsfdc.nic.in", sourceUrl: "https://nsfdc.nic.in", lastVerifiedAt: V,
  },
  {
    name: "New Swarnima (NBCFDC)", nameI18n: J({ hi: "New Swarnima", mr: "New Swarnima" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: 300000,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J(["OBC"]), shgOnly: false,
    benefits: J({ en: "Term loans for backward-class women at concessional rates — see official site for limits.", hi: "Pichhde varg ki mahilaon ko riyayati dar par loan — limit official site par dekhein.", mr: "Magasvargiya mahilanna savalati darane loan — limit official site var paha." }),
    documents: J(["Aadhaar card", "Caste certificate", "Income proof", "Bank account"]),
    applyUrl: "https://nbcfdc.gov.in", sourceUrl: "https://nbcfdc.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Mahila Coir Yojana", nameI18n: J({ hi: "Mahila Coir Yojana", mr: "Mahila Coir Yojana" }),
    level: "central", states: J(["ALL"]), categories: J(["training", "subsidy"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["artisan"]), businessTypes: J(["handicraft", "artisan"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Coir Board training for rural women in coir craft with stipend support.", hi: "Coir kaam ki training + stipend, Coir Board se.", mr: "Coir kamachi training + stipend, Coir Board kadun." }),
    documents: J(["Aadhaar card", "Bank account", "Passport photo"]),
    applyUrl: "https://coirboard.gov.in", sourceUrl: "https://coirboard.gov.in", lastVerifiedAt: V,
  },
  {
    name: "DAY-NRLM / Lakhpati Didi", nameI18n: J({ hi: "Lakhpati Didi", mr: "Lakhpati Didi" }),
    level: "central", states: J(["ALL"]), categories: J(["loan", "training"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "farm", "tailoring", "handicraft", "service", "vendor", "any"]),
    casteList: J([]), shgOnly: true,
    benefits: J({ en: "SHG women: bank linkage, interest support and skilling toward ₹1L+ yearly income.", hi: "SHG mahilaon ko: bank loan, byaaj madad, training — saal mein ₹1 lakh+ kamai ka lakshya.", mr: "SHG mahilanna: bank loan, vyaj madat, training — varshala ₹1 lakh+ kamai cha uddesh." }),
    documents: J(["Aadhaar card", "SHG membership", "Bank account"]),
    applyUrl: "https://aajeevika.gov.in", sourceUrl: "https://aajeevika.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Udyam Registration", nameI18n: J({ hi: "Udyam Registration", mr: "Udyam Registration" }),
    level: "central", states: J(["ALL"]), categories: J(["account"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Free MSME registration: unlocks loans, subsidies and government buyers.", hi: "Free MSME registration: loan, subsidy aur sarkari kharid ke darwaze.", mr: "Free MSME registration: loan, subsidy aani sarkari kharediche darvaje." }),
    documents: J(["Aadhaar card", "PAN card", "Bank account"]),
    applyUrl: "https://udyamregistration.gov.in", sourceUrl: "https://udyamregistration.gov.in", lastVerifiedAt: V,
  },
  {
    name: "CGTMSE", nameI18n: J({ hi: "CGTMSE", mr: "CGTMSE" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Credit guarantee so banks can lend without collateral — ask your bank for CGTMSE cover.", hi: "Guarantee cover taaki bank bina girvi loan de — bank se CGTMSE cover maango.", mr: "Guarantee cover mhanje bank taran shivay loan deil — bankela CGTMSE cover vichara." }),
    documents: J(["Aadhaar card", "Business loan application", "Bank account"]),
    applyUrl: "https://www.cgtmse.in", sourceUrl: "https://www.cgtmse.in", lastVerifiedAt: V,
  },
  {
    name: "PMJJBY", nameI18n: J({ hi: "PMJJBY", mr: "PMJJBY" }),
    level: "central", states: J(["ALL"]), categories: J(["insurance"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: 50, incomeMax: null,
    occupations: J(["any"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "₹2 lakh life insurance for ~₹436/year, auto-debited from your bank.", hi: "~₹436/saal mein ₹2 lakh jeevan bima, bank se auto-debit.", mr: "~₹436/varshala ₹2 lakh jeevan vima, banketun auto-debit." }),
    documents: J(["Aadhaar card", "Bank account with auto-debit consent"]),
    applyUrl: "https://www.jansuraksha.gov.in", sourceUrl: "https://www.jansuraksha.gov.in", lastVerifiedAt: V,
  },
  {
    name: "PMSBY", nameI18n: J({ hi: "PMSBY", mr: "PMSBY" }),
    level: "central", states: J(["ALL"]), categories: J(["insurance"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: 70, incomeMax: null,
    occupations: J(["any"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "₹2 lakh accident insurance for ~₹20/year from your bank.", hi: "~₹20/saal mein ₹2 lakh durghatna bima.", mr: "~₹20/varshala ₹2 lakh apghat vima." }),
    documents: J(["Aadhaar card", "Bank account with auto-debit consent"]),
    applyUrl: "https://www.jansuraksha.gov.in", sourceUrl: "https://www.jansuraksha.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Atal Pension Yojana", nameI18n: J({ hi: "Atal Pension", mr: "Atal Pension" }),
    level: "central", states: J(["ALL"]), categories: J(["savings"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: 40, incomeMax: null,
    occupations: J(["any"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Guaranteed ₹1,000–₹5,000 monthly pension after 60; small monthly deposits now.", hi: "60 ke baad ₹1,000–₹5,000 monthly pension; abhi chhoti mahine ki jama.", mr: "60 nanter ₹1,000–₹5,000 monthly pension; aata lahan mahinyachi bachat." }),
    documents: J(["Aadhaar card", "Bank account"]),
    applyUrl: "https://www.npscra.nsdl.co.in", sourceUrl: "https://www.npscra.nsdl.co.in", lastVerifiedAt: V,
  },
  {
    name: "PM Jan Dhan", nameI18n: J({ hi: "Jan Dhan", mr: "Jan Dhan" }),
    level: "central", states: J(["ALL"]), categories: J(["account"]), gender: J(["women", "men"]),
    ageMin: 10, ageMax: null, incomeMax: null,
    occupations: J(["any"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Free zero-balance bank account with RuPay card — the base for every other scheme.", hi: "Free zero-balance khata + RuPay card — har yojana ki neev.", mr: "Free zero-balance khata + RuPay card — pratyek yojnecha paya." }),
    documents: J(["Aadhaar card", "Passport photo"]),
    applyUrl: "https://pmjdy.gov.in", sourceUrl: "https://pmjdy.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Mahila Samman Savings Certificate", nameI18n: J({ hi: "Mahila Samman", mr: "Mahila Samman" }),
    level: "central", states: J(["ALL"]), categories: J(["savings"]), gender: J(["women"]),
    ageMin: 0, ageMax: null, incomeMax: null,
    occupations: J(["any"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "7.5% deposit scheme for women/girls, up to ₹2 lakh for 2 years at post offices.", hi: "Mahilaon ke liye 7.5% jama yojana, ₹2 lakh tak, 2 saal, post office mein.", mr: "Mahilansathi 7.5% thev yojana, ₹2 lakh paryant, 2 varsha, post office madhye." }),
    documents: J(["Aadhaar card", "KYC documents", "Pay-in slip"]),
    applyUrl: "https://www.indiapost.gov.in", sourceUrl: "https://www.indiapost.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Mahila E-Haat", nameI18n: J({ hi: "Mahila E-Haat", mr: "Mahila E-Haat" }),
    level: "central", states: J(["ALL"]), categories: J(["market"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["handicraft", "tailoring", "food", "artisan", "any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Free online showcase for women's products by Rashtriya Mahila Kosh.", hi: "Mahila products ka free online showcase (RMK).", mr: "Mahila product cha free online showcase (RMK)." }),
    documents: J(["Aadhaar card", "Product photos", "Bank account"]),
    applyUrl: "https://mahilaehaat-rmk.gov.in", sourceUrl: "https://mahilaehaat-rmk.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Rashtriya Mahila Kosh", nameI18n: J({ hi: "Rashtriya Mahila Kosh", mr: "Rashtriya Mahila Kosh" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Micro-credit for poor women via NGO partners — ask your Sakhi about RMK loans.", hi: "NGO ke through garib mahilaon ko micro-credit — Sakhi se RMK loan poocho.", mr: "NGO marfat garib mahilanna micro-credit — Sakhi la RMK loan vichara." }),
    documents: J(["Aadhaar card", "SHG/NGO reference", "Bank account"]),
    applyUrl: "https://rmk.nic.in", sourceUrl: "https://rmk.nic.in", lastVerifiedAt: V,
  },
  {
    name: "PM SVANidhi", nameI18n: J({ hi: "PM SVANidhi", mr: "PM SVANidhi" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["vendor"]), businessTypes: J(["vendor", "food"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "Street/tiffin vendors: collateral-free loans ₹10K→₹20K→₹50K + cashback on digital payments.", hi: "Rehdi/tiffin walon ko: bina guarantee ₹10K→₹20K→₹50K loan + digital payment par cashback.", mr: "Hathgadi/tiffin walyanna: guarantee shivay ₹10K→₹20K→₹50K loan + digital payment var cashback." }),
    documents: J(["Aadhaar card", "Vendor certificate / ULB letter", "Bank account"]),
    applyUrl: "https://pmsvanidhi.mohua.gov.in", sourceUrl: "https://pmsvanidhi.mohua.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Startup India Seed Fund", nameI18n: J({ hi: "Startup India Seed Fund", mr: "Startup India Seed Fund" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "DPIIT-recognised startups: seed support for prototype and trials — see official site.", hi: "DPIIT startups ko seed support — details official site par dekhein.", mr: "DPIIT startups na seed support — tapshil official site var paha." }),
    documents: J(["DPIIT recognition", "Pitch deck", "Bank account"]),
    applyUrl: "https://www.startupindia.gov.in", sourceUrl: "https://www.startupindia.gov.in", lastVerifiedAt: V,
  },
  {
    name: "Sukanya Samriddhi", nameI18n: J({ hi: "Sukanya Samriddhi", mr: "Sukanya Samriddhi" }),
    level: "central", states: J(["ALL"]), categories: J(["savings"]), gender: J(["women", "men"]),
    ageMin: 0, ageMax: 10, incomeMax: null,
    occupations: J(["parent"]), businessTypes: J(["any"]),
    casteList: J([]), shgOnly: false,
    benefits: J({ en: "High-interest savings for a girl child under 10 — for her future, from your earnings.", hi: "10 saal se chhoti beti ke liye high-interest bachat.", mr: "10 varsha khalil mulisathi high-interest bachat." }),
    documents: J(["Girl child's birth certificate", "Parent Aadhaar + KYC"]),
    applyUrl: "https://www.indiapost.gov.in", sourceUrl: "https://www.indiapost.gov.in", lastVerifiedAt: V,
  },
  {
    name: "MAVIM", nameI18n: J({ hi: "MAVIM", mr: "MAVIM" }),
    level: "state", states: J(["MH"]), categories: J(["loan", "training"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "tailoring", "handicraft", "farm", "service", "any"]),
    casteList: J([]), shgOnly: true,
    benefits: J({ en: "Maharashtra's women's development corporation: SHG credit + enterprise support.", hi: "Maharashtra mahila vikas: SHG credit + business madad.", mr: "Maharashtra mahila vikas: SHG credit + udyog madat." }),
    documents: J(["Aadhaar card", "SHG membership", "Bank account"]),
    applyUrl: "https://mavimindia.org", sourceUrl: "https://mavimindia.org", lastVerifiedAt: V,
  },
  {
    name: "UMED-MSRLM", nameI18n: J({ hi: "UMED", mr: "UMED" }),
    level: "state", states: J(["MH"]), categories: J(["loan", "training"]), gender: J(["women"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "farm", "tailoring", "handicraft", "service", "any"]),
    casteList: J([]), shgOnly: true,
    benefits: J({ en: "Maharashtra rural livelihoods mission: SHG bank linkage + farm/non-farm support.", hi: "Maharashtra grameen mission: SHG bank loan + kheti/gair-kheti madad.", mr: "Maharashtra gramin mission: SHG bank loan + sheti/bigar-sheti madat." }),
    documents: J(["Aadhaar card", "SHG membership", "Bank account"]),
    applyUrl: "https://umed.in", sourceUrl: "https://umed.in", lastVerifiedAt: V,
  },
  {
    name: "SHG-Bank Linkage (NABARD)", nameI18n: J({ hi: "SHG-Bank Linkage", mr: "SHG-Bank Linkage" }),
    level: "central", states: J(["ALL"]), categories: J(["loan"]), gender: J(["women", "men"]),
    ageMin: 18, ageMax: null, incomeMax: null,
    occupations: J(["entrepreneur"]), businessTypes: J(["food", "farm", "tailoring", "handicraft", "service", "any"]),
    casteList: J([]), shgOnly: true,
    benefits: J({ en: "SHGs get collateral-free bank loans after 6 months of regular saving.", hi: "6 mahine regular bachat par SHG ko bina guarantee bank loan.", mr: "6 mahine niyamit bachatinantar SHG la guarantee shivay bank loan." }),
    documents: J(["SHG records (6 months)", "Member KYC", "SHG bank account"]),
    applyUrl: "https://www.nabard.org", sourceUrl: "https://www.nabard.org", lastVerifiedAt: V,
  },
];

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();
  let created = 0;
  for (const s of SCHEMES) {
    const existing = await db.scheme.findFirst({ where: { name: s.name } });
    if (existing) {
      await db.scheme.update({ where: { id: existing.id }, data: s });
    } else {
      await db.scheme.create({ data: s });
      created++;
    }
  }
  console.log(`schemes seed ok: ${SCHEMES.length} total, ${created} new`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
