import { PrismaClient } from "@prisma/client";

/**
 * Gujarati + Tamil benefit one-liners for the 26 seeded schemes.
 * Keyed by official English name; merged into benefits/nameI18n JSON.
 * Honest scope: amounts only where the base record documents them.
 */
const GU = {
  "PM Mudra Yojana": "Guarantee vagar business loan: Shishu ₹50 hajaar, Kishore ₹5 laakh, Tarun ₹10 laakh sudhee.",
  "Stand-Up India": "SC/ST ane mahilaona navaa business maate ₹10 laakh–₹1 crore bank loan.",
  "PMEGP": "Manufacturing ₹50 laakh / service ₹20 laakh sudhee, 15–35% subsidy. Mahilaone special dar.",
  "PMFME": "Naana food business (achaar, papad!) maate: 35% subsidy ₹10 laakh sudhee + training.",
  "PM Vishwakarma": "Kaarigarone: guarantee vagar loan, toolkit madad, stipend vaadi training.",
  "Mahila Udyam Nidhi (SIDBI)": "Mahila micro/small business maate SIDBI loan — limit official site par juo.",
  "Annapurna Scheme (SBI)": "Mahila food-catering business maate SBI loan — limit official site par juo.",
  "Mahila Samriddhi Yojana (NSFDC)": "Anusuchit jaati mahilaao maate NSFDC microfinance.",
  "New Swarnima (NBCFDC)": "Paachhal vargni mahilaaone riyaayati dare loan — limit official site par juo.",
  "Mahila Coir Yojana": "Coir kaamni training + stipend, Coir Board tarafthi.",
  "DAY-NRLM / Lakhpati Didi": "SHG mahilaaone: bank loan, vyaaj madad, training — varshe ₹1 laakh+ kamaano lakshya.",
  "Udyam Registration": "Free MSME registration: loan, subsidy ane sarkaari khareedna dwaar.",
  "CGTMSE": "Guarantee cover jethee bank girve vagar loan aape — bank paase CGTMSE cover maango.",
  "PMJJBY": "~₹436/varshe ₹2 laakh jeevan vima, bank thi auto-debit.",
  "PMSBY": "~₹20/varshe ₹2 laakh akasmaat vima.",
  "Atal Pension Yojana": "60 pachhi ₹1,000–₹5,000 monthly pension; atyaare naani mahinaani bachat.",
  "PM Jan Dhan": "Free zero-balance khaatu + RuPay card — darek yojnaano paayo.",
  "Mahila Samman Savings Certificate": "Mahilaao maate 7.5% thaapan yojana, ₹2 laakh sudhee, 2 varas, post office maa.",
  "Mahila E-Haat": "Mahila products nu free online showcase (RMK).",
  "Rashtriya Mahila Kosh": "NGO dwara garib mahilaaone micro-credit — Sakhi ne RMK loan puchho.",
  "PM SVANidhi": "Laari/tiffin vaadaaone: guarantee vagar ₹10K→₹20K→₹50K loan + digital payment par cashback.",
  "Startup India Seed Fund": "DPIIT startups ne seed support — vigat official site par juo.",
  "Sukanya Samriddhi": "10 varasthi naani dikri maate high-interest bachat.",
  "MAVIM": "Maharashtra mahila vikaas: SHG credit + business madad.",
  "UMED-MSRLM": "Maharashtra graameen mission: SHG bank loan + kheti/bigar-kheti madad.",
  "SHG-Bank Linkage (NABARD)": "6 maheena niyameet bachat pachhi SHG ne guarantee vagar bank loan.",
};

const TA = {
  "PM Mudra Yojana": "Guarantee illamal business loan: Shishu ₹50K, Kishore ₹5L, Tarun ₹10L varai.",
  "Stand-Up India": "SC/ST matrum pengalin pudhiya business-kku ₹10L–₹1Cr bank loan.",
  "PMEGP": "Manufacturing ₹50L / service ₹20L varai, 15–35% subsidy. Pengalukku special rate.",
  "PMFME": "Chinna food business (oorugaai, appalam!)-kku: 35% subsidy ₹10L varai + training.",
  "PM Vishwakarma": "Kaiyinaignargalukku: guarantee illamal loan, toolkit udhavi, stipend training.",
  "Mahila Udyam Nidhi (SIDBI)": "Pen micro/small business-kku SIDBI loan — limit official site-il paar.",
  "Annapurna Scheme (SBI)": "Pen food-catering business-kku SBI loan — limit official site-il paar.",
  "Mahila Samriddhi Yojana (NSFDC)": "SC pengalukku NSFDC microfinance.",
  "New Swarnima (NBCFDC)": "Pinthangiya vaguppu pengalukku salugai rate-il loan — limit official site-il paar.",
  "Mahila Coir Yojana": "Coir velai training + stipend, Coir Board moolam.",
  "DAY-NRLM / Lakhpati Didi": "SHG pengalukku: bank loan, vatti udhavi, training — varudam ₹1L+ varuvaai ilakku.",
  "Udyam Registration": "Ilavasa MSME registration: loan, subsidy, arasu kolmuthal vaasal.",
  "CGTMSE": "Guarantee cover-aal bank adamaanam illamal loan tharum — CGTMSE cover kelu.",
  "PMJJBY": "~₹436/varudam ₹2 lakh aayul kaapeedu, bank auto-debit.",
  "PMSBY": "~₹20/varudam ₹2 lakh vippathu kaapeedu.",
  "Atal Pension Yojana": "60-kku pin ₹1,000–₹5,000 maadha pension; ippodhu chinna maadha semippu.",
  "PM Jan Dhan": "Ilavasa zero-balance kanakku + RuPay card — ella thittathukkum adippadai.",
  "Mahila Samman Savings Certificate": "Pengalukku 7.5% vaippu thittam, ₹2 lakh varai, 2 varudam, post office-il.",
  "Mahila E-Haat": "Pen productgalukku ilavasa online showcase (RMK).",
  "Rashtriya Mahila Kosh": "NGO moolam yezhai pengalukku micro-credit — Sakhi-yidam RMK loan kelu.",
  "PM SVANidhi": "Theru/tiffin virpanaikku: guarantee illamal ₹10K→₹20K→₹50K loan + digital payment cashback.",
  "Startup India Seed Fund": "DPIIT startups-kku seed support — vivaram official site-il paar.",
  "Sukanya Samriddhi": "10 vayadhukku utpatta pennukku high-interest semippu.",
  "MAVIM": "Maharashtra pen development: SHG credit + business udhavi.",
  "UMED-MSRLM": "Maharashtra graama mission: SHG bank loan + vivasayam/alladha udhavi.",
  "SHG-Bank Linkage (NABARD)": "6 maadha regular semippukku pin SHG-kku guarantee illamal bank loan.",
};

async function main() {
  const db = new PrismaClient();
  let updated = 0;
  for (const [name, gu] of Object.entries(GU)) {
    const s = await db.scheme.findFirst({ where: { name } });
    if (!s) {
      console.log("missing:", name);
      continue;
    }
    const benefits = JSON.parse(s.benefits);
    benefits.gu = gu;
    benefits.ta = TA[name] || benefits.en;
    const nameI18n = JSON.parse(s.nameI18n || "{}");
    await db.scheme.update({ where: { id: s.id }, data: { benefits: JSON.stringify(benefits), nameI18n: JSON.stringify(nameI18n) } });
    updated++;
  }
  console.log(`schemes gu/ta ok: ${updated} updated`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
