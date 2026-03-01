import { useEffect, useState } from "react";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://13.62.42.76:5000";

const readStorageArray = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const deadlineData = [
  { scholarship: "NSP", deadline: "30 Nov", status: "open" },
  { scholarship: "Reliance", deadline: "15 Oct", status: "closing" },
  { scholarship: "AICTE Pragati", deadline: "10 Dec", status: "open" },
  { scholarship: "State Merit 2025", deadline: "Closed", status: "closed" },
];

const translations = {
  English: {
    demoBanner: "🏆 AI for Bharat Hackathon 2026 ",
    nav: {
      home: "Home",
      eligibility: "Eligibility",
      apply: "Apply Now",
      track: "Track & History",
      assistant: "AI Assistant",
      stories: "Success Stories",
      portals: "Portals",
      faq: "FAQ",
      contact: "Contact Us",
      miracleMode: "Miracle Mode",
      lightMode: "☀️ Light Mode",
      darkMode: "🌙 Dark Mode",
    },
    hero: {
      title: "AI for Bharat",
      subtitle: "AI-powered multilingual scholarship discovery platform",
      askAi: "Ask AI",
      checkEligibility: "Check Eligibility",
    },
    homeCards: {
      recommended: "Recommended Scholarships",
      eligibilityScore: "Eligibility Score",
      readiness: "AI-evaluated readiness score",
      deadlines: "Application Deadlines",
      impact: "Impact Stats",
      stat1: "students need support",
      stat2: "unaware of opportunities",
      stat3: "scholarships discoverable",
      open: "Open",
      closing: "Closing Soon",
    },
    eligibility: {
      title: "Scholarship Eligibility Checker",
      subtitle: "Enter your profile to estimate your eligibility and approval probability.",
      percentage: "Percentage",
      annualIncome: "Annual Family Income",
      category: "Category",
      course: "Course",
      year: "Year",
      aadhaarAvailable: "Aadhaar Available",
      checkButton: "Check Eligibility",
      scoreLabel: "Eligibility Score",
      eligibleText: "✅ You are eligible for multiple scholarships.",
      notEligibleText: "⚠ You may not qualify right now. Improve profile/documents and retry.",
      applyNow: "Apply Now",
    },
    apply: {
      title: "Submit Scholarship Application",
      subtitle: "Complete all mandatory fields",
      andUpload: "and upload key documents.",
      fullName: "Full Name",
      email: "Email",
      mobile: "Mobile Number",
      aadhaar: "Aadhaar Number",
      state: "State",
      district: "District",
      institution: "Institution Name",
      income: "Annual Family Income",
      bankAccount: "Bank Account Number",
      ifsc: "IFSC Code",
      documentUpload: "Document Upload (Amazon S3 Ready)",
      dragDrop: "Drag & drop file here or browse",
      declaration: "I confirm all provided information is correct.",
      submit: "Submit Application",
      submittedTitle: "✅ Application submitted",
      submittedText: "Your details have been captured successfully. You can now explore recommendations.",
      missingPrefix: "Please complete mandatory fields:",
      declarationLabel: "Declaration",
    },
    assistant: {
      title: "AI Assistant",
      subtitle: "Amazon Bedrock-ready reasoning interface (currently connected to backend API).",
      language: "Language",
      literacy: "Literacy",
      voiceMode: "Voice interaction mode",
      askPlaceholder: "Ask about scholarships, deadlines, eligibility...",
      askButton: "Ask AI",
      thinking: "Thinking...",
      welcome: "Hi! I am JnanaNet AI. Ask me about scholarships, deadlines, or required documents.",
      noResponse: "No response from AI.",
      connectionError:
        "I couldn't connect to backend right now. Please verify EC2 backend is running and reachable.",
      prompts: [
        "Scholarships for B.Tech",
        "Government scholarships",
        "Scholarships for low-income families",
      ],
    },
    stories: {
      title: "Scholarship Success Stories",
      subtitle: "Real impact powered by accessible scholarship guidance.",
      received: "Received",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Quick answers for students applying through JnanaNet.",
      searchPlaceholder: "Search FAQ...",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Have a question? Send us a message and our team will get back to you.",
      fullName: "Full Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      success: "✅ Thanks for reaching out. We will contact you shortly.",
      invalidEmail: "Please enter a valid email address.",
      required: "Please fill all contact form fields.",
      emailUs: "Email us",
      supportHours: "Support Hours",
      supportHoursValue: "Mon - Sat, 9:00 AM to 6:00 PM",
    },
    footer: {
      brandText: "AI-powered scholarship assistance for Bharat.",
      contactTitle: "Contact Details",
      cloudTitle: "Cloud Stack",
      copyright: "© 2026 JnanaNet. All rights reserved.",
      voiceButton: "🎤 Talk to JnanaNet",
    },
  },
  Hindi: {
    demoBanner: "🏆 AI for Bharat Hackathon 2026 • मूनलाइट AI / मिरेकल मोड",
    nav: {
      home: "होम",
      eligibility: "पात्रता",
      apply: "अभी आवेदन करें",
      track: "ट्रैक और हिस्ट्री",
      assistant: "AI सहायक",
      stories: "सफलता की कहानियाँ",
      portals: "पोर्टल्स",
      faq: "प्रश्नोत्तर",
      miracleMode: "मिरेकल मोड",
      lightMode: "☀️ लाइट मोड",
      darkMode: "🌙 डार्क मोड",
    },
    hero: {
      title: "AI for Bharat",
      subtitle: "AI आधारित बहुभाषी छात्रवृत्ति खोज मंच",
      askAi: "AI से पूछें",
      checkEligibility: "पात्रता जांचें",
    },
    homeCards: {
      recommended: "सुझाई गई छात्रवृत्तियाँ",
      eligibilityScore: "पात्रता स्कोर",
      readiness: "AI आधारित तैयारी स्कोर",
      deadlines: "आवेदन अंतिम तिथियाँ",
      impact: "प्रभाव आँकड़े",
      stat1: "छात्रों को सहायता चाहिए",
      stat2: "अवसरों से अनजान",
      stat3: "छात्रवृत्तियाँ उपलब्ध",
      open: "खुला",
      closing: "जल्द बंद",
    },
    eligibility: {
      title: "छात्रवृत्ति पात्रता जांच",
      subtitle: "अपना प्रोफ़ाइल भरें और पात्रता का अनुमान प्राप्त करें।",
      percentage: "प्रतिशत",
      annualIncome: "वार्षिक पारिवारिक आय",
      category: "श्रेणी",
      course: "कोर्स",
      year: "वर्ष",
      aadhaarAvailable: "आधार उपलब्ध",
      checkButton: "पात्रता जांचें",
      scoreLabel: "पात्रता स्कोर",
      eligibleText: "✅ आप कई छात्रवृत्तियों के लिए पात्र हैं।",
      notEligibleText: "⚠ अभी आप पात्र नहीं हो सकते। प्रोफ़ाइल सुधारकर फिर प्रयास करें।",
      applyNow: "अभी आवेदन करें",
    },
    apply: {
      title: "छात्रवृत्ति आवेदन जमा करें",
      subtitle: "सभी अनिवार्य फ़ील्ड भरें",
      andUpload: "और दस्तावेज़ अपलोड करें।",
      fullName: "पूरा नाम",
      email: "ईमेल",
      mobile: "मोबाइल नंबर",
      aadhaar: "आधार नंबर",
      state: "राज्य",
      district: "ज़िला",
      institution: "संस्थान का नाम",
      income: "वार्षिक पारिवारिक आय",
      bankAccount: "बैंक खाता संख्या",
      ifsc: "IFSC कोड",
      documentUpload: "दस्तावेज़ अपलोड (Amazon S3 तैयार)",
      dragDrop: "फ़ाइल यहाँ ड्रैग करें या ब्राउज़ करें",
      declaration: "मैं पुष्टि करता/करती हूँ कि दी गई जानकारी सही है।",
      submit: "आवेदन जमा करें",
      submittedTitle: "✅ आवेदन जमा हो गया",
      submittedText: "आपकी जानकारी सफलतापूर्वक दर्ज हो गई है।",
      missingPrefix: "कृपया अनिवार्य फ़ील्ड भरें:",
      declarationLabel: "घोषणा",
    },
    assistant: {
      title: "AI सहायक",
      subtitle: "Amazon Bedrock तैयार लॉजिक इंटरफेस (वर्तमान में बैकएंड से जुड़ा)।",
      language: "भाषा",
      literacy: "साक्षरता",
      voiceMode: "वॉइस इंटरैक्शन मोड",
      askPlaceholder: "छात्रवृत्ति, अंतिम तिथि, पात्रता के बारे में पूछें...",
      askButton: "AI से पूछें",
      thinking: "सोच रहा है...",
      welcome: "नमस्ते! मैं JnanaNet AI हूँ। छात्रवृत्ति से जुड़ा कोई भी सवाल पूछें।",
      noResponse: "AI से कोई उत्तर नहीं मिला।",
      connectionError: "अभी बैकएंड से कनेक्ट नहीं हो सका। कृपया सर्वर जांचें।",
      prompts: [
        "B.Tech के लिए छात्रवृत्तियाँ",
        "सरकारी छात्रवृत्तियाँ",
        "कम आय वाले परिवारों के लिए छात्रवृत्तियाँ",
      ],
    },
    stories: {
      title: "छात्रवृत्ति सफलता की कहानियाँ",
      subtitle: "सुलभ मार्गदर्शन से वास्तविक प्रभाव।",
      received: "प्राप्त",
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      subtitle: "छात्रों के लिए त्वरित उत्तर।",
      searchPlaceholder: "FAQ खोजें...",
    },
    footer: {
      brandText: "भारत के लिए AI आधारित छात्रवृत्ति सहायता।",
      contactTitle: "संपर्क विवरण",
      cloudTitle: "क्लाउड स्टैक",
      copyright: "© 2026 JnanaNet. सर्वाधिकार सुरक्षित।",
      voiceButton: "🎤 JnanaNet से बात करें",
    },
  },
  Tamil: {
    demoBanner: "🏆 AI for Bharat Hackathon 2026 • Moonlight AI / Miracle Mode",
    nav: {
      home: "முகப்பு",
      eligibility: "தகுதி",
      apply: "இப்போது விண்ணப்பிக்க",
      track: "டிராக் & வரலாறு",
      assistant: "AI உதவியாளர்",
      stories: "வெற்றி கதைகள்",
      portals: "போர்டல்கள்",
      faq: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      miracleMode: "மிராக்கிள் மோடு",
      lightMode: "☀️ லைட் மோடு",
      darkMode: "🌙 டார்க் மோடு",
    },
    hero: {
      title: "AI for Bharat",
      subtitle: "AI மூலம் பல்மொழி கல்வியுதவி கண்டறியும் தளம்",
      askAi: "AIயிடம் கேள்",
      checkEligibility: "தகுதி பார்க்க",
    },
    homeCards: {
      recommended: "பரிந்துரைக்கப்பட்ட உதவித்தொகைகள்",
      eligibilityScore: "தகுதி மதிப்பெண்",
      readiness: "AI மதிப்பிட்ட தயார்நிலை மதிப்பெண்",
      deadlines: "விண்ணப்ப கடைசி தேதி",
      impact: "பாதிப்பு புள்ளிவிவரங்கள்",
      stat1: "மாணவர்களுக்கு உதவி தேவை",
      stat2: "வாய்ப்புகளை அறியாதோர்",
      stat3: "கிடைக்கும் உதவித்தொகைகள்",
      open: "திறந்துள்ளது",
      closing: "விரைவில் மூடும்",
    },
    eligibility: {
      title: "உதவித்தொகை தகுதி சரிபார்ப்பு",
      subtitle: "உங்கள் விவரங்களை உள்ளிட்டு தகுதியை மதிப்பிடுங்கள்.",
      percentage: "சதவீதம்",
      annualIncome: "வருடாந்திர குடும்ப வருமானம்",
      category: "பிரிவு",
      course: "பாடநெறி",
      year: "ஆண்டு",
      aadhaarAvailable: "ஆதார் உள்ளது",
      checkButton: "தகுதி சரிபார்",
      scoreLabel: "தகுதி மதிப்பெண்",
      eligibleText: "✅ பல உதவித்தொகைகளுக்கு நீங்கள் தகுதி உடையவர்.",
      notEligibleText: "⚠ இப்போது தகுதி இருக்காமல் இருக்கலாம். மீண்டும் முயற்சி செய்யவும்.",
      applyNow: "இப்போது விண்ணப்பிக்க",
    },
    apply: {
      title: "உதவித்தொகை விண்ணப்பம் சமர்ப்பிக்கவும்",
      subtitle: "அனைத்து கட்டாய புலங்களையும் நிரப்பவும்",
      andUpload: "மற்றும் ஆவணங்களை பதிவேற்றவும்.",
      fullName: "முழு பெயர்",
      email: "மின்னஞ்சல்",
      mobile: "மொபைல் எண்",
      aadhaar: "ஆதார் எண்",
      state: "மாநிலம்",
      district: "மாவட்டம்",
      institution: "கல்லூரி பெயர்",
      income: "வருடாந்திர குடும்ப வருமானம்",
      bankAccount: "வங்கி கணக்கு எண்",
      ifsc: "IFSC குறியீடு",
      documentUpload: "ஆவண பதிவேற்றம் (Amazon S3 தயாராக)",
      dragDrop: "கோப்பை இங்கே இழுத்து விடுங்கள் அல்லது தேர்வு செய்யுங்கள்",
      declaration: "கொடுக்கப்பட்ட தகவல் சரியானது என்று உறுதிப்படுத்துகிறேன்.",
      submit: "விண்ணப்பம் சமர்ப்பி",
      submittedTitle: "✅ விண்ணப்பம் சமர்ப்பிக்கப்பட்டது",
      submittedText: "உங்கள் தகவல் வெற்றிகரமாக சேமிக்கப்பட்டது.",
      missingPrefix: "கட்டாய புலங்களை நிரப்பவும்:",
      declarationLabel: "அறிவிப்பு",
    },
    assistant: {
      title: "AI உதவியாளர்",
      subtitle: "Amazon Bedrock-ready reasoning interface (currently connected to backend API).",
      language: "மொழி",
      literacy: "படிப்பறிவு",
      voiceMode: "குரல் தொடர்பு முறை",
      askPlaceholder: "உதவித்தொகை, கடைசி தேதி, தகுதி பற்றி கேளுங்கள்...",
      askButton: "AIயிடம் கேள்",
      thinking: "சிந்திக்கிறது...",
      welcome: "வணக்கம்! நான் JnanaNet AI. உதவித்தொகை பற்றிய கேள்விகளை கேளுங்கள்.",
      noResponse: "AI பதில் இல்லை.",
      connectionError: "Backend இணைப்பு இல்லை. தயவு செய்து server பார்க்கவும்.",
      prompts: [
        "B.Tech க்கான உதவித்தொகைகள்",
        "அரசு உதவித்தொகைகள்",
        "குறைந்த வருமான குடும்பங்களுக்கு உதவித்தொகைகள்",
      ],
    },
    stories: {
      title: "உதவித்தொகை வெற்றி கதைகள்",
      subtitle: "எளிய வழிகாட்டுதலால் கிடைத்த உண்மையான விளைவு.",
      received: "பெற்றார்",
    },
    faq: {
      title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      subtitle: "மாணவர்களுக்கு விரைவு பதில்கள்.",
      searchPlaceholder: "FAQ தேடுங்கள்...",
    },
    footer: {
      brandText: "இந்திய மாணவர்களுக்கு AI அடிப்படையிலான உதவித்தொகை உதவி.",
      contactTitle: "தொடர்பு விவரங்கள்",
      cloudTitle: "கிளவுட் ஸ்டாக்",
      copyright: "© 2026 JnanaNet. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      voiceButton: "🎤 JnanaNet உடன் பேசுங்கள்",
    },
  },
  Telugu: {
    demoBanner: "🏆 AI for Bharat Hackathon 2026 • Moonlight AI / Miracle Mode",
    nav: {
      home: "హోమ్",
      eligibility: "అర్హత",
      apply: "ఇప్పుడే దరఖాస్తు",
      track: "ట్రాక్ & హిస్టరీ",
      assistant: "AI సహాయకుడు",
      stories: "విజయ కథలు",
      portals: "పోర్టల్స్",
      faq: "తరచుగా అడిగే ప్రశ్నలు",
      miracleMode: "మిరాకిల్ మోడ్",
      lightMode: "☀️ లైట్ మోడ్",
      darkMode: "🌙 డార్క్ మోడ్",
    },
    hero: {
      title: "AI for Bharat",
      subtitle: "AI ఆధారిత బహుభాషా స్కాలర్‌షిప్ డిస్కవరీ ప్లాట్‌ఫారం",
      askAi: "AI ని అడుగు",
      checkEligibility: "అర్హత చూడండి",
    },
    homeCards: {
      recommended: "సిఫార్సు చేసిన స్కాలర్‌షిప్‌లు",
      eligibilityScore: "అర్హత స్కోర్",
      readiness: "AI అంచనా వేసిన సిద్ధత స్కోర్",
      deadlines: "అప్లికేషన్ గడువులు",
      impact: "ప్రభావ గణాంకాలు",
      stat1: "విద్యార్థులకు సహాయం అవసరం",
      stat2: "అవకాశాలు తెలియని విద్యార్థులు",
      stat3: "లభ్యమయ్యే స్కాలర్‌షిప్‌లు",
      open: "తెరచి ఉంది",
      closing: "త్వరలో ముగుస్తుంది",
    },
    eligibility: {
      title: "స్కాలర్‌షిప్ అర్హత తనిఖీ",
      subtitle: "మీ వివరాలు నమోదు చేసి అర్హత అంచనా పొందండి.",
      percentage: "శాతం",
      annualIncome: "వార్షిక కుటుంబ ఆదాయం",
      category: "వర్గం",
      course: "కోర్సు",
      year: "సంవత్సరం",
      aadhaarAvailable: "ఆధార్ అందుబాటులో ఉందా",
      checkButton: "అర్హత తనిఖీ",
      scoreLabel: "అర్హత స్కోర్",
      eligibleText: "✅ మీరు అనేక స్కాలర్‌షిప్‌లకు అర్హులు.",
      notEligibleText: "⚠ ప్రస్తుతం మీరు అర్హులు కాకపోవచ్చు. మళ్లీ ప్రయత్నించండి.",
      applyNow: "ఇప్పుడే దరఖాస్తు",
    },
    apply: {
      title: "స్కాలర్‌షిప్ దరఖాస్తు సమర్పణ",
      subtitle: "అన్ని తప్పనిసరి ఫీల్డ్స్ పూరించండి",
      andUpload: "మరియు పత్రాలను అప్‌లోడ్ చేయండి.",
      fullName: "పూర్తి పేరు",
      email: "ఇమెయిల్",
      mobile: "మొబైల్ నంబర్",
      aadhaar: "ఆధార్ నంబర్",
      state: "రాష్ట్రం",
      district: "జిల్లా",
      institution: "సంస్థ పేరు",
      income: "వార్షిక కుటుంబ ఆదాయం",
      bankAccount: "బ్యాంకు ఖాతా నంబర్",
      ifsc: "IFSC కోడ్",
      documentUpload: "డాక్యుమెంట్ అప్‌లోడ్ (Amazon S3 సిద్ధంగా ఉంది)",
      dragDrop: "ఫైల్‌ను ఇక్కడ డ్రాప్ చేయండి లేదా బ్రౌజ్ చేయండి",
      declaration: "ఇక్కడ ఇచ్చిన సమాచారం సరైందని నేను నిర్ధారిస్తున్నాను.",
      submit: "దరఖాస్తు సమర్పించు",
      submittedTitle: "✅ దరఖాస్తు సమర్పించబడింది",
      submittedText: "మీ వివరాలు విజయవంతంగా నమోదు అయ్యాయి.",
      missingPrefix: "దయచేసి తప్పనిసరి ఫీల్డ్స్ పూరించండి:",
      declarationLabel: "డిక్లరేషన్",
    },
    assistant: {
      title: "AI సహాయకుడు",
      subtitle: "Amazon Bedrock-ready reasoning interface (currently connected to backend API).",
      language: "భాష",
      literacy: "సాక్షరత",
      voiceMode: "వాయిస్ ఇంటరాక్షన్ మోడ్",
      askPlaceholder: "స్కాలర్‌షిప్‌లు, గడువులు, అర్హత గురించి అడగండి...",
      askButton: "AI ని అడుగు",
      thinking: "ఆలోచిస్తోంది...",
      welcome: "హాయ్! నేను JnanaNet AI. స్కాలర్‌షిప్‌ల గురించి అడగండి.",
      noResponse: "AI నుండి సమాధానం లేదు.",
      connectionError: "బ్యాక్‌ఎండ్‌కు కనెక్ట్ కాలేకపోయాను. దయచేసి సర్వర్ చూడండి.",
      prompts: [
        "B.Tech కోసం స్కాలర్‌షిప్‌లు",
        "ప్రభుత్వ స్కాలర్‌షిప్‌లు",
        "తక్కువ ఆదాయ కుటుంబాల కోసం స్కాలర్‌షిప్‌లు",
      ],
    },
    stories: {
      title: "స్కాలర్‌షిప్ విజయ కథలు",
      subtitle: "సులభమైన మార్గదర్శకతతో నిజమైన ప్రభావం.",
      received: "స్వీకరించారు",
    },
    faq: {
      title: "తరచుగా అడిగే ప్రశ్నలు",
      subtitle: "విద్యార్థుల కోసం త్వరిత సమాధానాలు.",
      searchPlaceholder: "FAQ వెతకండి...",
    },
    footer: {
      brandText: "భారత విద్యార్థుల కోసం AI ఆధారిత స్కాలర్‌షిప్ సహాయం.",
      contactTitle: "సంప్రదింపు వివరాలు",
      cloudTitle: "క్లౌడ్ స్టాక్",
      copyright: "© 2026 JnanaNet. అన్ని హక్కులు పరిరక్షించబడ్డాయి.",
      voiceButton: "🎤 JnanaNet తో మాట్లాడండి",
    },
  },
};

const recommendedScholarships = [
  {
    name: "NSP Merit Scholarship",
    organization: "National Scholarship Portal",
    funding: "Up to ₹75,000",
    maxIncome: 400000,
    minPercentage: 60,
    categories: ["SC", "ST", "OBC", "EWS", "General"],
  },
  {
    name: "Reliance Foundation Scholarship",
    organization: "Reliance Foundation",
    funding: "Up to ₹2,00,000",
    maxIncome: 600000,
    minPercentage: 65,
    categories: ["SC", "ST", "OBC", "EWS", "General"],
  },
  {
    name: "Tata Scholarship",
    organization: "Tata Trusts",
    funding: "Up to ₹1,50,000",
    maxIncome: 500000,
    minPercentage: 70,
    categories: ["SC", "ST", "OBC", "EWS", "General"],
  },
  {
    name: "Sitaram Jindal Scholarship",
    organization: "Sitaram Jindal Foundation",
    funding: "Up to ₹60,000",
    maxIncome: 450000,
    minPercentage: 55,
    categories: ["SC", "ST", "OBC", "EWS"],
  },
];

const scholarshipPortals = [
  {
    category: "Government Scholarship Portals",
    categoryIcon: "🇮🇳",
    items: [
      {
        name: "National Scholarship Portal",
        url: "https://scholarships.gov.in",
        description: "Central government scholarships for school, UG, and PG students.",
      },
      {
        name: "AICTE",
        url: "https://www.aicte-india.org",
        description: "Pragati Scholarship, Saksham Scholarship, and more.",
      },
      {
        name: "UGC",
        url: "https://ugc.ac.in",
        description: "Scholarships for university students and research fellows.",
      },
    ],
  },
  {
    category: "Private Scholarship Platforms",
    categoryIcon: "🏢",
    items: [
      {
        name: "Buddy4Study",
        url: "https://www.buddy4study.com",
        description: "One of the biggest scholarship listing platforms.",
      },
      {
        name: "Vidya Lakshmi Portal",
        url: "https://www.vidyalakshmi.co.in",
        description: "Education loan and scholarship portal.",
      },
      {
        name: "Sitaram Jindal Foundation",
        url: "https://www.sitaramjindalfoundation.org",
        description: "Scholarships for school and college students.",
      },
    ],
  },
  {
    category: "Corporate / NGO Scholarships",
    categoryIcon: "🏫",
    items: [
      {
        name: "Tata Capital Scholarship",
        url: "https://www.tatacapital.com",
        description: "Tata Capital Pankh Scholarship.",
      },
      {
        name: "HDFC Bank Scholarship",
        url: "https://www.hdfcbank.com",
        description: "HDFC Parivartan Scholarship.",
      },
      {
        name: "Reliance Foundation",
        url: "https://www.reliancefoundation.org",
        description: "Reliance Foundation Scholarships for UG/PG students.",
      },
      {
        name: "Infosys Foundation",
        url: "https://www.infosys.org",
        description: "Scholarships and education support programs.",
      },
    ],
  },
  {
    category: "International Scholarship Platforms",
    categoryIcon: "🌏",
    items: [
      {
        name: "DAAD",
        url: "https://www.daad.de",
        description: "Scholarships for studying in Germany.",
      },
      {
        name: "Fulbright Program",
        url: "https://fulbrightprogram.org",
        description: "Scholarships for studying in the USA.",
      },
    ],
  },
];

const successStories = [
  {
    name: "Rahul Kumar",
    amount: "₹1,00,000",
    scholarship: "Reliance Scholarship",
    quote: "This platform helped me find scholarships I never knew existed.",
  },
  {
    name: "Aisha Begum",
    amount: "₹75,000",
    scholarship: "National Merit Scholarship",
    quote: "JnanaNet made the process easy to understand in my language.",
  },
];

const faqData = [
  {
    question: "What is the purpose of this scholarship portal?",
    answer:
      "This portal helps students discover various government, private, and foundation scholarships in one place and redirects them to the official application websites.",
  },
  {
    question: "Can I apply for scholarships directly on this website?",
    answer:
      "No. This website provides trusted scholarship links and information. Applications are completed on the official scholarship portals.",
  },
  {
    question: "Who can use this website?",
    answer:
      "Any student looking for scholarships for school, undergraduate, postgraduate, or higher studies can use this portal.",
  },
  {
    question: "Are the scholarships listed here verified?",
    answer: "Yes. The portal only lists scholarships from trusted and official platforms.",
  },
  {
    question: "What types of scholarships are listed?",
    answer:
      "The portal includes Government scholarships, Private scholarships, Corporate scholarships, Foundation scholarships, and International scholarships.",
  },
  {
    question: "Is there any registration required to use this website?",
    answer: "No registration is required to browse scholarships.",
  },
  {
    question: "How do I apply for a scholarship?",
    answer:
      "You can click the Apply or Visit Portal button, which redirects you to the official scholarship website where you can complete the application.",
  },
  {
    question: "What documents are usually required for scholarships?",
    answer:
      "Common documents include Aadhaar Card, Income Certificate, Academic Marksheet, Bank Passbook, and Bonafide Certificate.",
  },
  {
    question: "Can I apply for multiple scholarships?",
    answer:
      "Yes. Students can apply for multiple scholarships if they meet the eligibility criteria.",
  },
  {
    question: "Are scholarships available for all courses?",
    answer:
      "Many scholarships support a wide range of courses including engineering, medicine, arts, science, and management.",
  },
  {
    question: "Do scholarships cover full tuition fees?",
    answer:
      "Some scholarships provide full funding, while others offer partial financial support.",
  },
  {
    question: "How do I check scholarship deadlines?",
    answer:
      "Each scholarship page shows the application deadline. Always check the official portal for the latest information.",
  },
  {
    question: "Are there scholarships for economically weaker students?",
    answer:
      "Yes. Many scholarships are specifically designed for students from economically weaker backgrounds.",
  },
  {
    question: "Are scholarships available for female students?",
    answer:
      "Yes. Some scholarships are specifically created to support female students in education.",
  },
  {
    question: "What is the National Scholarship Portal?",
    answer:
      "The National Scholarship Portal is a government platform that provides access to multiple central and state scholarships.",
  },
  {
    question: "Are private scholarships safe to apply for?",
    answer:
      "Yes, if they are from recognized organizations and foundations. This portal lists only trusted sources.",
  },
  {
    question: "Do scholarships require repayment?",
    answer: "No. Scholarships are financial aid and do not need to be repaid.",
  },
  {
    question: "Can school students apply for scholarships?",
    answer: "Yes. Many scholarships are available for school-level students.",
  },
  {
    question: "Are scholarships available for postgraduate students?",
    answer: "Yes. Several scholarships support postgraduate and research students.",
  },
  {
    question: "How can I find scholarships suitable for me?",
    answer:
      "Use the Scholarship Finder feature to filter scholarships based on education level, income, and category.",
  },
  {
    question: "Can international students apply for these scholarships?",
    answer:
      "Some scholarships are specifically for Indian students, while others may support international education.",
  },
  {
    question: "What should I do if my scholarship application is rejected?",
    answer:
      "You can apply for other scholarships for which you meet the eligibility criteria.",
  },
  {
    question: "How often are scholarships updated on this portal?",
    answer:
      "Scholarship information is updated regularly to include new opportunities.",
  },
  {
    question: "Can I track my scholarship application on this website?",
    answer:
      "Application tracking must be done through the official scholarship portal where you applied.",
  },
  {
    question: "How can I contact support if I need help?",
    answer:
      "You can reach out through the Contact Us page and submit your query using the contact form.",
  },
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [miracleMode, setMiracleMode] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");
  const [language, setLanguage] = useState("English");
  const t = translations[language] || translations.English;
  const contactT = t.contact || translations.English.contact;
  const [literacy, setLiteracy] = useState("Low");
  const [voiceMode, setVoiceMode] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const [eligibilityForm, setEligibilityForm] = useState({
    percentage: "",
    income: "",
    category: "OBC",
    course: "B.Tech",
    year: "1st Year",
    aadhaar: "Yes",
  });
  const [eligibilityScore, setEligibilityScore] = useState(0);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    aadhaar: "",
    state: "",
    district: "",
    institution: "",
    annualIncome: "",
    bankAccount: "",
    ifsc: "",
    declarationAccepted: false,
  });
  const [applicationError, setApplicationError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [latestApplicationId, setLatestApplicationId] = useState("");
  const [applicationHistory, setApplicationHistory] = useState(() =>
    readStorageArray("jnananet_application_history")
  );
  const [contactStatus, setContactStatus] = useState("");
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [uploads, setUploads] = useState({
    aadhaar: null,
    income: null,
    marksheet: null,
  });
  const [uploadProgress, setUploadProgress] = useState({
    aadhaar: 0,
    income: 0,
    marksheet: 0,
  });

  const [question, setQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => readStorageArray("jnananet_search_history"));
  const [trackQueryId, setTrackQueryId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: translations.English.assistant.welcome,
    },
  ]);

  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", text: t.assistant.welcome }];
      }
      return prev;
    });
  }, [language, t.assistant.welcome]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jnananet_search_history", JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jnananet_application_history", JSON.stringify(applicationHistory));
    }
  }, [applicationHistory]);

  const updateEligibilityForm = (field, value) => {
    setEligibilityForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateApplicationForm = (field, value) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateContactForm = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckEligibility = () => {
    const percentage = parseFloat(eligibilityForm.percentage || "0");
    const income = parseFloat(eligibilityForm.income || "0");
    const hasAadhaar = eligibilityForm.aadhaar === "Yes";

    let score = 0;
    if (percentage >= 60) score += 35;
    if (income > 0 && income <= 400000) score += 35;
    if (["SC", "ST", "OBC", "EWS"].includes(eligibilityForm.category)) score += 20;
    if (hasAadhaar) score += 10;

    setEligibilityScore(score);
    setEligibilityResult(score >= 65);
  };

  const mandatoryFields = [
    ["fullName", t.apply.fullName],
    ["email", t.apply.email],
    ["mobile", t.apply.mobile],
    ["aadhaar", t.apply.aadhaar],
    ["state", t.apply.state],
    ["district", t.apply.district],
    ["institution", t.apply.institution],
    ["annualIncome", t.apply.income],
  ];

  const handleSubmitApplication = () => {
    const missing = mandatoryFields
      .filter(([key]) => !String(applicationForm[key]).trim())
      .map(([, label]) => label);

    if (!applicationForm.declarationAccepted) {
      missing.push(t.apply.declarationLabel);
    }

    if (missing.length > 0) {
      setApplicationError(`${t.apply.missingPrefix} ${missing.join(", ")}`);
      setTimeout(() => setApplicationError(""), 3500);
      return;
    }

    const generatedId = `JN${Date.now().toString().slice(-8)}`;
    const applicationEntry = {
      id: generatedId,
      name: applicationForm.fullName,
      course: eligibilityForm.course,
      submittedAt: new Date().toLocaleString(),
      status: "Submitted",
    };

    setApplicationHistory((prev) => [applicationEntry, ...prev].slice(0, 30));
    setLatestApplicationId(generatedId);
    setTrackQueryId(generatedId);
    setTrackResult(applicationEntry);
    setIsSubmitted(true);
    setApplicationError("");
  };

  const simulateUpload = (type, file) => {
    if (!file) return;

    setUploads((prev) => ({ ...prev, [type]: file }));
    setUploadProgress((prev) => ({ ...prev, [type]: 5 }));

    let progress = 5;
    const timer = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
      }
      setUploadProgress((prev) => ({ ...prev, [type]: progress }));
    }, 120);
  };

  const handleDropUpload = (event, type) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    simulateUpload(type, file);
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const values = Object.values(contactForm).map((value) => String(value).trim());

    if (values.some((value) => !value)) {
      setContactStatus(contactT.required);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email.trim())) {
      setContactStatus(contactT.invalidEmail);
      return;
    }

    setContactStatus(contactT.success);
    setContactForm({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const askAssistant = async (presetQuestion) => {
    const finalQuestion = (presetQuestion ?? question).trim();
    if (!finalQuestion) return;

    const searchEntry = {
      id: Date.now(),
      question: finalQuestion,
      language,
      searchedAt: new Date().toLocaleString(),
    };
    setSearchHistory((prev) => [searchEntry, ...prev].slice(0, 40));

    setChatMessages((prev) => [...prev, { role: "user", text: finalQuestion }]);
    setQuestion("");
    setAiLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: finalQuestion,
          language,
          literacy,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();
      await typeMessage(data?.message || t.assistant.noResponse);
    } catch {
      await typeMessage(t.assistant.connectionError);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTrackApplication = () => {
    const normalizedId = trackQueryId.trim().toLowerCase();
    if (!normalizedId) {
      setTrackResult(null);
      return;
    }

    const found = applicationHistory.find((item) => item.id.toLowerCase() === normalizedId);
    setTrackResult(found || { notFound: true });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const getDaysLeft = (deadlineLabel) => {
    if (!deadlineLabel || deadlineLabel.toLowerCase() === "closed") return null;

    const today = new Date();
    let deadline = new Date(`${deadlineLabel} ${today.getFullYear()}`);
    if (Number.isNaN(deadline.getTime())) return null;

    if (deadline < today) {
      deadline = new Date(`${deadlineLabel} ${today.getFullYear() + 1}`);
    }

    const diffMs = deadline.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const getScholarshipMatchDetails = (scholarship) => {
    const income = parseFloat(eligibilityForm.income || "0");
    const percentage = parseFloat(eligibilityForm.percentage || "0");
    const category = eligibilityForm.category;

    const incomeEligible = income > 0 && income <= scholarship.maxIncome;
    const categoryEligible = scholarship.categories.includes(category);
    const academicStrong = percentage >= scholarship.minPercentage;

    const score =
      (incomeEligible ? 34 : 0) +
      (categoryEligible ? 28 : 0) +
      (academicStrong ? 38 : Math.min(38, Math.round((percentage / scholarship.minPercentage) * 38 || 0)));

    const reasons = [
      `${incomeEligible ? "✔" : "✖"} Income ${incomeEligible ? "eligible" : "above limit"}`,
      `${categoryEligible ? "✔" : "✖"} Category ${categoryEligible ? "eligible" : "not preferred"}`,
      `${academicStrong ? "✔" : "✖"} Academic score ${academicStrong ? "strong" : "below cut-off"}`,
    ];

    return { score: Math.min(100, Math.max(0, score)), reasons };
  };

  const getRecommendedScholarships = () => {
    const income = parseFloat(eligibilityForm.income || "0");
    const percentage = parseFloat(eligibilityForm.percentage || "0");
    const category = eligibilityForm.category;

    const hasProfileData = income > 0 || percentage > 0;
    if (!hasProfileData) {
      return recommendedScholarships
        .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
        .slice(0, 4);
    }

    const shortlisted = recommendedScholarships
      .filter((scholarship) => {
        const isIncomeClose = income > 0 ? income <= scholarship.maxIncome * 1.25 : true;
        const isAcademicClose = percentage > 0 ? percentage >= scholarship.minPercentage - 10 : true;
        const categoryMatch = scholarship.categories.includes(category);
        return isIncomeClose && isAcademicClose && categoryMatch;
      })
      .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
      .sort((first, second) => second.match.score - first.match.score);

    return shortlisted.length > 0
      ? shortlisted
      : recommendedScholarships
        .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
        .sort((first, second) => second.match.score - first.match.score)
        .slice(0, 3);
  };

  const typeMessage = (text) => new Promise((resolve) => {
    const messageId = `assistant-${Date.now()}`;
    setChatMessages((prev) => [...prev, { id: messageId, role: "assistant", text: "", typing: true }]);

    let index = 0;
    const intervalId = setInterval(() => {
      index += 1;
      const partialText = text.slice(0, index);

      setChatMessages((prev) => prev.map((message) => (
        message.id === messageId
          ? { ...message, text: partialText, typing: index < text.length }
          : message
      )));

      if (index >= text.length) {
        clearInterval(intervalId);
        resolve();
      }
    }, 18);
  });

  const startVoiceInput = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Voice input is not supported in this browser." },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "Tamil" ? "ta-IN" : language === "Telugu" ? "te-IN" : language === "Hindi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setQuestion(transcript);
      }
    };

    recognition.onerror = () => {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Could not capture voice input. Please try again." },
      ]);
    };

    recognition.start();
  };

  const renderHome = () => {
    const displayedScore = eligibilityScore || 87;
    const aiConfidence = Math.min(100, Math.round((displayedScore / 100) * 92 + 5));
    const scholarships = getRecommendedScholarships();
    const impactData = [
      { icon: "👨‍🎓", value: "50M+", label: t.homeCards.stat1 },
      { icon: "📉", value: "70%", label: t.homeCards.stat2 },
      { icon: "🎯", value: "100+", label: t.homeCards.stat3 },
    ];

    return (
      <>
        <section className="hero moon-hero hero-modern">
          <div className="hero-particles" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={`particle-${index}`} className="particle" />
            ))}
          </div>
          <div className="hero-overlay-orb" />
          <div className="hero-overlay-orb secondary" />

          <div className="hero-content">
            <span className="hero-badge">Moonlight AI / Miracle Mode</span>
            <h1 className="hero-title">{t.hero.title}</h1>
            <p className="hero-subtitle">{t.hero.subtitle}</p>
            <div className="ai-banner">✨ AI analyzed your profile and found {scholarships.length} matching scholarships</div>
            <div className="hero-actions">
              <button className="btn-neon" onClick={() => setActivePage("aiassistant")}>
                Ask AI Assistant
              </button>
              <button className="btn-glass" onClick={() => setActivePage("eligibility")}>
                Check Eligibility
              </button>
            </div>
          </div>
        </section>

        <section className="moon-section">
          <div className="glass notification">🔔 New scholarship added this week</div>
        </section>

        <section className="moon-section home-block">
          <div className="section-heading">
            <h2>{t.homeCards.recommended}</h2>
            <p>Top scholarships personalized for your profile.</p>
          </div>
          <div className="scholarship-grid">
            {scholarships.map(({ scholarship, match }) => (
              <article className="glass scholarship-card" key={scholarship.name}>
                <h3>{scholarship.name}</h3>
                <p>{scholarship.organization}</p>
                <div className="scholarship-bottom">
                  <span>{scholarship.funding}</span>
                  <div className="scholarship-actions">
                    <button className="apply-mini" onClick={() => setActivePage("apply")}>Apply</button>
                    <button className="explain-mini" onClick={() => askAssistant(`Explain ${scholarship.name} scholarship`)}>
                      Explain with AI
                    </button>
                  </div>
                </div>
                <p className="match-score">Match Score: {match.score}%</p>
                <ul className="match-reasons">
                  {match.reasons.map((reason) => (
                    <li key={`${scholarship.name}-${reason}`}>{reason}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="moon-section home-insight-grid">
          <article className="glass insight-card score-card">
            <h3>{t.homeCards.eligibilityScore}</h3>
            <div className="score-meter" role="img" aria-label={`${displayedScore}% eligibility score`}>
              <div className="score-ring" style={{ background: `conic-gradient(#22d3ee ${displayedScore}%, rgba(30, 41, 59, 0.35) ${displayedScore}% 100%)` }}>
                <div className="score-core">
                  <strong>{displayedScore}%</strong>
                </div>
              </div>
            </div>
            <p>{t.homeCards.readiness}</p>
            <p className="ai-confidence">AI Confidence: {aiConfidence}%</p>
          </article>

          <article className="glass insight-card">
            <h3>{t.homeCards.deadlines}</h3>
            <div className="deadline-list">
              {deadlineData.map((item) => {
                const statusText =
                  item.status === "open"
                    ? t.homeCards.open
                    : item.status === "closing"
                      ? t.homeCards.closing
                      : "Closed";

                return (
                  <div className={`deadline-item ${item.status}`} key={item.scholarship}>
                    <div>
                      <strong>{item.scholarship}</strong>
                      <p>{item.deadline}</p>
                      {item.status !== "closed" && (
                        <p className="deadline-count">{getDaysLeft(item.deadline)} days left</p>
                      )}
                    </div>
                    <span className={`status-pill ${item.status}`}>{statusText}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="moon-section home-block">
          <div className="section-heading">
            <h2>{t.homeCards.impact}</h2>
            <p>Real numbers showing why this platform matters.</p>
          </div>
          <div className="impact-grid">
            {impactData.map((item) => (
              <article className="glass impact-card" key={item.value}>
                <span className="impact-icon">{item.icon}</span>
                <h3>{item.value}</h3>
                <p>{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="moon-section home-block">
          <div className="section-heading">
            <h2>How It Works</h2>
            <p>From question to scholarship discovery in three AI-guided steps.</p>
          </div>
          <div className="how-grid">
            <article className="glass how-card">
              <span>1</span>
              <h3>Ask AI</h3>
              <p>Share your course, income range, and goals in your preferred language.</p>
            </article>
            <article className="glass how-card">
              <span>2</span>
              <h3>AI analyzes eligibility</h3>
              <p>JnanaNet evaluates profile readiness and checks scholarship fit instantly.</p>
            </article>
            <article className="glass how-card">
              <span>3</span>
              <h3>Discover scholarships instantly</h3>
              <p>Get prioritized opportunities and continue directly to application flow.</p>
            </article>
          </div>
        </section>

        <section className="moon-section home-block">
          <div className="section-heading">
            <h2>AI Assistant Preview</h2>
            <p>Multilingual assistant designed for students and first-time applicants.</p>
          </div>
          <div className="glass assistant-preview">
            <div className="preview-chat">
              <div className="bubble assistant">Hi! Ask me which scholarships match your profile.</div>
              <div className="bubble user">I am a B.Tech student from a low-income family.</div>
              <div className="bubble assistant">Great! I can suggest government and private scholarships for you.</div>
            </div>
            <div className="preview-prompts">
              {[
                "Scholarships for B.Tech students",
                "Government scholarships",
                "Scholarships for low income families",
              ].map((prompt) => (
                <button key={prompt} className="chip" onClick={() => setActivePage("aiassistant")}>
                  {prompt}
                </button>
              ))}
            </div>
            <button className="btn-neon" onClick={() => setActivePage("aiassistant")}>
              Open AI Assistant
            </button>
          </div>
        </section>
      </>
    );
  };

  const renderEligibility = () => (
    <section className="moon-section">
      <div className="glass form-shell">
        <h2>{t.eligibility.title}</h2>
        <p>{t.eligibility.subtitle}</p>

        <div className="field-grid">
          <label>
            {t.eligibility.percentage}
            <input
              type="number"
              value={eligibilityForm.percentage}
              onChange={(e) => updateEligibilityForm("percentage", e.target.value)}
            />
          </label>
          <label>
            {t.eligibility.annualIncome}
            <input
              type="number"
              value={eligibilityForm.income}
              onChange={(e) => updateEligibilityForm("income", e.target.value)}
            />
          </label>
          <label>
            {t.eligibility.category}
            <select
              value={eligibilityForm.category}
              onChange={(e) => updateEligibilityForm("category", e.target.value)}
            >
              <option>OBC</option>
              <option>SC</option>
              <option>ST</option>
              <option>EWS</option>
              <option>General</option>
            </select>
          </label>
          <label>
            {t.eligibility.course}
            <select
              value={eligibilityForm.course}
              onChange={(e) => updateEligibilityForm("course", e.target.value)}
            >
              <option>B.Tech</option>
              <option>B.Sc</option>
              <option>B.Com</option>
              <option>MBBS</option>
              <option>M.Tech</option>
            </select>
          </label>
          <label>
            {t.eligibility.year}
            <select value={eligibilityForm.year} onChange={(e) => updateEligibilityForm("year", e.target.value)}>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </label>
          <label>
            {t.eligibility.aadhaarAvailable}
            <select
              value={eligibilityForm.aadhaar}
              onChange={(e) => updateEligibilityForm("aadhaar", e.target.value)}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
        </div>

        <button className="btn-neon" onClick={handleCheckEligibility}>
          {t.eligibility.checkButton}
        </button>

        {eligibilityResult !== null && (
          <div className={`result-box ${eligibilityResult ? "ok" : "warn"}`}>
            <h4>{t.eligibility.scoreLabel}: {eligibilityScore}%</h4>
            <p>
              {eligibilityResult
                ? t.eligibility.eligibleText
                : t.eligibility.notEligibleText}
            </p>
            {eligibilityResult && (
              <button className="btn-glass" onClick={() => setActivePage("apply")}>{t.eligibility.applyNow}</button>
            )}
          </div>
        )}
      </div>
    </section>
  );

  const renderApply = () => (
    <section className="moon-section">
      <div className="glass form-shell">
        <h2>{t.apply.title}</h2>
        <p>
          {t.apply.subtitle} <span className="mandatory">*</span> {t.apply.andUpload}
        </p>

        <div className="field-grid">
          <label>
            {t.apply.fullName} <span className="mandatory">*</span>
            <input
              type="text"
              value={applicationForm.fullName}
              onChange={(e) => updateApplicationForm("fullName", e.target.value)}
            />
          </label>
          <label>
            {t.apply.email} <span className="mandatory">*</span>
            <input
              type="email"
              value={applicationForm.email}
              onChange={(e) => updateApplicationForm("email", e.target.value)}
            />
          </label>
          <label>
            {t.apply.mobile} <span className="mandatory">*</span>
            <input
              type="tel"
              value={applicationForm.mobile}
              onChange={(e) => updateApplicationForm("mobile", e.target.value)}
            />
          </label>
          <label>
            {t.apply.aadhaar} <span className="mandatory">*</span>
            <input
              type="text"
              value={applicationForm.aadhaar}
              onChange={(e) => updateApplicationForm("aadhaar", e.target.value)}
            />
          </label>
          <label>
            {t.apply.state} <span className="mandatory">*</span>
            <input
              type="text"
              value={applicationForm.state}
              onChange={(e) => updateApplicationForm("state", e.target.value)}
            />
          </label>
          <label>
            {t.apply.district} <span className="mandatory">*</span>
            <input
              type="text"
              value={applicationForm.district}
              onChange={(e) => updateApplicationForm("district", e.target.value)}
            />
          </label>
          <label>
            {t.apply.institution} <span className="mandatory">*</span>
            <input
              type="text"
              value={applicationForm.institution}
              onChange={(e) => updateApplicationForm("institution", e.target.value)}
            />
          </label>
          <label>
            {t.apply.income} <span className="mandatory">*</span>
            <input
              type="number"
              value={applicationForm.annualIncome}
              onChange={(e) => updateApplicationForm("annualIncome", e.target.value)}
            />
          </label>
          <label>
            {t.apply.bankAccount}
            <input
              type="text"
              value={applicationForm.bankAccount}
              onChange={(e) => updateApplicationForm("bankAccount", e.target.value)}
            />
          </label>
          <label>
            {t.apply.ifsc}
            <input
              type="text"
              value={applicationForm.ifsc}
              onChange={(e) => updateApplicationForm("ifsc", e.target.value.toUpperCase())}
            />
          </label>
        </div>

        <h3>{t.apply.documentUpload}</h3>
        <div className="upload-grid">
          {["aadhaar", "income", "marksheet"].map((type) => (
            <div
              key={type}
              className="upload-card"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropUpload(e, type)}
            >
              <h4>{type === "aadhaar" ? t.apply.aadhaar : type === "income" ? "Income Certificate" : "Marksheet"}</h4>
              <p>{t.apply.dragDrop}</p>
              <input
                type="file"
                onChange={(e) => simulateUpload(type, e.target.files?.[0])}
                accept="application/pdf,image/*"
              />
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadProgress[type]}%` }} />
              </div>
              {uploads[type] && <span className="upload-status">✅ {uploads[type].name}</span>}
            </div>
          ))}
        </div>

        <label className="declaration-row">
          <input
            type="checkbox"
            checked={applicationForm.declarationAccepted}
            onChange={(e) => updateApplicationForm("declarationAccepted", e.target.checked)}
          />
          {t.apply.declaration} <span className="mandatory">*</span>
        </label>

        {applicationError && <p className="error-msg">⚠ {applicationError}</p>}

        <button className="btn-neon" onClick={handleSubmitApplication}>
          {t.apply.submit}
        </button>

        {isSubmitted && (
          <div className="result-box ok">
            <h4>{t.apply.submittedTitle}</h4>
            <p>{t.apply.submittedText}</p>
            {latestApplicationId && <p><strong>Application ID:</strong> {latestApplicationId}</p>}
            <button className="btn-glass" onClick={() => setActivePage("track")}>Go to Track & History</button>
          </div>
        )}
      </div>
    </section>
  );

  const renderAiAssistant = () => (
    <section className="moon-section">
      <div className="glass assistant-shell">
        <div className="assistant-header">
          <h2>{t.assistant.title}</h2>
          <p>{t.assistant.subtitle}</p>
        </div>

        <div className="assistant-controls">
          <label>
            {t.assistant.language}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Tamil</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
          </label>
          <label>
            {t.assistant.literacy}
            <select value={literacy} onChange={(e) => setLiteracy(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
          <label className="voice-check">
            <input type="checkbox" checked={voiceMode} onChange={() => setVoiceMode(!voiceMode)} />
            {t.assistant.voiceMode}
          </label>
        </div>

        <div className="suggestion-row">
          {t.assistant.prompts.map((prompt) => (
            <button key={prompt} className="chip" onClick={() => askAssistant(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-panel">
          {chatMessages.map((message, index) => (
            <div key={message.id || `${message.role}-${index}`} className={`bubble ${message.role} ${message.typing ? "typing-msg" : ""}`}>
              {message.text}
            </div>
          ))}

          {aiLoading && (
            <div className="ai-loading">
              <div className="loading-bar" />
              <div className="loading-bar" />
            </div>
          )}
        </div>

        <div className="ask-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                askAssistant();
              }
            }}
            placeholder={t.assistant.askPlaceholder}
          />
          <button className="btn-neon" onClick={() => askAssistant()} disabled={aiLoading}>
            {aiLoading ? t.assistant.thinking : t.assistant.askButton}
          </button>
          <button className="btn-glass speak-btn" onClick={startVoiceInput} type="button">🎤 Speak</button>
        </div>
      </div>
    </section>
  );

  const renderSuccessStories = () => (
    <section className="moon-section">
      <div className="glass stories-shell">
        <h2>{t.stories.title}</h2>
        <p>{t.stories.subtitle}</p>

        <div className="stories-grid">
          {successStories.map((story) => (
            <article className="story-glass" key={story.name}>
              <h3>🎓 {story.name}</h3>
              <p>
                {t.stories.received} <strong>{story.amount}</strong> {story.scholarship}
              </p>
              <blockquote>“{story.quote}”</blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderPortals = () => (
    <section className="moon-section">
      <div className="glass stories-shell portals-shell">
        <h2>Scholarship Portals Directory</h2>
        <p>Verified government, private, NGO, and international scholarship websites.</p>

        <div className="portal-groups">
          {scholarshipPortals.map((group) => (
            <article className="glass portal-group-card" key={group.category}>
              <h3>
                <span>{group.categoryIcon}</span> {group.category}
              </h3>
              <div className="portal-list">
                {group.items.map((portal) => (
                  <div className="portal-item" key={portal.name}>
                    <div>
                      <h4>{portal.name}</h4>
                      <p>{portal.description}</p>
                    </div>
                    <a href={portal.url} target="_blank" rel="noreferrer" className="portal-link">
                      Visit Portal
                    </a>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFaq = () => {
    const filteredFaq = faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );
    const smartFaq = faqSearch.trim()
      ? faqData.find(
        (item) =>
          item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
          faqSearch.toLowerCase().includes(item.question.toLowerCase())
      )
      : null;

    return (
      <section className="moon-section">
        <div className="glass stories-shell faq-shell">
          <h2>{t.faq.title}</h2>
          <p>{t.faq.subtitle}</p>

          <div className="faq-search-wrap">
            <input
              type="text"
              placeholder={t.faq.searchPlaceholder}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>

          {faqSearch.trim() && (
            <div className="smart-faq">
              <h4>AI Smart FAQ</h4>
              {smartFaq ? (
                <p>{smartFaq.answer}</p>
              ) : (
                <div className="smart-faq-row">
                  <p>No direct FAQ match. Ask AI assistant for a custom answer.</p>
                  <button
                    className="btn-neon"
                    onClick={() => {
                      askAssistant(faqSearch);
                      setActivePage("aiassistant");
                    }}
                  >
                    Ask AI
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="faq-list">
            {filteredFaq.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div className="faq-item" key={item.question}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <p className="faq-answer">{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderContact = () => (
    <section className="moon-section">
      <div className="glass stories-shell contact-shell">
        <h2>{contactT.title}</h2>
        <p>{contactT.subtitle}</p>

        <div className="contact-grid">
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <label>
              {contactT.fullName}
              <input
                type="text"
                value={contactForm.fullName}
                onChange={(e) => updateContactForm("fullName", e.target.value)}
              />
            </label>
            <label>
              {contactT.email}
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => updateContactForm("email", e.target.value)}
              />
            </label>
            <label>
              {contactT.subject}
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) => updateContactForm("subject", e.target.value)}
              />
            </label>
            <label>
              {contactT.message}
              <textarea
                rows="5"
                value={contactForm.message}
                onChange={(e) => updateContactForm("message", e.target.value)}
              />
            </label>
            <button className="btn-neon" type="submit">
              {contactT.send}
            </button>
            {contactStatus && (
              <p className={contactStatus.startsWith("✅") ? "contact-status ok" : "contact-status"}>
                {contactStatus}
              </p>
            )}
          </form>

          <aside className="contact-info-card">
            <h3>{contactT.emailUs}</h3>
            <p>jnananet.team@gmail.com</p>
            <p>support@jnananet.com</p>
            <h3>{contactT.supportHours}</h3>
            <p>{contactT.supportHoursValue}</p>
          </aside>
        </div>
      </div>
    </section>
  );

  const renderTrackHistory = () => (
    <section className="moon-section">
      <div className="glass stories-shell track-shell">
        <h2>Track Application & Search History</h2>
        <p>Track submitted applications and view all scholarship searches made through AI assistant.</p>

        <div className="track-grid">
          <article className="track-card">
            <h3>Application Tracker</h3>
            <p>Enter application ID to check your current status.</p>

            <div className="track-controls">
              <input
                type="text"
                value={trackQueryId}
                onChange={(e) => setTrackQueryId(e.target.value.toUpperCase())}
                placeholder="Enter Application ID (e.g. JN12345678)"
              />
              <button className="btn-neon" onClick={handleTrackApplication}>Track</button>
            </div>

            {trackResult?.notFound && <p className="error-msg">No application found for this ID.</p>}

            {trackResult && !trackResult.notFound && (
              <div className="track-result">
                <p><strong>ID:</strong> {trackResult.id}</p>
                <p><strong>Name:</strong> {trackResult.name}</p>
                <p><strong>Course:</strong> {trackResult.course}</p>
                <p><strong>Status:</strong> <span className="status-pill open">{trackResult.status}</span></p>
                <p><strong>Submitted:</strong> {trackResult.submittedAt}</p>
              </div>
            )}

            <div className="history-list">
              <h4>Recent Applications</h4>
              {applicationHistory.length === 0 && <p>No applications submitted yet.</p>}
              {applicationHistory.map((item) => (
                <div className="history-item" key={item.id}>
                  <span>{item.id}</span>
                  <span>{item.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="track-card">
            <div className="track-header-row">
              <h3>Search History</h3>
              <button className="btn-glass" onClick={clearSearchHistory}>Clear</button>
            </div>
            <p>Shows previous AI scholarship questions searched in this browser.</p>

            <div className="history-list search">
              {searchHistory.length === 0 && <p>No AI searches yet.</p>}
              {searchHistory.map((item) => (
                <div className="search-item" key={item.id}>
                  <p>{item.question}</p>
                  <small>{item.language} • {item.searchedAt}</small>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );

  return (
    <div className={`app-shell ${themeMode} ${miracleMode ? "miracle" : ""}`}>
      <div className="starfield" />
      <div className="demo-banner">{t.demoBanner}</div>

      <nav className="top-nav glass">
        <div className="brand">JnanaNet</div>
        <div className="nav-links">
          <button className={`nav-btn ${activePage === "home" ? "active" : ""}`} onClick={() => setActivePage("home")}>{t.nav.home}</button>
          <button className={`nav-btn ${activePage === "eligibility" ? "active" : ""}`} onClick={() => setActivePage("eligibility")}>{t.nav.eligibility}</button>
          <button className={`nav-btn ${activePage === "apply" ? "active" : ""}`} onClick={() => setActivePage("apply")}>{t.nav.apply}</button>
          <button className={`nav-btn ${activePage === "track" ? "active" : ""}`} onClick={() => setActivePage("track")}>{t.nav.track || "Track & History"}</button>
          <button className={`nav-btn ${activePage === "aiassistant" ? "active" : ""}`} onClick={() => setActivePage("aiassistant")}>{t.nav.assistant}</button>
          <button className={`nav-btn ${activePage === "stories" ? "active" : ""}`} onClick={() => setActivePage("stories")}>{t.nav.stories}</button>
          <button className={`nav-btn ${activePage === "portals" ? "active" : ""}`} onClick={() => setActivePage("portals")}>{t.nav.portals || "Portals"}</button>
          <button className={`nav-btn ${activePage === "faq" ? "active" : ""}`} onClick={() => setActivePage("faq")}>{t.nav.faq}</button>
          <button className={`nav-btn ${activePage === "contact" ? "active" : ""}`} onClick={() => setActivePage("contact")}>{t.nav.contact || "Contact Us"}</button>
        </div>
        <div className="nav-actions">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option>English</option>
            <option>Tamil</option>
            <option>Telugu</option>
            <option>Hindi</option>
          </select>
          <button
            className="theme-toggle"
            onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
          >
            {themeMode === "dark" ? t.nav.lightMode : t.nav.darkMode}
          </button>
          <label className="miracle-toggle">
            {t.nav.miracleMode}
            <input
              type="checkbox"
              checked={miracleMode}
              onChange={() => setMiracleMode(!miracleMode)}
            />
          </label>
        </div>
      </nav>

      {activePage === "home" && renderHome()}
      {activePage === "eligibility" && renderEligibility()}
      {activePage === "apply" && renderApply()}
      {activePage === "track" && renderTrackHistory()}
      {activePage === "aiassistant" && renderAiAssistant()}
      {activePage === "stories" && renderSuccessStories()}
      {activePage === "portals" && renderPortals()}
      {activePage === "faq" && renderFaq()}
      {activePage === "contact" && renderContact()}

      <button className="voice-float" onClick={() => setActivePage("aiassistant")}>{t.footer.voiceButton}</button>

      <footer className="footer glass">
        <div className="footer-grid">
          <div>
            <h4>JnanaNet</h4>
            <p>{t.footer.brandText}</p>
          </div>
          <div>
            <h4>{t.footer.contactTitle}</h4>
            <p>Email: jnananet.team@gmail.com</p>
            <p>Support: support@jnananet.com</p>
            <p>Location: India</p>
          </div>
          <div>
            <h4>{t.footer.cloudTitle}</h4>
            <p>AI Engine: Amazon Bedrock</p>
            <p>Storage: Amazon S3</p>
            <p>Compute: Amazon EC2</p>
          </div>
        </div>
        <p className="copyright">{t.footer.copyright}</p>
      </footer>
    </div>
  );
}

export default App;
