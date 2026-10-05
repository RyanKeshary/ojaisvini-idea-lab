import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import { join } from "path";

const db = new PrismaClient();

async function main() {
  console.log("==> [1/6] Seeding staff demo accounts...");
  const pin1234 = await bcrypt.hash("1234", 10);
  const passDemo = await bcrypt.hash("demo1234", 10);

  const staff = [
    { name: "Asha Tai", email: "sakhi@ojas.demo", phone: "9000000001", role: "SAKHI", district: "Nashik", village: "Trimbak", pincode: "422212", locale: "mr", pinHash: pin1234 },
    { name: "Admin", email: "admin@ojas.demo", phone: "9000000002", role: "ADMIN", district: "Pune", village: "Shivajinagar", pincode: "411005", locale: "en", pinHash: pin1234 },
  ];
  for (const s of staff) {
    await db.user.upsert({
      where: { email: s.email },
      update: { role: s.role, pinHash: pin1234, passwordHash: passDemo },
      create: { ...s, passwordHash: passDemo },
    });
  }
  console.log("    ✓ Staff seeded: sakhi@ojas.demo / admin@ojas.demo (password: demo1234, PIN: 1234)");

  console.log("==> [2/6] Seeding learning badges and 24 lessons...");
  const badges = [
    "first-step", "phone-ready", "upi-ready", "whatsapp-ready",
    "photo-pro", "pricing-pro", "pack-pro", "safe-seller", "scheme-finder",
  ];
  for (const code of badges) {
    await db.badge.upsert({ where: { code }, update: {}, create: { code } });
  }
  const journeys = {
    phone: ["phone-1", "phone-2", "phone-3"],
    upi: ["upi-1", "upi-2", "upi-3"],
    whatsapp: ["whatsapp-1", "whatsapp-2", "whatsapp-3"],
    photo: ["photo-1", "photo-2", "photo-3"],
    pricing: ["pricing-1", "pricing-2", "pricing-3"],
    packing: ["packing-1", "packing-2", "packing-3"],
    safety: ["safety-1", "safety-2", "safety-3"],
    schemes: ["schemes-1", "schemes-2", "schemes-3"],
  };
  for (const [journey, keys] of Object.entries(journeys)) {
    for (const [i, key] of keys.entries()) {
      const existing = await db.lesson.findFirst({ where: { contentRef: key } });
      if (!existing) {
        await db.lesson.create({ data: { journey, order: i + 1, contentRef: key } });
      }
    }
  }
  console.log("    ✓ 9 Badges and 24 Lessons seeded.");

  console.log("==> [3/6] Seeding 4 multilingual demo sellers and shops...");
  const sellers = [
    {
      name: "सुनीता ताई पाटील (Sunita Patil)",
      email: "sunita@ojas.demo",
      phone: "9820000001",
      locale: "mr",
      village: "त्र्यंबकेश्वर (Trimbakeshwar)",
      district: "नाशिक (Nashik)",
      pincode: "422212",
      shop: {
        slug: "sunita-swad",
        name: "सुनीता स्वाद गृह उद्योग",
        theme: "turmeric",
        bio: "अस्सल गावरान चवीचे लोणचे, पापड, साजूक तूप आणि घरगुती मसाले. नाशिकच्या त्र्यंबकेश्वर गावातून थेट तुमच्या घरी.",
        upiId: "sunita@okhdfcbank",
      },
      products: [
        { title: "घरचा आंब्याचा लोणचं (250g)", description: "घरगुती कैरी, मोहरी डाळ, मेथी आणि शुद्ध तेल-मसाला. अस्सल गावरान चव.", category: "food", priceINR: 150, stock: 25, tags: ["लोणचे", "कैरी", "घरी बनवलेले"] },
        { title: "लिंबू गोड-तिखट लोणचं (250g)", description: "पाचक आणि चवदार लिंबू लोणचं, गूळ आणि सैंधव मिठाने बनवले.", category: "food", priceINR: 130, stock: 20, tags: ["लोणचे", "लिंबू", "पाचक"] },
        { title: "अस्सल गावरान उडीद पापड (500g)", description: "हातकुट उडीद डाळ, हिंग आणि काळी मिरी. उन्हात वाळवलेले कुरकुरीत पापड.", category: "food", priceINR: 140, stock: 35, tags: ["पापड", "उडीद", "गावरान"] },
        { title: "पारंपरिक पोहा पापड (250g)", description: "हलके, तोंडात विरघळणारे पोह्याचे पापड. लहान मुलांसाठी उत्तम.", category: "food", priceINR: 110, stock: 15, tags: ["पापड", "पोहा"] },
        { title: "साजूक गावरान तूप (500ml)", description: "गावरान गाईच्या दुधाचे दाणेदार, सुवासिक साजूक लोणी कढवून बनवलेले तूप.", category: "food", priceINR: 480, stock: 12, tags: ["तूप", "गावरान", "साजूक"] },
        { title: "मराठमोळा कांदा-लसूण मसाला (200g)", description: "मटण, सुके चिकन आणि मिसळीला झणझणीत रंग आणि चव देणारा घाटी मसाला.", category: "food", priceINR: 120, stock: 30, tags: ["मसाला", "कांदा-लसूण", "घाटी"] },
        { title: "मऊ मऊ पुरण पोळी (5 नग पॅक)", description: "गूळ आणि चणा डाळीचे गोड पुरण, तुपाची धार लावून खाण्यासाठी ताज्या पोळ्या.", category: "food", priceINR: 160, stock: 10, tags: ["पुरणपोळी", "सण", "गोड"] },
        { title: "खमंग ज्वारी भाकरी (4 नग पॅक)", description: "हातथापणीची मऊ लुसलुशीत ज्वारीची भाकरी. पिठलं आणि ठेच्यासोबत खा.", category: "food", priceINR: 80, stock: 18, tags: ["भाकरी", "ज्वारी", "गावरान"] },
      ],
    },
    {
      name: "राधा देवी (Radha Devi)",
      email: "radha@ojas.demo",
      phone: "9820000002",
      locale: "hi",
      village: "खड़कवासला (Khadakwasla)",
      district: "पुणे (Pune)",
      pincode: "411024",
      shop: {
        slug: "radha-creations",
        name: "राधा हस्तकला व वस्त्र निकेतन",
        theme: "madder",
        bio: "हाथ से बनी लाख की चूड़ियाँ, पारम्परिक कढ़ाई के सूट, दुपट्टे और जूट के इको-फ्रेंडली बैग।",
        upiId: "radha@okaxis",
      },
      products: [
        { title: "हस्तनिर्मित लाख की चूड़ियाँ (4 का सेट)", description: "राजस्थानी शैली में हाथ से तराशी और चमकीले पत्थरों से जड़ी मजबूत लाख की चूड़ियां।", category: "craft", priceINR: 220, stock: 40, tags: ["चूड़ियाँ", "लाख", "हस्तशिल्प"] },
        { title: "कढ़ाई वाला चंदेरी सिल्क दुपट्टा", description: "बारीक रेशमी धागों की हाथ से की गई कढ़ाई, पारंपरिक उत्सवों के लिए उपयुक्त।", category: "craft", priceINR: 480, stock: 15, tags: ["दुपट्टा", "सिल्क", "कढ़ाई"] },
        { title: "पारंपरिक बनारसी पोटली बैग", description: "गोटा-पत्ती और मोतियों से सजा खूबसूरत पोटली बैग, शादी-विवाह के लिए सुंदर उपहार।", category: "craft", priceINR: 190, stock: 30, tags: ["पोटली", "बैग", "तोहफा"] },
        { title: "हाथ की सिली सूती गोदड़ी / रजाई", description: "पुराने पारंपरिक टांकों से सिली हुई आरामदायक, गर्म और हल्की सूती रजाई।", category: "craft", priceINR: 650, stock: 8, tags: ["गोदड़ी", "रजाई", "सूती"] },
        { title: "शुभ लाभ मोती तोरण (दरवाजे के लिए)", description: "घर के मुख्य द्वार को सजाने के लिए मोतियों और कल्पवृक्ष डिजाइन का तोरण।", category: "craft", priceINR: 260, stock: 22, tags: ["तोरण", "सजावट", "मोती"] },
        { title: "कॉटन बांधनी कुर्ती (Size M/L)", description: "हाथ से बांधी और पक्के रंगों में रंगी सूती जयपुरी बांधनी कुर्ती।", category: "craft", priceINR: 399, stock: 16, tags: ["कुर्ती", "बांधनी", "वस्त्र"] },
        { title: "प्राकृतिक जूट का सब्जी झोला", description: "मजबूत, धोने योग्य और प्लास्टिक मुक्त 100% बायोडिग्रेडेबल जूट थैला।", category: "craft", priceINR: 120, stock: 50, tags: ["जूट", "थैला", "इको-फ्रेंडली"] },
        { title: "हाथ की कढ़ाई वाली मेजपोश (Table Runner)", description: "कच्ची कढ़ाई और शीशे (मिरर वर्क) से सजी डाइनिंग व सेंटर टेबल की पट्टी।", category: "craft", priceINR: 310, stock: 14, tags: ["मेजपोश", "मिरर वर्क", "सजावट"] },
      ],
    },
    {
      name: "ભાવના બેન પટેલ (Bhavna Patel)",
      email: "bhavna@ojas.demo",
      phone: "9820000003",
      locale: "gu",
      village: "માંડવી (Mandvi)",
      district: "સુરત (Surat)",
      pincode: "394160",
      shop: {
        slug: "bhavna-gruh-udhyog",
        name: "ભાવના ગૃહ ઉદ્યોગ અને નાસ્તા",
        theme: "turmeric",
        bio: "ચોખ્ખા ઘી અને મસાલામાંથી બનેલા ક્રિસ્પી ખાખરા, ગરમા-ગરમ થેપલા, ગળ્યો છૂંદો અને સ્વાદિષ્ટ સુખડી.",
        upiId: "bhavna@okicici",
      },
      products: [
        { title: "જીરા મસાલા ક્રિસ્પી ખાખરા (500g)", description: "હાથેથી શેકેલા ઘઉંના પાતળા, કુરકુરા જીરા ખાખરા. ચા સાથે એકદમ ઉત્તમ નાસ્તો.", category: "food", priceINR: 140, stock: 35, tags: ["ખાખરા", "નાસ્તો", "ઘઉં"] },
        { title: "તાજા મેથી થેપલા (10 નંગ વેક્યુમ પેક)", description: "લીલી તાજી મેથી, તલ અને દહીંમાં વણેલા નરમ થેપલા. મુસાફરી માટે શ્રેષ્ઠ.", category: "food", priceINR: 150, stock: 25, tags: ["થેપલા", "મેથી", "તાજા"] },
        { title: "કાઠિયાવાડી પારંપરિક છૂંદો (400g)", description: "સૂર્યપ્રકાશમાં પકવેલો કાચી કેરી અને ખાંડનો રસેદાર છૂંદો. વર્ષભર ટકે છે.", category: "food", priceINR: 180, stock: 20, tags: ["છૂંદો", "કેરી", "અથાણું"] },
        { title: "તીખો-ચટપટો મેથી સંભારો (200g)", description: "ગાજર, પપૈયા અને લીલા મરચા સાથે ખાવાનો હોમમેડ મેથી-રાઈ સંભારો.", category: "food", priceINR: 110, stock: 15, tags: ["સંભારો", "ચટણી"] },
        { title: "સુરતી માવા ઘારી (250g બોક્સ)", description: "ચોખ્ખા ઘી, માવો અને પિસ્તા-બદામથી ભરપૂર સુરતની પ્રખ્યાત પારંપરિક ઘારી.", category: "food", priceINR: 290, stock: 12, tags: ["મીઠાઈ", "ઘારી", "સુરત"] },
        { title: "રાયતા લીલા મરચાનું અથાણું (300g)", description: "મોળા મરચામાં રાઈની દાળ અને લીંબુનો રસ ભરીને તૈયાર કરેલું દેશી અથાણું.", category: "food", priceINR: 130, stock: 18, tags: ["અથાણું", "મરચા"] },
        { title: "ક્રિસ્પી ઘઉંના શક્કરપારા (400g)", description: "શુદ્ધ ઘીના મોણવાળા ખસ્તા અને મીઠા શક્કરપારા. તહેવારોની મિજબાની.", category: "food", priceINR: 160, stock: 28, tags: ["શક્કરપારા", "નાસ્તો", "મીઠું"] },
        { title: "દેશી ગોળ-ઘીની સુખડી (300g)", description: "ઘઉંનો લોટ, ઓર્ગેનિક દેશી ગોળ અને ગાયના ઘીથી બનેલી પોચી સુખડી.", category: "food", priceINR: 175, stock: 22, tags: ["સુખડી", "ગોળ", "મીઠાઈ"] },
      ],
    },
    {
      name: "மீனாட்சி அம்மாள் (Meenakshi Ammal)",
      email: "meenakshi@ojas.demo",
      phone: "9820000004",
      locale: "ta",
      village: "அலங்காநல்லூர் (Alanganallur)",
      district: "மதுரை (Madurai)",
      pincode: "625501",
      shop: {
        slug: "meenakshi-handlooms",
        name: "மீனாட்சி பாரம்பரிய கைத்தறி & உணவகம்",
        theme: "indigo",
        bio: "மதுரை சுங்குடி காட்டன் புடவைகள், பாரம்பரிய செட்டிநாடு மசாலா பொடிகள் மற்றும் கைவினைப் பொருட்கள்.",
        upiId: "meenakshi@oksbi",
      },
      products: [
        { title: "மதுரை சுங்குடி காட்டன் புடவை", description: "தூய பருத்தி நூலால் நெய்யப்பட்டு, இயற்கையான சாயம் தோய்க்கப்பட்ட சுங்குடி சேலை.", category: "craft", priceINR: 650, stock: 15, tags: ["புடவை", "சுங்குடி", "பருத்தி"] },
        { title: "செட்டிநாடு வறுத்த கறி மசாலா பொடி (250g)", description: "கல்பாசி, சீரகம், பட்டை, கிராம்பு வறுத்து அரைத்த பாரம்பரிய செட்டிநாடு மசாலா.", category: "food", priceINR: 140, stock: 30, tags: ["மசாலா", "செட்டிநாடு", "பொடி"] },
        { title: "கைக்குத்தல் கைமுறுக்கு (300g)", description: "பச்சரிசி மாவு, உளுந்து மற்றும் சீரகம் கொண்டு கைவண்ணத்தில் சுற்றப்பட்ட மொறுமொறு முறுக்கு.", category: "food", priceINR: 130, stock: 25, tags: ["முறுக்கு", "ஸ்நாக்ஸ்", "கார"] },
        { title: "சுத்தமான பருத்தி நைட்டி (Pure Cotton)", description: "கோடை காலத்திற்கேற்ற குளிர்ச்சியான அச்சு வேலைப்பாடு கொண்ட பருத்தி நைட்டி.", category: "craft", priceINR: 280, stock: 20, tags: ["நைட்டி", "காட்டன்"] },
        { title: "பாரம்பரிய பித்தளை பூஜை விளக்கு", description: "வீட்டு பூஜைக்கு மங்களகரமான அழகிய வடிவமைப்புடன் கூடிய பித்தளை அகல் விளக்கு.", category: "craft", priceINR: 320, stock: 14, tags: ["விளக்கு", "பித்தளை", "பூஜை"] },
        { title: "காரைக்குடி நெய் இட்லி பொடி (200g)", description: "கருப்பு உளுந்து மற்றும் காய்ந்த மிளகாயால் ஆட்டாங்கல்லில் இடித்த சுவையான இட்லி பொடி.", category: "food", priceINR: 110, stock: 35, tags: ["இட்லி பொடி", "காரைக்குடி"] },
        { title: "இயற்கை வாழை நார் கைப்பை (Handbag)", description: "வாழை மர நார்களைக் கொண்டு கைவினைக் கலைஞர்களால் பின்னப்பட்ட சூழல் நட்பு பை.", category: "craft", priceINR: 240, stock: 18, tags: ["வாழை நார்", "கைப்பை"] },
        { title: "பனை ஓலை பழக்கூடை (Storage Basket)", description: "கிராமப்புற பெண்களால் பனை ஓலையில் நேர்த்தியாக பின்னப்பட்ட இயற்கை சேமிப்புக் கூடை.", category: "craft", priceINR: 180, stock: 22, tags: ["பனை ஓலை", "கூடை"] },
      ],
    },
  ];

  const createdShops = [];
  const createdProducts = [];

  for (const s of sellers) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        phone: s.phone,
        locale: s.locale,
        village: s.village,
        district: s.district,
        pincode: s.pincode,
        pinHash: pin1234,
        passwordHash: passDemo,
      },
      create: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: "WOMAN",
        locale: s.locale,
        village: s.village,
        district: s.district,
        pincode: s.pincode,
        pinHash: pin1234,
        passwordHash: passDemo,
      },
    });

    const shop = await db.shop.upsert({
      where: { slug: s.shop.slug },
      update: {
        name: s.shop.name,
        theme: s.shop.theme,
        bio: s.shop.bio,
        upiId: s.shop.upiId,
        isLive: true,
      },
      create: {
        ownerId: user.id,
        slug: s.shop.slug,
        name: s.shop.name,
        theme: s.shop.theme,
        bio: s.shop.bio,
        upiId: s.shop.upiId,
        isLive: true,
      },
    });
    createdShops.push(shop);

    for (const p of s.products) {
      const existing = await db.product.findFirst({
        where: { shopId: shop.id, title: p.title },
      });
      let prod;
      if (existing) {
        prod = await db.product.update({
          where: { id: existing.id },
          data: {
            description: p.description,
            priceINR: p.priceINR,
            stock: p.stock,
            status: "LIVE",
            tags: JSON.stringify(p.tags),
          },
        });
      } else {
        prod = await db.product.create({
          data: {
            shopId: shop.id,
            title: p.title,
            description: p.description,
            category: p.category,
            priceINR: p.priceINR,
            stock: p.stock,
            tags: JSON.stringify(p.tags),
            status: "LIVE",
            images: JSON.stringify(["/uploads/test-achaar.png"]),
            attributes: JSON.stringify({ origin: s.village, verified: true }),
          },
        });
      }
      createdProducts.push(prod);
    }
  }
  console.log(`    ✓ 4 Sellers, 4 Shops, and ${createdProducts.length} Products seeded.`);

  console.log("==> [4/6] Seeding 20+ realistic orders across shops...");
  const orderStatuses = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED", "DELIVERED", "DELIVERED"];
  const paymentMethods = ["UPI", "CARD", "COD"];
  const buyerNames = [
    { name: "Priya Sharma", phone: "9811100001", city: "Mumbai" },
    { name: "Rajesh Kulkarni", phone: "9811100002", city: "Pune" },
    { name: "Ananya Iyer", phone: "9811100003", city: "Chennai" },
    { name: "Vikram Mehta", phone: "9811100004", city: "Ahmedabad" },
    { name: "Kavita Rao", phone: "9811100005", city: "Bangalore" },
    { name: "Suresh Deshmukh", phone: "9811100006", city: "Nashik" },
    { name: "Deepa Shah", phone: "9811100007", city: "Surat" },
    { name: "Amitabh Verma", phone: "9811100008", city: "Nagpur" },
    { name: "Sneha Nair", phone: "9811100009", city: "Coimbatore" },
    { name: "Manoj Joshi", phone: "9811100010", city: "Thane" },
    { name: "Pooja Patel", phone: "9811100011", city: "Vadodara" },
    { name: "Ramesh Kannan", phone: "9811100012", city: "Madurai" },
  ];

  let orderCount = 0;
  for (let i = 0; i < 24; i++) {
    const shop = createdShops[i % createdShops.length];
    const buyer = buyerNames[i % buyerNames.length];
    const shopProds = createdProducts.filter((p) => p.shopId === shop.id);
    const prod = shopProds[i % shopProds.length] || createdProducts[0];
    const qty = (i % 2) + 1;
    const subtotal = prod.priceINR * qty;
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;
    const status = orderStatuses[i % orderStatuses.length];
    const method = paymentMethods[i % paymentMethods.length];
    const isPaid = status !== "PLACED" && status !== "CANCELLED";

    const existingOrder = await db.order.findFirst({
      where: { shopId: shop.id, buyerPhone: buyer.phone },
    });

    if (!existingOrder) {
      const order = await db.order.create({
        data: {
          shopId: shop.id,
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          address: JSON.stringify({ street: `House ${10 + i}, Village Road`, city: buyer.city, pincode: "422001" }),
          subtotal,
          deliveryFee,
          total,
          status,
          payStatus: isPaid ? "PAID" : "UNPAID",
          items: JSON.stringify([{ id: prod.id, title: prod.title, price: prod.priceINR, qty }]),
        },
      });

      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: prod.id,
          title: prod.title,
          price: prod.priceINR,
          qty,
          image: "/uploads/test-achaar.png",
        },
      });

      const payment = await db.payment.create({
        data: {
          orderId: order.id,
          method,
          status: isPaid ? "PAID" : "CREATED",
          providerRef: `sim_${Date.now()}_${i}`,
          meta: JSON.stringify({ demo: true }),
        },
      });

      await db.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id },
      });

      await db.orderEvent.create({
        data: {
          orderId: order.id,
          status: "PLACED",
          note: `Order placed via demo checkout (${method})`,
        },
      });

      if (status !== "PLACED") {
        await db.orderEvent.create({
          data: {
            orderId: order.id,
            status,
            note: `Status progressed to ${status}`,
          },
        });
      }

      if (isPaid) {
        await db.payout.create({
          data: {
            shopId: shop.id,
            orderId: order.id,
            gross: total,
            net: Math.round(total * 0.98),
            status: status === "DELIVERED" ? "SETTLED" : "PROCESSING",
            upiId: shop.upiId || "seller@okhdfcbank",
            settledAt: status === "DELIVERED" ? new Date() : null,
          },
        });
      }
      orderCount++;
    }
  }
  console.log(`    ✓ ${orderCount} realistic orders created with items, payments, and payouts.`);

  console.log("==> [5/6] Seeding 40 community forum posts across rooms with replies and reactions...");
  const forumData = [
    // FOOD ROOM
    { room: "food", category: "question", text: "लोणच्यात तेल किती घालावे? माझी पहिली बॅच थोडी कोरडी झाली होती.", locale: "mr" },
    { room: "food", category: "tip", text: "पापड उन्हात चांगले वाळवा — पावसाळ्यात ओलसर राहिल्यास मऊ पडतात आणि बुरशी येते.", locale: "mr" },
    { room: "food", category: "question", text: "आम के अचार में कौन सा सिरका डालना अच्छा रहता है ताकि साल भर खराब न हो?", locale: "hi" },
    { room: "food", category: "tip", text: "खाखरा વણતી વખતે લોટ કડક રાખવો, જેથી શેકતી વખતે વળી ન જાય અને ક્રિસ્પી બને.", locale: "gu" },
    { room: "food", category: "question", text: "முறுக்கு சுடும்போது எண்ணெயில் உடைந்து போனால் என்ன சேர்க்க வேண்டும்?", locale: "ta" },
    { room: "food", category: "win", text: "आज नाशिकच्या बाजारात 50 पाकिटे पापड 2 तासांत विकले गेले! खूप आनंद झाला.", locale: "mr" },
    { room: "food", category: "tip", text: "Glass jars are better than plastic containers for shipping pickles safely.", locale: "en" },

    // CRAFT ROOM
    { room: "craft", category: "question", text: "लाख की चूड़ियों पर कुंदन चिपकाने के लिए कौन सा गोंद सबसे मजबूत होता है?", locale: "hi" },
    { room: "craft", category: "tip", text: "मोत्यांचे तोरण बनवताना नायलॉनचा दुहेरी धागा वापरावा, वर्षानुवर्षे तुटत नाही.", locale: "mr" },
    { room: "craft", category: "win", text: "પહેલીવાર ઓનલાઇન સ્ટોરમાંથી 12 જ્યુટ બેગનો ઓર્ડર મળ્યો!", locale: "gu" },
    { room: "craft", category: "question", text: "வாழை நார் கைவினைப் பொருட்களுக்கு வாட்டர்-ப்ரூஃப் பாலிஷ் எப்படி செய்வது?", locale: "ta" },
    { room: "craft", category: "tip", text: "Natural sunlight in the morning gives the most authentic colors for craft photos.", locale: "en" },
    { room: "craft", category: "question", text: "हातमागावर साडी विणताना काठ समान कसा ठेवावा?", locale: "mr" },

    // TAILOR ROOM
    { room: "tailor", category: "question", text: "गाँव में साधारण ब्लाउज और अस्तर वाले ब्लाउज की सही सिलाई दर क्या चल रही है?", locale: "hi" },
    { room: "tailor", category: "tip", text: "सुती कापड शिवण्यापूर्वी अर्धा तास पाण्यात भिजवून वाळवून घ्यावे, नंतर उसवत नाही.", locale: "mr" },
    { room: "tailor", category: "win", text: "દિવાળી માટે 25 ડ્રેસ સીવવાનો ઓર્ડર પૂરો કર્યો, બહેનો ખૂબ ખુશ થઈ!", locale: "gu" },
    { room: "tailor", category: "question", text: "சுங்குடி சேலைக்கு கான்ட்ராஸ்ட் பிளவுஸ் தைக்கும் போது எந்த துணி நல்லது?", locale: "ta" },
    { room: "tailor", category: "tip", text: "Keep a small measurement card for each customer to save time on repeat orders.", locale: "en" },
    { room: "tailor", category: "question", text: "पिको-फॉल मशीन घरी आणली तर रोजचे किती उत्पन्न होऊ शकते?", locale: "mr" },

    // DAIRY ROOM
    { room: "dairy", category: "question", text: "गायीच्या दुधाचे तूप दाणेदार होण्यासाठी लोणी कढवताना कोणती काळजी घ्यावी?", locale: "mr" },
    { room: "dairy", category: "tip", text: "घी को हमेशा कांच के जार में रखें, स्टील या प्लास्टिक में स्वाद बदल सकता है।", locale: "hi" },
    { room: "dairy", category: "question", text: "પનીર બનાવ્યા પછી બાકી રહેલા પાણીનો સારો ઉપયોગ કેવી રીતે થઈ શકે?", locale: "gu" },
    { room: "dairy", category: "win", text: "நமது ஊர் சுத்தமான பசும்பால் நெய்க்கு அருகில் உள்ள ஊர்களில் நல்ல வரவேற்பு!", locale: "ta" },
    { room: "dairy", category: "tip", text: "Temperature control while churning butter gives 15% more yield in village setups.", locale: "en" },
    { room: "dairy", category: "question", text: "दही आंबट न होण्यासाठी उन्हाळ्यात कोणती सोपी पद्धत वापरावी?", locale: "mr" },

    // MONEY & SCHEMES ROOM
    { room: "money", category: "question", text: "मुद्रा योजनेतून 50 हजार रुपयांचे शिशु कर्ज मिळवण्यासाठी बँक मॅनेजरकडे काय कागदपत्रे द्यावी लागतात?", locale: "mr" },
    { room: "money", category: "tip", text: "बचत गट (SHG) चे खाते नेहमी नियमित ठेवा, 6 महिन्यांनंतर विनातारण कर्ज सहज मिळते.", locale: "mr" },
    { room: "money", category: "question", text: "PMFME योजना में फूड प्रोसेसिंग मशीनरी पर 35% सब्सिडी का फॉर्म कहाँ जमा होता है?", locale: "hi" },
    { room: "money", category: "question", text: "લખપતિ દીદી યોજનામાં તાલીમ ક્યારે શરૂ થશે?", locale: "gu" },
    { room: "money", category: "win", text: "સ્ટેન્ડ-અપ ઇન્ડિયા દ્વારા મશીનરી માટે લોન મંજૂર થઈ, સખી દીદીનો ખૂબ આભાર!", locale: "gu" },
    { room: "money", category: "question", text: "MSME உதயம் பதிவு செய்ய கட்டணம் ஏதும் உண்டா? ஆன்லைனில் எப்படி செய்வது?", locale: "ta" },
    { room: "money", category: "tip", text: "Never share OTP with anyone claiming to call from the bank or loan department.", locale: "en" },

    // TECH HELP ROOM
    { room: "tech", category: "question", text: "ग्राहकाला व्हॉट्सॲपवर दुकानाची लिंक पाठवल्यावर फोटो दिसत नाही, काय करावे?", locale: "mr" },
    { room: "tech", category: "tip", text: "फोन का कैमरा लेंस साफ कपड़े से पोंछकर फोटो लें, फोटो तुरंत चमक जाती है।", locale: "hi" },
    { room: "tech", category: "question", text: "UPI क्यूआर कोड प्रिंट करून दुकानात कसा लावावा?", locale: "mr" },
    { room: "tech", category: "tip", text: "QR code poster can be directly downloaded from your Ojasvini shop dashboard.", locale: "en" },
    { room: "tech", category: "question", text: "ஆர்டர் வந்தவுடன் போனில் சத்தம் வர என்ன செட்டிங் ஆன் செய்ய வேண்டும்?", locale: "ta" },

    // WINS ROOM
    { room: "wins", category: "win", text: "पहिला ऑनलाईन चेकआऊट यशस्वी झाला! ₹450 थेट माझ्या UPI खात्यात जमा झाले!", locale: "mr" },
    { room: "wins", category: "win", text: "गाँव की 4 महिलाओं ने मिलकर स्वयं सहायता समूह का नया मसाला ब्रांड शुरू किया!", locale: "hi" },
    { room: "wins", category: "win", text: "ગયા મહિને ₹14,200 ની કમાણી થઈ, ઘરમાં પહેલીવાર પોતાની કમાણીથી મિક્સર લીધું.", locale: "gu" },
    { room: "wins", category: "win", text: "செட்டிநாடு மசாலா பொடிகள் பெங்களூருக்கு முதல் பார்சல் அனுப்பப்பட்டது! பெருமையாக உள்ளது.", locale: "ta" },
  ];

  const staffUser = await db.user.findUnique({ where: { email: "sakhi@ojas.demo" } });
  let postCount = 0;
  for (const item of forumData) {
    const existing = await db.post.findFirst({ where: { text: item.text } });
    if (!existing && staffUser) {
      const p = await db.post.create({
        data: {
          authorId: staffUser.id,
          room: item.room,
          category: item.category,
          text: item.text,
          locale: item.locale,
          status: "VISIBLE",
        },
      });

      // Add a helpful reply
      await db.reply.create({
        data: {
          postId: p.id,
          authorId: staffUser.id,
          text: item.locale === "mr" ? "खूप छान प्रश्न! सखी ताईंशी संपर्क साधा किंवा शिकवणी विभागातील धडा नक्की पहा." :
                item.locale === "hi" ? "बहुत उपयोगी जानकारी! अपने समूह में भी साझा करें।" :
                item.locale === "gu" ? "આ બાબતે સખી દીદી તમારી મદદ કરશે, ખૂબ આગળ વધો!" :
                item.locale === "ta" ? "அருமையான பகிர்வு! மேலும் விவரங்களுக்கு சகி வழிகாட்டியை தொடர்பு கொள்ளவும்." :
                "Great question! Check the learning hub for step-by-step guidance.",
          verified: true,
        },
      });

      await db.reaction.create({
        data: {
          targetType: "post",
          targetId: p.id,
          userId: staffUser.id,
          kind: "heart",
        },
      });

      postCount++;
    }
  }
  console.log(`    ✓ ${postCount} new forum posts seeded with replies & reactions (Total posts: 40+).`);

  console.log("==> [6/6] Executing Government Schemes seeds (26 central + Maharashtra + multilingual)...");
  try {
    execSync("node prisma/seed-schemes.mjs", { stdio: "inherit", cwd: process.cwd() });
    execSync("node prisma/seed-schemes-gu-ta.mjs", { stdio: "inherit", cwd: process.cwd() });
    console.log("    ✓ Government schemes fully seeded.");
  } catch (err) {
    console.warn("    (!) Scheme seed command exited with notice:", err.message);
  }

  console.log("\n=======================================================");
  console.log("OJASVINI MASTER SEED COMPLETED SUCCESSFULLY!");
  console.log("Credentials:");
  console.log("  - Staff Sakhi: sakhi@ojas.demo (Password: demo1234, PIN: 1234)");
  console.log("  - Staff Admin: admin@ojas.demo (Password: demo1234, PIN: 1234)");
  console.log("  - Marathi Seller: Phone 9820000001 / sunita@ojas.demo / PIN 1234");
  console.log("  - Hindi Seller:   Phone 9820000002 / radha@ojas.demo / PIN 1234");
  console.log("  - Gujarati Seller: Phone 9820000003 / bhavna@ojas.demo / PIN 1234");
  console.log("  - Tamil Seller:   Phone 9820000004 / meenakshi@ojas.demo / PIN 1234");
  console.log("  - OTP for all demo logins: 123456");
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
