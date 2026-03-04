import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import ScholarshipDetails from "./ScholarshipDetails";

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

const STUDENT_PROFILE_KEY = "jnananet_student_profile";

const defaultStudentProfile = {
  fullName: "",
  email: "",
  course: "",
  collegeName: "",
  familyIncome: "",
  state: "",
  district: "",
  category: "General",
  profilePhoto: "",
};

// State -> district lookup used by dependent dropdowns in profile and application forms.
const stateDistricts = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "Guntur", "Krishna", "Nellore"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi"],
};

const availableStates = Object.keys(stateDistricts);

const defaultScholarshipFilters = {
  course: "",
  incomeRange: "",
  state: "",
  category: "",
  amount: "",
  deadlineDays: "",
};

const scholarshipFallbackStates = {
  1: "Tamil Nadu",
  2: "Andhra Pradesh",
  3: "Karnataka",
  4: "Tamil Nadu",
};

const beneficiaryCategories = ["General", "OBC", "SC", "ST"];

const parseScholarshipAmount = (amountLabel) => {
  const numeric = Number.parseInt(String(amountLabel || "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : 0;
};

const parseIncomeLimitFromQuery = (query) => {
  const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|l|k|thousand)?/i);
  if (!amountMatch) return null;

  const value = Number.parseFloat(amountMatch[1]);
  if (!Number.isFinite(value)) return null;

  const unit = String(amountMatch[2] || "").toLowerCase();
  if (["lakh", "lac", "l"].includes(unit)) return Math.round(value * 100000);
  if (["k", "thousand"].includes(unit)) return Math.round(value * 1000);
  return Math.round(value);
};

const getScholarshipState = (scholarship) => {
  if (scholarship?.state && availableStates.includes(scholarship.state)) {
    return scholarship.state;
  }
  if (scholarship?.state) {
    const normalized = normalizeDetectedState(scholarship.state);
    if (normalized) return normalized;
  }
  return scholarshipFallbackStates[scholarship?.id] || "All India";
};

const getScholarshipCategory = (scholarship) => {
  return beneficiaryCategories.includes(scholarship?.category) ? scholarship.category : "General";
};

const normalizeDetectedState = (rawState = "") => {
  const cleaned = String(rawState).trim();
  if (!cleaned) return "";

  const normalizedByExact = availableStates.find(
    (state) => state.toLowerCase() === cleaned.toLowerCase()
  );
  if (normalizedByExact) return normalizedByExact;

  const normalizedByIncludes = availableStates.find(
    (state) => cleaned.toLowerCase().includes(state.toLowerCase()) || state.toLowerCase().includes(cleaned.toLowerCase())
  );
  return normalizedByIncludes || "";
};

const readStudentProfile = () => {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STUDENT_PROFILE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCourse = (value = "") => String(value).trim().toLowerCase();

const calculateEligibilityScoreFromProfile = (
  { course, percentage, income, category, hasAadhaar },
  scholarships = []
) => {
  const normalizedCourse = normalizeCourse(course);
  const safePercentage = Math.min(100, Math.max(0, toNumber(percentage)));
  const safeIncome = Math.max(0, toNumber(income));
  const categoryLabel = String(category || "General").toUpperCase();

  const academicScore = Math.round((safePercentage / 100) * 35);

  let incomeScore = 8;
  if (safeIncome > 0 && safeIncome <= 250000) {
    incomeScore = 30;
  } else if (safeIncome > 250000 && safeIncome <= 500000) {
    incomeScore = 24;
  } else if (safeIncome > 500000 && safeIncome <= 800000) {
    incomeScore = 16;
  }

  const categoryScore =
    categoryLabel === "SC" || categoryLabel === "ST"
      ? 10
      : ["OBC", "EWS"].includes(categoryLabel)
        ? 8
        : 5;

  const aadhaarScore = hasAadhaar ? 5 : 0;

  const eligibleCount = scholarships.reduce((count, scholarship) => {
    const scholarshipCourse = normalizeCourse(scholarship?.course || "any");
    const courseMatch =
      !normalizedCourse
      || scholarshipCourse === "any"
      || scholarshipCourse.includes(normalizedCourse)
      || normalizedCourse.includes(scholarshipCourse);
    const marksMatch = safePercentage > 0 ? safePercentage >= Number(scholarship?.minMarks || 0) : true;
    const incomeMatch = safeIncome > 0 ? safeIncome <= Number(scholarship?.maxIncome || Number.MAX_SAFE_INTEGER) : true;

    return courseMatch && marksMatch && incomeMatch ? count + 1 : count;
  }, 0);

  const criteriaScore = scholarships.length > 0
    ? Math.round((eligibleCount / scholarships.length) * 20)
    : 0;

  const totalScore = academicScore + incomeScore + categoryScore + aadhaarScore + criteriaScore;
  return Math.max(0, Math.min(100, totalScore));
};

const AUTH_TYPING_TEXT = "Discover scholarships using AI";

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
      title: "Find Scholarships Instantly with AI",
      subtitle: "JnanaNet helps students discover government and private scholarships using multilingual AI.",
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
      title: "Find Scholarships Instantly with AI",
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
      title: "Find Scholarships Instantly with AI",
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
      title: "Find Scholarships Instantly with AI",
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

const fallbackScholarships = [
  {
    id: 1,
    name: "NSP Merit Scholarship",
    provider: "National Scholarship Portal",
    amount: "₹50,000 per year",
    course: "B.Tech",
    minMarks: 60,
    maxIncome: 400000,
    deadline: "30 November",
    documents: ["Aadhaar", "Income Certificate", "Marksheet", "Bank Passbook"],
    description: "Government scholarship for meritorious students pursuing higher education.",
    officialLink: "https://scholarships.gov.in",
  },
  {
    id: 2,
    name: "AICTE Pragati Scholarship",
    provider: "AICTE",
    amount: "₹50,000 per year",
    course: "B.Tech",
    minMarks: 60,
    maxIncome: 800000,
    deadline: "15 October",
    documents: ["Aadhaar", "Income Certificate", "Admission Proof"],
    description: "Scholarship for girls pursuing technical education.",
    officialLink: "https://www.aicte-india.org",
  },
  {
    id: 3,
    name: "Reliance Foundation Scholarship",
    provider: "Reliance Foundation",
    amount: "₹2,00,000",
    course: "Engineering",
    minMarks: 65,
    maxIncome: 600000,
    deadline: "15 October",
    documents: ["Marksheet", "Income Proof", "Essay"],
    description: "Scholarship supporting meritorious engineering students.",
    officialLink: "https://www.reliancefoundation.org",
  },
  {
    id: 4,
    name: "Tata Scholarship",
    provider: "Tata Trusts",
    amount: "₹1,00,000",
    course: "Engineering",
    minMarks: 70,
    maxIncome: 500000,
    deadline: "20 November",
    documents: ["Marksheet", "Income Certificate"],
    description: "Financial support for deserving students in higher education.",
    officialLink: "https://www.tatatrusts.org",
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

const buildLocalizedFaq = (localizedEntries) =>
  faqData.map((item, index) => localizedEntries[index] || item);

const faqDataByLanguage = {
  en: faqData,
  hi: buildLocalizedFaq([
    {
      question: "इस स्कॉलरशिप पोर्टल का उद्देश्य क्या है?",
      answer: "यह पोर्टल छात्रों को सरकारी, निजी और फाउंडेशन स्कॉलरशिप खोजने और आधिकारिक वेबसाइट तक पहुँचने में मदद करता है।",
    },
    {
      question: "क्या मैं इस वेबसाइट पर सीधे आवेदन कर सकता/सकती हूँ?",
      answer: "नहीं। आवेदन आधिकारिक पोर्टल पर किया जाता है; यहाँ भरोसेमंद जानकारी और लिंक मिलते हैं।",
    },
    {
      question: "इस वेबसाइट का उपयोग कौन कर सकता है?",
      answer: "स्कॉलरशिप खोजने वाला कोई भी छात्र इस पोर्टल का उपयोग कर सकता है।",
    },
  ]),
  ta: buildLocalizedFaq([
    {
      question: "இந்த கல்வியுதவி தளத்தின் நோக்கம் என்ன?",
      answer: "இந்த தளம் மாணவர்கள் கல்வியுதவிகளை கண்டுபிடித்து அதிகாரப்பூர்வ தளத்திற்குச் செல்ல உதவுகிறது.",
    },
    {
      question: "இந்த இணையதளத்தில் நேரடியாக விண்ணப்பிக்க முடியுமா?",
      answer: "இல்லை. விண்ணப்பம் அதிகாரப்பூர்வ தளத்தில் செய்ய வேண்டும்; இங்கு தகவல் மற்றும் இணைப்புகள் வழங்கப்படுகின்றன.",
    },
    {
      question: "இந்த தளத்தை யார் பயன்படுத்தலாம்?",
      answer: "கல்வியுதவி தேடும் எந்த மாணவரும் பயன்படுத்தலாம்.",
    },
  ]),
  te: buildLocalizedFaq([
    {
      question: "ఈ స్కాలర్‌షిప్ పోర్టల్ లక్ష్యం ఏమిటి?",
      answer: "ఈ పోర్టల్ విద్యార్థులు స్కాలర్‌షిప్‌లను కనుగొని అధికారిక దరఖాస్తు వెబ్‌సైట్‌కు వెళ్లేందుకు సహాయం చేస్తుంది.",
    },
    {
      question: "ఈ వెబ్‌సైట్‌లోనే నేరుగా దరఖాస్తు చేయవచ్చా?",
      answer: "లేదు. ఇక్కడ విశ్వసనీయ సమాచారం మరియు లింకులు ఉంటాయి; దరఖాస్తు అధికారిక పోర్టల్‌లో చేయాలి.",
    },
    {
      question: "ఈ వెబ్‌సైట్‌ను ఎవరు ఉపయోగించవచ్చు?",
      answer: "స్కాలర్‌షిప్‌ల కోసం వెతుకుతున్న ఏ విద్యార్థైనా ఈ పోర్టల్‌ను ఉపయోగించవచ్చు.",
    },
  ]),
};

const faqLanguageMap = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [miracleMode] = useState(true);
  const [themeMode, setThemeMode] = useState("dark");
  const [language, setLanguage] = useState("English");
  const t = translations[language] || translations.English;
  const contactT = t.contact || translations.English.contact;
  const [literacy, setLiteracy] = useState("Low");
  const [voiceMode, setVoiceMode] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedApplyScholarship, setSelectedApplyScholarship] = useState(null);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

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
  const [scholarshipCatalog, setScholarshipCatalog] = useState([]);
  const [isScholarshipLoading, setIsScholarshipLoading] = useState(false);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(null);
  const [eligibilityCheckResult, setEligibilityCheckResult] = useState(null);
  const [isEligibilityChecking, setIsEligibilityChecking] = useState(false);
  const [scholarshipFilterDraft, setScholarshipFilterDraft] = useState(defaultScholarshipFilters);
  const [scholarshipFilters, setScholarshipFilters] = useState(defaultScholarshipFilters);
  const [aiSearchQueryInput, setAiSearchQueryInput] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [compareSelection, setCompareSelection] = useState([]);
  const [comparisonNotice, setComparisonNotice] = useState("");
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState(() => readStorageArray("jnananet_saved_scholarships"));
  const [supportTickets, setSupportTickets] = useState(() => readStorageArray("jnananet_support_tickets"));
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    screenshotName: "",
  });
  const [ticketStatus, setTicketStatus] = useState("");
  const [isDetectingApplyState, setIsDetectingApplyState] = useState(false);
  const [isDetectingProfileState, setIsDetectingProfileState] = useState(false);
  const [applyDetectStatus, setApplyDetectStatus] = useState("");
  const [profileDetectStatus, setProfileDetectStatus] = useState("");
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [supportChatMessage, setSupportChatMessage] = useState("");
  const [supportChatLog, setSupportChatLog] = useState([
    {
      id: `support-${Date.now()}`,
      role: "support",
      text: "Hi! Welcome to JnanaNet Support. How can we help you today?",
    },
  ]);
  const [authUser, setAuthUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const value = window.localStorage.getItem("jnananet_auth_user");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "B.Tech",
    percentage: "",
    familyIncome: "",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [typedAuthSubtitle, setTypedAuthSubtitle] = useState("");
  const [studentProfileForm, setStudentProfileForm] = useState(defaultStudentProfile);
  const [profileStatus, setProfileStatus] = useState("");
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jnananet_saved_scholarships", JSON.stringify(savedScholarships));
    }
  }, [savedScholarships]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jnananet_support_tickets", JSON.stringify(supportTickets));
    }
  }, [supportTickets]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (authUser) {
        window.localStorage.setItem("jnananet_auth_user", JSON.stringify(authUser));
      } else {
        window.localStorage.removeItem("jnananet_auth_user");
      }
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;

    setEligibilityForm((prev) => ({
      ...prev,
      course: authUser.course || prev.course,
      percentage: prev.percentage || String(authUser.percentage || ""),
      income: prev.income || String(authUser.familyIncome || ""),
    }));
  }, [authUser]);

  useEffect(() => {
    if (authMode === "forgot") {
      setShowAuthPassword(false);
    }
  }, [authMode]);

  useEffect(() => {
    if (!authUser) {
      setStudentProfileForm(defaultStudentProfile);
      return;
    }

    const storedProfile = readStudentProfile();
    const accountProfile = {
      fullName: authUser.name || "",
      email: authUser.email || "",
      course: authUser.course || "",
      collegeName: "",
      familyIncome: authUser.familyIncome ? String(authUser.familyIncome) : "",
      state: "",
      district: "",
      category: "General",
      profilePhoto: authUser.profilePhoto || "",
    };

    setStudentProfileForm({
      ...accountProfile,
      ...(storedProfile || {}),
    });
  }, [authUser]);

  useEffect(() => {
    const closeMenuOnOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }

      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreDropdownOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousedown", closeMenuOnOutsideClick);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousedown", closeMenuOnOutsideClick);
      }
    };
  }, []);

  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMoreDropdownOpen(false);
    setIsMobileNavOpen(false);
  }, [activePage]);

  useEffect(() => {
    // Typing animation for auth subtitle.
    let index = 0;
    setTypedAuthSubtitle("");

    const timer = setInterval(() => {
      index += 1;
      setTypedAuthSubtitle(AUTH_TYPING_TEXT.slice(0, index));
      if (index >= AUTH_TYPING_TEXT.length) {
        clearInterval(timer);
      }
    }, 60);

    return () => clearInterval(timer);
  }, [authMode]);

  useEffect(() => {
    setOpenFaqIndex(null);
  }, [faqSearch, language]);

  useEffect(() => {
    let isMounted = true;

    const fetchScholarships = async () => {
      setIsScholarshipLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/scholarships`);
        if (!response.ok) {
          throw new Error("Unable to load scholarships");
        }

        const data = await response.json();
        if (isMounted) {
          setScholarshipCatalog(Array.isArray(data?.scholarships) ? data.scholarships : []);
        }
      } catch {
        if (isMounted) {
          setScholarshipCatalog(fallbackScholarships);
        }
      } finally {
        if (isMounted) {
          setIsScholarshipLoading(false);
        }
      }
    };

    fetchScholarships();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const syncRouteToPage = () => {
      if (typeof window === "undefined") return;
      const hashMatch = window.location.hash.match(/^#\/?scholarship\/(\d+)$/);
      const pathMatch = window.location.pathname.match(/^\/scholarship\/(\d+)$/);
      const match = hashMatch || pathMatch;
      if (match) {
        setSelectedScholarshipId(Number.parseInt(match[1], 10));
        setActivePage("scholarshipDetails");
      }
    };

    syncRouteToPage();
    window.addEventListener("popstate", syncRouteToPage);
    window.addEventListener("hashchange", syncRouteToPage);

    return () => {
      window.removeEventListener("popstate", syncRouteToPage);
      window.removeEventListener("hashchange", syncRouteToPage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const scholarshipName = params.get("scholarship");
    if (!scholarshipName) return;

    const sourceScholarships = scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships;
    const foundScholarship = sourceScholarships.find((item) => item.name === scholarshipName);
    if (foundScholarship) {
      setSelectedApplyScholarship(foundScholarship);
    }
  }, [scholarshipCatalog]);

  const updateEligibilityForm = (field, value) => {
    setEligibilityForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateApplicationForm = (field, value) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateContactForm = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateStudentProfileForm = (field, value) => {
    setStudentProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  // On state change, district is reset so only valid districts can be selected.
  const updateStudentProfileState = (state) => {
    setStudentProfileForm((prev) => ({ ...prev, state, district: "" }));
  };

  // On state change, district is reset so only valid districts can be selected.
  const updateApplicationState = (state) => {
    setApplicationForm((prev) => ({ ...prev, state, district: "" }));
  };

  // Detects coordinates via browser geolocation and resolves the state with reverse geocoding.
  const detectStateWithGeolocation = async ({ onStateDetected, setStatus, setLoading }) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocation is not supported in this browser.");
      return;
    }

    setLoading(true);
    setStatus("Detecting your location...");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();
      const detectedRawState = data?.address?.state || data?.address?.state_district || "";
      const mappedState = normalizeDetectedState(detectedRawState);

      if (!mappedState) {
        setStatus("State detected, but not available in dropdown list.");
        return;
      }

      onStateDetected(mappedState);
      setStatus(`✅ Detected state: ${mappedState}`);
    } catch (error) {
      if (error?.code === 1) {
        setStatus("Location permission denied.");
      } else if (error?.code === 2) {
        setStatus("Unable to detect your location.");
      } else if (error?.code === 3) {
        setStatus("Location request timed out.");
      } else {
        setStatus("Could not detect state automatically. Please select manually.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetectApplyState = () => {
    detectStateWithGeolocation({
      onStateDetected: updateApplicationState,
      setStatus: setApplyDetectStatus,
      setLoading: setIsDetectingApplyState,
    });
  };

  const handleDetectProfileState = () => {
    detectStateWithGeolocation({
      onStateDetected: updateStudentProfileState,
      setStatus: setProfileDetectStatus,
      setLoading: setIsDetectingProfileState,
    });
  };

  // Save profile details locally and reflect display name/email immediately in navbar/dashboard.
  const handleStudentProfileSubmit = (event) => {
    event.preventDefault();

    const updatedProfile = {
      ...studentProfileForm,
      fullName: studentProfileForm.fullName.trim(),
      email: studentProfileForm.email.trim().toLowerCase(),
      course: studentProfileForm.course.trim(),
      collegeName: studentProfileForm.collegeName.trim(),
      familyIncome: studentProfileForm.familyIncome,
      state: studentProfileForm.state.trim(),
      district: studentProfileForm.district.trim(),
      category: studentProfileForm.category || "General",
      profilePhoto: studentProfileForm.profilePhoto || "",
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(updatedProfile));
    }

    setStudentProfileForm(updatedProfile);
    setProfileStatus("✅ Profile updated successfully");
    setTimeout(() => setProfileStatus(""), 2500);

    setAuthUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: updatedProfile.fullName || prev.name,
        email: updatedProfile.email || prev.email,
        course: updatedProfile.course || prev.course,
        familyIncome: Number.parseFloat(updatedProfile.familyIncome || "0") || 0,
        profilePhoto: updatedProfile.profilePhoto || prev.profilePhoto || "",
      };
    });

    if (typeof window !== "undefined" && authUser?.email) {
      try {
        const value = window.localStorage.getItem("jnananet_accounts");
        const accounts = value ? JSON.parse(value) : [];
        if (Array.isArray(accounts)) {
          const currentEmail = String(authUser.email).toLowerCase();
          const nextAccounts = accounts.map((account) => {
            if (String(account.email).toLowerCase() !== currentEmail) {
              return account;
            }
            return {
              ...account,
              name: updatedProfile.fullName || account.name,
              email: updatedProfile.email || account.email,
              course: updatedProfile.course || account.course,
              familyIncome: Number.parseFloat(updatedProfile.familyIncome || "0") || 0,
              profilePhoto: updatedProfile.profilePhoto || account.profilePhoto || "",
            };
          });
          window.localStorage.setItem("jnananet_accounts", JSON.stringify(nextAccounts));
        }
      } catch {
        // Ignore malformed localStorage account data.
      }
    }
  };

  const handleProfilePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileStatus("Please choose a valid image file.");
      setTimeout(() => setProfileStatus(""), 2500);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === "string" ? reader.result : "";
      if (!imageData) return;

      setStudentProfileForm((prev) => ({
        ...prev,
        profilePhoto: imageData,
      }));
      setProfileStatus("✅ Profile photo selected. Click Update Profile to save.");
      setTimeout(() => setProfileStatus(""), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckEligibility = () => {
    const sourceScholarships = scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships;
    const score = calculateEligibilityScoreFromProfile(
      {
        course: eligibilityForm.course || studentProfileForm.course || authUser?.course || "",
        percentage: eligibilityForm.percentage || authUser?.percentage || "",
        income: eligibilityForm.income || studentProfileForm.familyIncome || authUser?.familyIncome || "",
        category: studentProfileForm.category || eligibilityForm.category || "General",
        hasAadhaar: eligibilityForm.aadhaar === "Yes",
      },
      sourceScholarships
    );

    setEligibilityScore(score);
    setEligibilityResult(score >= 60);
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
      scholarshipName: selectedApplyScholarship?.name || "Not specified",
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

  const getScholarshipSource = () => (scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships);

  const personalizedEligibilityScore = useMemo(() => {
    const sourceScholarships = scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships;

    return calculateEligibilityScoreFromProfile(
      {
        course: studentProfileForm.course || eligibilityForm.course || authUser?.course || "",
        percentage: eligibilityForm.percentage || authUser?.percentage || "",
        income: eligibilityForm.income || studentProfileForm.familyIncome || authUser?.familyIncome || "",
        category: studentProfileForm.category || eligibilityForm.category || "General",
        hasAadhaar: eligibilityForm.aadhaar === "Yes",
      },
      sourceScholarships
    );
  }, [
    authUser?.course,
    authUser?.familyIncome,
    authUser?.percentage,
    eligibilityForm.aadhaar,
    eligibilityForm.category,
    eligibilityForm.course,
    eligibilityForm.income,
    eligibilityForm.percentage,
    scholarshipCatalog,
    studentProfileForm.category,
    studentProfileForm.course,
    studentProfileForm.familyIncome,
  ]);

  const openApplyPage = (scholarship) => {
    // Pass scholarship selection to Apply page and persist in URL query.
    setSelectedApplyScholarship(scholarship || null);
    setActivePage("apply");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (scholarship?.name) {
        url.searchParams.set("scholarship", scholarship.name);
      } else {
        url.searchParams.delete("scholarship");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const isSavedScholarship = (scholarshipId) => savedScholarships.includes(scholarshipId);

  const toggleSaveScholarship = (scholarshipId) => {
    setSavedScholarships((prev) => (
      prev.includes(scholarshipId)
        ? prev.filter((id) => id !== scholarshipId)
        : [scholarshipId, ...prev]
    ));
  };

  const handleTicketInput = (field, value) => {
    setTicketForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitSupportTicket = (event) => {
    event.preventDefault();
    const subject = ticketForm.subject.trim();
    const description = ticketForm.description.trim();

    if (!subject || !description) {
      setTicketStatus("Please fill subject and description.");
      return;
    }

    const ticket = {
      id: `TKT-${Date.now().toString().slice(-8)}`,
      subject,
      description,
      screenshotName: ticketForm.screenshotName || "Not attached",
      status: "Open",
      createdAt: new Date().toLocaleString(),
      raisedBy: authUser?.email || "Guest",
    };

    setSupportTickets((prev) => [ticket, ...prev].slice(0, 100));
    setTicketForm({ subject: "", description: "", screenshotName: "" });
    setTicketStatus("✅ Ticket submitted successfully.");
  };

  // Simple local support chat handler (frontend-only).
  const sendSupportChatMessage = () => {
    const message = supportChatMessage.trim();
    if (!message) return;

    const userEntry = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
    };

    const supportEntry = {
      id: `support-${Date.now() + 1}`,
      role: "support",
      text: "Thanks for your message. Our support team will review this shortly. You can also raise a support ticket from the Support page.",
    };

    setSupportChatLog((prev) => [...prev, userEntry, supportEntry]);
    setSupportChatMessage("");
  };

  const handleAuthInput = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;

    const accounts = (() => {
      if (typeof window === "undefined") return [];
      try {
        const value = window.localStorage.getItem("jnananet_accounts");
        const parsed = value ? JSON.parse(value) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    if (authMode === "signup") {
      if (!authForm.name.trim() || !email || !password) {
        setAuthMessage("Please fill name, email, and password.");
        return;
      }

      if (accounts.some((item) => String(item.email).toLowerCase() === email)) {
        setAuthMessage("Account already exists with this email.");
        return;
      }

      const account = {
        name: authForm.name.trim(),
        email,
        password,
        course: authForm.course,
        percentage: Number.parseFloat(authForm.percentage || "0") || 0,
        familyIncome: Number.parseFloat(authForm.familyIncome || "0") || 0,
      };

      const nextAccounts = [account, ...accounts];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("jnananet_accounts", JSON.stringify(nextAccounts));
      }

      setAuthUser(account);
      setAuthMessage("✅ Account created and logged in.");
      setActivePage("dashboard");
      return;
    }

    if (authMode === "forgot") {
      if (!email) {
        setAuthMessage("Enter your email to continue.");
        return;
      }

      setAuthMessage("If this email is registered, reset instructions have been sent.");
      return;
    }

    const matched = accounts.find(
      (item) => String(item.email).toLowerCase() === email && String(item.password) === password
    );

    if (!matched) {
      setAuthMessage("Invalid email or password.");
      return;
    }

    setAuthUser(matched);
    setAuthMessage("✅ Logged in successfully.");
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setAuthUser(null);
    setAuthMode("login");
    setAuthMessage("");
    setActivePage("auth");
  };

  const navigateFromProfileMenu = (page) => {
    setActivePage(page);
    setIsProfileDropdownOpen(false);
  };

  const handleMoreNavigation = (value) => {
    if (!value) return;
    setActivePage(value);
  };

  const getNotificationItems = () => {
    const sourceScholarships = getScholarshipSource();
    const items = [];

    sourceScholarships.forEach((scholarship) => {
      const daysLeft = getDaysLeft(scholarship.deadline);
      if (daysLeft !== null && daysLeft <= 7) {
        items.push({
          id: `deadline-${scholarship.id}`,
          text: `Reminder: ${scholarship.name} deadline in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
          type: "deadline",
        });
      }
    });

    if (sourceScholarships.length > 0) {
      items.push({
        id: "new-scholarships",
        text: `New scholarships available: ${sourceScholarships.length}`,
        type: "new",
      });
    }

    const missingDocs = ["aadhaar", "income", "marksheet"].filter((key) => !uploads[key]);
    if (missingDocs.length > 0) {
      items.push({
        id: "doc-reminder",
        text: `Document reminder: upload ${missingDocs.join(", ")} to complete your application profile.`,
        type: "document",
      });
    }

    return items;
  };

  const openScholarshipDetails = (scholarshipId) => {
    setSelectedScholarshipId(scholarshipId);
    setEligibilityCheckResult(null);
    setActivePage("scholarshipDetails");

    if (typeof window !== "undefined") {
      window.location.hash = `/scholarship/${scholarshipId}`;
    }
  };

  const closeScholarshipDetails = () => {
    setActivePage("home");
    setSelectedScholarshipId(null);
    setEligibilityCheckResult(null);

    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  };

  const checkScholarshipEligibility = async ({ marks, income, scholarshipId }) => {
    setIsEligibilityChecking(true);
    setEligibilityCheckResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/check-eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marks,
          income,
          scholarshipId,
        }),
      });

      if (!response.ok) {
        throw new Error("Eligibility check failed");
      }

      const data = await response.json();
      setEligibilityCheckResult(data?.results?.[0] || null);
    } catch {
      setEligibilityCheckResult({
        status: "Not Eligible",
        reason: "Unable to check eligibility right now. Please try again.",
      });
    } finally {
      setIsEligibilityChecking(false);
    }
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
    const selectedCourse = String(eligibilityForm.course || "").toLowerCase();
    const scholarshipCourse = String(scholarship.course || "").toLowerCase();

    const incomeEligible = income > 0 ? income <= scholarship.maxIncome : true;
    const academicStrong = percentage > 0 ? percentage >= scholarship.minMarks : true;
    const courseEligible = selectedCourse
      ? scholarshipCourse.includes(selectedCourse) || selectedCourse.includes(scholarshipCourse) || scholarshipCourse === "any"
      : true;

    const score =
      (incomeEligible ? 35 : 0) +
      (courseEligible ? 20 : 0) +
      (academicStrong
        ? 45
        : percentage > 0
          ? Math.min(45, Math.round((percentage / Math.max(1, scholarship.minMarks)) * 45))
          : 0);

    const reasons = [
      `${incomeEligible ? "✔" : "✖"} Income ${incomeEligible ? "eligible" : "above limit"}`,
      `${courseEligible ? "✔" : "✖"} Course ${courseEligible ? "matched" : "not matched"}`,
      `${academicStrong ? "✔" : "✖"} Academic score ${academicStrong ? "strong" : "below cut-off"}`,
    ];

    return { score: Math.min(100, Math.max(0, score)), reasons };
  };

  const getRecommendedScholarships = () => {
    const sourceScholarships = scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships;
    const income = parseFloat(eligibilityForm.income || "0");
    const percentage = parseFloat(eligibilityForm.percentage || "0");
    const course = String(eligibilityForm.course || "").toLowerCase();

    const hasProfileData = income > 0 || percentage > 0;
    if (!hasProfileData) {
      return sourceScholarships
        .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
        .slice(0, 10);
    }

    const shortlisted = sourceScholarships
      .filter((scholarship) => {
        const isIncomeClose = income > 0 ? income <= scholarship.maxIncome * 1.25 : true;
        const isAcademicClose = percentage > 0 ? percentage >= scholarship.minMarks - 10 : true;
        const scholarshipCourse = String(scholarship.course || "").toLowerCase();
        const courseMatch = course
          ? scholarshipCourse.includes(course) || course.includes(scholarshipCourse) || scholarshipCourse === "any"
          : true;
        return isIncomeClose && isAcademicClose && courseMatch;
      })
      .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
      .sort((first, second) => second.match.score - first.match.score);

    return shortlisted.length > 0
      ? shortlisted
      : sourceScholarships
        .map((scholarship) => ({ scholarship, match: getScholarshipMatchDetails(scholarship) }))
        .sort((first, second) => second.match.score - first.match.score)
        .slice(0, 10);
  };

  const updateScholarshipFilterDraft = (field, value) => {
    setScholarshipFilterDraft((prev) => ({ ...prev, [field]: value }));
  };

  const applyScholarshipFilters = () => {
    setScholarshipFilters(scholarshipFilterDraft);
    setCompareSelection([]);
    setShowComparisonTable(false);
    setComparisonNotice("");
  };

  const getFilteredScholarships = (scholarships) => {
    return scholarships.filter(({ scholarship }) => {
      const incomeLimit = Number.parseInt(scholarshipFilters.incomeRange || "0", 10);
      const minAmount = Number.parseInt(scholarshipFilters.amount || "0", 10);
      const deadlineLimitDays = Number.parseInt(scholarshipFilters.deadlineDays || "0", 10);
      const scholarshipState = getScholarshipState(scholarship);
      const scholarshipCategory = getScholarshipCategory(scholarship);
      const scholarshipAmount = parseScholarshipAmount(scholarship.amount);
      const deadlineDaysLeft = getDaysLeft(scholarship.deadline);

      return (
        (!scholarshipFilters.course || String(scholarship.course) === scholarshipFilters.course)
        && (!incomeLimit || Number(scholarship.maxIncome || 0) <= incomeLimit)
        && (!scholarshipFilters.state || scholarshipState === scholarshipFilters.state)
        && (!scholarshipFilters.category || scholarshipCategory === scholarshipFilters.category)
        && (!minAmount || scholarshipAmount >= minAmount)
        && (!deadlineLimitDays || (deadlineDaysLeft !== null && deadlineDaysLeft <= deadlineLimitDays))
      );
    });
  };

  // Natural-language scholarship search over existing scholarship objects.
  const getAiSearchFilteredScholarships = (scholarships) => {
    const query = aiSearchQuery.trim().toLowerCase();
    if (!query) return scholarships;

    const matchedState = availableStates.find((state) => query.includes(state.toLowerCase()));
    const matchedCategory = beneficiaryCategories.find((category) => query.includes(category.toLowerCase()));
    const knownCourses = [...new Set(scholarships.map(({ scholarship }) => scholarship.course).filter(Boolean))];
    const matchedCourse = knownCourses.find((course) => {
      const compactCourse = String(course).toLowerCase().replace(/\./g, "");
      return query.includes(String(course).toLowerCase()) || query.includes(compactCourse);
    });

    const mentionsIncome = /under|below|income/.test(query);
    const incomeLimit = mentionsIncome ? parseIncomeLimitFromQuery(query) : null;

    const keywordTokens = query
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9.]/g, ""))
      .filter((token) => token.length > 2 && !["scholarship", "scholarships", "income", "under", "below", "for"].includes(token));

    const hasStructuredSignal = Boolean(matchedState || matchedCategory || matchedCourse || incomeLimit);

    return scholarships.filter(({ scholarship }) => {
      const scholarshipState = getScholarshipState(scholarship);
      const scholarshipCategory = getScholarshipCategory(scholarship);
      const searchableText = [
        scholarship.name,
        scholarship.provider,
        scholarship.course,
        scholarshipState,
        scholarshipCategory,
      ].join(" ").toLowerCase();

      const keywordMatch = keywordTokens.length === 0 || keywordTokens.some((token) => searchableText.includes(token));

      return (
        (!matchedState || scholarshipState === matchedState)
        && (!matchedCategory || scholarshipCategory === matchedCategory)
        && (!matchedCourse || String(scholarship.course) === matchedCourse)
        && (!incomeLimit || Number(scholarship.maxIncome || 0) <= incomeLimit)
        && (hasStructuredSignal ? true : keywordMatch)
      );
    });
  };

  const searchScholarships = () => {
    setAiSearchQuery(aiSearchQueryInput);
    setCompareSelection([]);
    setShowComparisonTable(false);
    setComparisonNotice("");
  };

  const handleCompareToggle = (scholarshipId, checked) => {
    if (checked) {
      if (compareSelection.length >= 2) {
        setComparisonNotice("Please select only 2 scholarships to compare.");
        return;
      }
      setCompareSelection((prev) => [...prev, scholarshipId]);
      setComparisonNotice("");
      return;
    }

    setCompareSelection((prev) => prev.filter((id) => id !== scholarshipId));
    setComparisonNotice("");
    setShowComparisonTable(false);
  };

  const compareScholarships = () => {
    if (compareSelection.length !== 2) {
      setComparisonNotice("Please select exactly 2 scholarships to compare.");
      setShowComparisonTable(false);
      return;
    }
    setComparisonNotice("");
    setShowComparisonTable(true);
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
    const displayedScore = eligibilityScore > 0 ? eligibilityScore : personalizedEligibilityScore;
    const aiConfidence = Math.min(100, Math.round((displayedScore / 100) * 92 + 5));
    const scholarships = getRecommendedScholarships();
    const filteredScholarships = getFilteredScholarships(scholarships);
    const aiSearchScholarships = getAiSearchFilteredScholarships(filteredScholarships);
    const courseFilterOptions = [...new Set(scholarships.map(({ scholarship }) => scholarship.course).filter(Boolean))];
    const comparedScholarships = compareSelection
      .map((id) => scholarships.find(({ scholarship }) => scholarship.id === id)?.scholarship)
      .filter(Boolean);
    const stateScholarshipCounts = aiSearchScholarships.reduce((accumulator, { scholarship }) => {
      const state = getScholarshipState(scholarship);
      accumulator[state] = (accumulator[state] || 0) + 1;
      return accumulator;
    }, {});
    const stateScholarshipEntries = Object.entries(stateScholarshipCounts)
      .sort((left, right) => right[1] - left[1]);
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
            <span className="hero-badge">🚀 Built for AI for Bharat Hackathon 2026</span>
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
          <div className="glass filter-panel" role="group" aria-label="Scholarship filters">
            <select
              id="courseFilter"
              value={scholarshipFilterDraft.course}
              onChange={(event) => updateScholarshipFilterDraft("course", event.target.value)}
            >
              <option value="">Course</option>
              {courseFilterOptions.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <select
              id="incomeFilter"
              value={scholarshipFilterDraft.incomeRange}
              onChange={(event) => updateScholarshipFilterDraft("incomeRange", event.target.value)}
            >
              <option value="">Income Range</option>
              <option value="100000">Below ₹1L</option>
              <option value="300000">Below ₹3L</option>
              <option value="500000">Below ₹5L</option>
              <option value="800000">Below ₹8L</option>
            </select>

            <select
              id="stateFilter"
              value={scholarshipFilterDraft.state}
              onChange={(event) => updateScholarshipFilterDraft("state", event.target.value)}
            >
              <option value="">State</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              id="categoryFilter"
              value={scholarshipFilterDraft.category}
              onChange={(event) => updateScholarshipFilterDraft("category", event.target.value)}
            >
              <option value="">Category</option>
              {beneficiaryCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              id="amountFilter"
              value={scholarshipFilterDraft.amount}
              onChange={(event) => updateScholarshipFilterDraft("amount", event.target.value)}
            >
              <option value="">Scholarship Amount</option>
              <option value="10000">Above ₹10,000</option>
              <option value="50000">Above ₹50,000</option>
              <option value="100000">Above ₹1,00,000</option>
            </select>

            <select
              id="deadlineFilter"
              value={scholarshipFilterDraft.deadlineDays}
              onChange={(event) => updateScholarshipFilterDraft("deadlineDays", event.target.value)}
            >
              <option value="">Deadline</option>
              <option value="30">Within 30 days</option>
              <option value="60">Within 60 days</option>
              <option value="90">Within 90 days</option>
            </select>

            <button type="button" className="btn-neon" onClick={applyScholarshipFilters}>
              Apply Filters
            </button>
          </div>

          <div className="glass state-scholarship-map">
            <h3>Scholarships Available by State</h3>
            <ul id="stateList" className="state-list">
              {stateScholarshipEntries.length === 0 && <li>No scholarships found for selected filters.</li>}
              {stateScholarshipEntries.map(([state, count]) => (
                <li key={state}>{state} – {count} Scholarship{count > 1 ? "s" : ""}</li>
              ))}
            </ul>
          </div>

          <div className="glass ai-search" role="search">
            <input
              type="text"
              id="aiSearchInput"
              value={aiSearchQueryInput}
              onChange={(event) => setAiSearchQueryInput(event.target.value)}
              placeholder="Search scholarships... (example: BTech scholarships under 3 lakh income)"
            />
            <button type="button" className="btn-neon" onClick={searchScholarships}>Search</button>
          </div>

          <div className="compare-toolbar">
            <button type="button" className="btn-glass" onClick={compareScholarships}>Compare Selected</button>
            <small>Selected: {compareSelection.length}/2</small>
          </div>
          {comparisonNotice && <p className="compare-note">{comparisonNotice}</p>}

          {showComparisonTable && comparedScholarships.length === 2 && (
            <div id="comparisonTable" className="comparison-table glass">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>{comparedScholarships[0].name}</th>
                    <th>{comparedScholarships[1].name}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Amount</td>
                    <td>{comparedScholarships[0].amount}</td>
                    <td>{comparedScholarships[1].amount}</td>
                  </tr>
                  <tr>
                    <td>Provider</td>
                    <td>{comparedScholarships[0].provider}</td>
                    <td>{comparedScholarships[1].provider}</td>
                  </tr>
                  <tr>
                    <td>Deadline</td>
                    <td>{comparedScholarships[0].deadline}</td>
                    <td>{comparedScholarships[1].deadline}</td>
                  </tr>
                  <tr>
                    <td>Course</td>
                    <td>{comparedScholarships[0].course}</td>
                    <td>{comparedScholarships[1].course}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{getScholarshipCategory(comparedScholarships[0])}</td>
                    <td>{getScholarshipCategory(comparedScholarships[1])}</td>
                  </tr>
                  <tr>
                    <td>State</td>
                    <td>{getScholarshipState(comparedScholarships[0])}</td>
                    <td>{getScholarshipState(comparedScholarships[1])}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {isScholarshipLoading && <p className="loading-note">Loading scholarships...</p>}
          <div className="scholarship-grid">
            {aiSearchScholarships.map(({ scholarship, match }) => (
              <article className="glass scholarship-card" key={scholarship.id || scholarship.name}>
                <h3>{scholarship.name}</h3>
                <p>{scholarship.provider}</p>
                <label className="compare-toggle">
                  <input
                    type="checkbox"
                    className="compareCheck"
                    checked={compareSelection.includes(scholarship.id)}
                    onChange={(event) => handleCompareToggle(scholarship.id, event.target.checked)}
                  />
                  Compare
                </label>
                <div className="scholarship-bottom">
                  <div className="scholarship-primary-stack">
                    <p className="scholarship-amount">{scholarship.amount}</p>
                    <p className="scholarship-deadline">Deadline: {scholarship.deadline}</p>
                    <button className="apply-mini" onClick={() => openApplyPage(scholarship)}>Apply</button>
                  </div>
                  <div className="scholarship-actions">
                    <button className="explain-mini" onClick={() => askAssistant(`Explain ${scholarship.name} scholarship`)}>
                      Explain with AI
                    </button>
                    <button className="explain-mini" onClick={() => openScholarshipDetails(scholarship.id)}>
                      View Details
                    </button>
                    <button className="explain-mini" onClick={() => toggleSaveScholarship(scholarship.id)}>
                      {isSavedScholarship(scholarship.id) ? "★ Saved" : "☆ Save"}
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
          {aiSearchScholarships.length === 0 && <p className="loading-note">No scholarships matched your AI search query.</p>}
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
              <button className="btn-glass" onClick={() => openApplyPage(selectedApplyScholarship)}>{t.eligibility.applyNow}</button>
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
        {/* Scholarship context shown to user before filling the form. */}
        <h3 id="scholarshipTitle" className="apply-scholarship-title">
          Applying for: {selectedApplyScholarship?.name || "General Scholarship"}
        </h3>
        {selectedApplyScholarship && (
          <div className="scholarship-info">
            <p><strong>Scholarship:</strong> {selectedApplyScholarship.name}</p>
            <p><strong>Amount:</strong> {selectedApplyScholarship.amount || "As per official portal"}</p>
            <p><strong>Deadline:</strong> {selectedApplyScholarship.deadline || "Check official portal"}</p>
          </div>
        )}
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
            <select
              value={applicationForm.state}
              onChange={(e) => updateApplicationState(e.target.value)}
            >
              <option value="">Select State</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <button
              type="button"
              className="detect-btn"
              onClick={handleDetectApplyState}
              disabled={isDetectingApplyState}
            >
              {isDetectingApplyState ? "Detecting..." : "📍 Detect My State Automatically"}
            </button>
            {applyDetectStatus && <small className="detect-status">{applyDetectStatus}</small>}
          </label>
          <label>
            {t.apply.district} <span className="mandatory">*</span>
            <select
              value={applicationForm.district}
              onChange={(e) => updateApplicationForm("district", e.target.value)}
              disabled={!applicationForm.state}
            >
              <option value="">Select District</option>
              {(stateDistricts[applicationForm.state] || []).map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
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
        <div className="assistant-support-row">
          <button className="btn-glass" onClick={() => setActivePage("support")}>
            Can't solve with AI? Raise Support Ticket
          </button>
        </div>
      </div>
    </section>
  );

  const renderSuccessStories = () => (
    <section className="moon-section">
      <div className="glass stories-shell stories-showcase-shell">
        <h2>{t.stories.title}</h2>
        <p>{t.stories.subtitle}</p>

        <div className="stories-grid">
          {successStories.map((story, index) => {
            const storyInitial = story.name?.trim()?.charAt(0)?.toUpperCase() || "S";
            const storyLocations = ["Andhra Pradesh", "Telangana", "Tamil Nadu"];
            const storyLocation = storyLocations[index % storyLocations.length];

            return (
            <article className="story-glass success-story-card" key={story.name}>
              <div className="story-head">
                <div className="story-avatar" aria-hidden="true">{storyInitial}</div>
                <div className="story-meta">
                  <h3>{story.name}</h3>
                  <p className="story-location">📍 {storyLocation}</p>
                </div>
              </div>

              <div className="story-scholarship-row">
                <span className="story-scholarship-badge">{story.scholarship}</span>
                <p className="story-amount-text">{t.stories.received} <strong>{story.amount}</strong></p>
              </div>

              <blockquote className="story-quote">“{story.quote}”</blockquote>
            </article>
            );
          })}
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
    const selectedFaqLanguage = faqLanguageMap[language] || "en";
    const localizedFaq = faqDataByLanguage[selectedFaqLanguage] || faqDataByLanguage.en;

    const filteredFaq = localizedFaq.filter(
      (item) =>
        item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );
    const smartFaq = faqSearch.trim()
      ? localizedFaq.find(
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

  const renderScholarshipDetails = () => {
    const sourceScholarships = scholarshipCatalog.length > 0 ? scholarshipCatalog : fallbackScholarships;
    const selectedScholarship = sourceScholarships.find((item) => item.id === selectedScholarshipId);

    return (
      <ScholarshipDetails
        scholarship={selectedScholarship}
        onBack={closeScholarshipDetails}
        onCheckEligibility={checkScholarshipEligibility}
        eligibilityResult={eligibilityCheckResult}
        isChecking={isEligibilityChecking}
      />
    );
  };

  const renderNotifications = () => {
    const notifications = getNotificationItems();

    return (
      <section className="moon-section">
        <div className="glass stories-shell">
          <h2>Notifications</h2>
          <p>Stay updated on deadlines, new scholarships, and document reminders.</p>

          <div className="notification-list">
            {notifications.length === 0 && <p>No new notifications.</p>}
            {notifications.map((item) => (
              <div className={`notification-card ${item.type}`} key={item.id}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderSavedScholarships = () => {
    const sourceScholarships = getScholarshipSource();
    const savedItems = sourceScholarships.filter((item) => savedScholarships.includes(item.id));

    return (
      <section className="moon-section">
        <div className="glass stories-shell">
          <h2>⭐ Saved Scholarships</h2>
          <p>Quick access to scholarships you bookmarked.</p>

          <div className="saved-list">
            {savedItems.length === 0 && <p>No saved scholarships yet.</p>}
            {savedItems.map((item) => (
              <article className="saved-card" key={item.id}>
                <p>✔ {item.name}</p>
                <div className="saved-actions">
                  <button className="btn-glass" onClick={() => openScholarshipDetails(item.id)}>View Details</button>
                  <button className="btn-glass" onClick={() => toggleSaveScholarship(item.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderSupport = () => (
    <section className="moon-section">
      <div className="glass stories-shell support-shell support-dashboard-shell">
        <div className="panel-header-row">
          <h2>Raise Support Ticket</h2>
          <span className="panel-sub-badge">Student Help Desk</span>
        </div>
        <p>If AI cannot solve your issue, submit a ticket and our team will assist you.</p>

        <form className="support-form support-ticket-form" onSubmit={submitSupportTicket}>
          <div className="ticket-user-meta">
            <div className="ticket-meta-chip">
              <span className="meta-label">Student Name</span>
              <strong>{authUser?.name || "Guest User"}</strong>
            </div>
            <div className="ticket-meta-chip">
              <span className="meta-label">Email</span>
              <strong>{authUser?.email || "guest@jnananet.local"}</strong>
            </div>
          </div>

          <div className="ticket-form-grid">
            <label>
              Issue Category
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(event) => handleTicketInput("subject", event.target.value)}
                placeholder="Unable to upload income certificate"
              />
            </label>
            <label>
              Upload Screenshot
              <input
                type="file"
                onChange={(event) => handleTicketInput("screenshotName", event.target.files?.[0]?.name || "")}
              />
            </label>
          </div>

          <label>
            Message
            <textarea
              rows="5"
              value={ticketForm.description}
              onChange={(event) => handleTicketInput("description", event.target.value)}
              placeholder="Portal shows error while uploading document"
            />
          </label>

          <button className="btn-neon support-submit-btn" type="submit">Submit Ticket</button>
          {ticketStatus && <p className="contact-status ok">{ticketStatus}</p>}
        </form>
      </div>
    </section>
  );

  const renderAdminTickets = () => (
    <section className="moon-section">
      <div className="glass stories-shell admin-ticket-shell">
        <div className="panel-header-row">
          <h2>Admin Support Tickets</h2>
          <span className="panel-sub-badge">Total: {supportTickets.length}</span>
        </div>
        <p>View all support tickets raised by users.</p>

        <div className="ticket-list admin-ticket-list">
          {supportTickets.length === 0 && <p>No tickets raised yet.</p>}
          {supportTickets.map((ticket) => (
            <article className="ticket-card admin-ticket-card" key={ticket.id}>
              <header className="ticket-card-head">
                <h4>{ticket.id}</h4>
                <span className={`status-pill ${String(ticket.status).toLowerCase() === "resolved" ? "resolved" : "open"}`}>
                  {ticket.status || "Open"}
                </span>
              </header>

              <div className="ticket-info-grid">
                <p><strong>Student Name:</strong> {ticket.studentName || "Student"}</p>
                <p><strong>Email:</strong> {ticket.email || ticket.raisedBy || "Not provided"}</p>
                <p><strong>Issue Category:</strong> {ticket.subject || "General"}</p>
                <p><strong>Date Submitted:</strong> {ticket.createdAt || "Not available"}</p>
              </div>

              <p className="ticket-message"><strong>Message:</strong> {ticket.description}</p>
              <p className="ticket-screenshot"><strong>Screenshot:</strong> {ticket.screenshotName}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderAuth = () => (
    <section className="moon-section auth-entry-shell">
      {/* Floating scholarship icons for subtle background motion. */}
      <div className="floating-icons" aria-hidden="true">
        <span>🎓</span>
        <span>💰</span>
        <span>📚</span>
        <span>🎯</span>
        <span>🧠</span>
      </div>

      <div className="auth-layout">
        <div className="glass stories-shell auth-shell auth-form-panel">
          <div className="auth-utility-row">
            <select
              className="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
            <button
              type="button"
              className="theme-toggle icon-toggle"
              onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span aria-hidden="true">{themeMode === "dark" ? "☀️" : "🌙"}</span>
            </button>
          </div>

          <h1>Welcome to JnanaNet</h1>
          <p className="auth-subtitle">Find scholarships instantly using AI</p>
          {/* Typing effect subtitle under heading. */}
          <h2 id="typing" className="typing-line">{typedAuthSubtitle}</h2>

          <h3 className="auth-mode-title">
            {authMode === "signup" ? "Create Account" : authMode === "forgot" ? "Forgot Password" : "Student Login"}
          </h3>

          <form className="support-form auth-login-form" onSubmit={handleAuthSubmit}>
            {authMode === "signup" && (
              <label>
                Name
                <input type="text" value={authForm.name} onChange={(event) => handleAuthInput("name", event.target.value)} />
              </label>
            )}

            <label>
              Email
              <input type="email" value={authForm.email} onChange={(event) => handleAuthInput("email", event.target.value)} />
            </label>

            {authMode !== "forgot" && (
              <label>
                Password
                <div className="password-field">
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    value={authForm.password}
                    onChange={(event) => handleAuthInput("password", event.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showAuthPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowAuthPassword((prev) => !prev)}
                  >
                    <i className={`fa-solid ${showAuthPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
                  </button>
                </div>
              </label>
            )}

            {authMode === "signup" && (
              <>
                <label>
                  Course
                  <input type="text" value={authForm.course} onChange={(event) => handleAuthInput("course", event.target.value)} />
                </label>
                <label>
                  Percentage
                  <input type="number" value={authForm.percentage} onChange={(event) => handleAuthInput("percentage", event.target.value)} />
                </label>
                <label>
                  Family Income
                  <input type="number" value={authForm.familyIncome} onChange={(event) => handleAuthInput("familyIncome", event.target.value)} />
                </label>
              </>
            )}

            <button className="btn-neon login-btn" type="submit">
              {authMode === "signup" ? "Create Account" : authMode === "forgot" ? "Send Reset Link" : "Login"}
            </button>

            {authMessage && <p className="contact-status ok">{authMessage}</p>}
          </form>

          <div className="auth-switches login-links">
            <button className={`auth-link-btn ${authMode === "signup" ? "active" : ""}`} onClick={() => setAuthMode("signup")}>Sign Up</button>
            <button className={`auth-link-btn ${authMode === "forgot" ? "active" : ""}`} onClick={() => setAuthMode("forgot")}>Forgot Password</button>
            <button className={`auth-link-btn ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
          </div>
        </div>

        {/* Replaced inaccessible 3D iframe with a static illustration panel. */}
        <div className="auth-visual-panel login-image">
          <div className="glass auth-animation-card">
            <img src="/student-login.svg" alt="Student login illustration" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );

  const renderDashboard = () => {
    const sourceScholarships = getScholarshipSource();
    const recommendations = getRecommendedScholarships().slice(0, 3).map((item) => item.scholarship);
    const savedItems = sourceScholarships.filter((item) => savedScholarships.includes(item.id));
    const upcomingDeadlines = sourceScholarships
      .filter((item) => getDaysLeft(item.deadline) !== null)
      .sort((left, right) => (getDaysLeft(left.deadline) || 9999) - (getDaysLeft(right.deadline) || 9999))
      .slice(0, 4);
    const statusCounts = applicationHistory.reduce((acc, item) => {
      const status = item.status || "Submitted";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const applicationStatuses = Object.entries(statusCounts);
    const dashboardScore = eligibilityScore > 0 ? eligibilityScore : personalizedEligibilityScore;

    return (
      <section className="moon-section">
        <div className="glass stories-shell dashboard-shell dashboard-modern-shell">
          <div className="dashboard-welcome">
            <h2 id="welcome">Welcome back, {studentDisplayName} 👋</h2>
            <p className="dashboard-subtitle">AI-personalized scholarship insights based on your profile.</p>
          </div>

          <article className="dashboard-ai-insight">
            <h3>🤖 AI Insight</h3>
            <p>Students with similar academic profiles received scholarships between ₹50,000 – ₹1,00,000.</p>
          </article>

          <div className="dashboard-panel-grid">
            <article className="dashboard-panel dashboard-feature-card">
              <div className="dashboard-card-header">
                <h3>🎓 Recommended Scholarships</h3>
              </div>
              <div className="dashboard-list">
                {recommendations.map((item) => (
                  <p className="dashboard-list-item" key={item.id}>✅ {item.name}</p>
                ))}
              </div>
              <button className="dashboard-view-all" type="button" onClick={() => setActivePage("home")}>View All</button>
            </article>

            <article className="dashboard-panel dashboard-feature-card eligibility-card">
              <h3>Your Eligibility Score</h3>
              <p className="metric">{dashboardScore}%</p>
              <div className="eligibility-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboardScore}>
                <div className="eligibility-progress-fill" style={{ width: `${Math.min(Math.max(dashboardScore, 0), 100)}%` }} />
              </div>
              <button className="dashboard-view-all" type="button" onClick={() => setActivePage("eligibility")}>View All</button>
            </article>

            <article className="dashboard-panel dashboard-feature-card">
              <div className="dashboard-card-header">
                <h3>⭐ Saved Scholarships</h3>
              </div>
              {savedItems.length === 0 && <p className="dashboard-empty">No saved scholarships yet.</p>}
              <div className="dashboard-list">
                {savedItems.map((item) => (
                  <p className="dashboard-list-item" key={item.id}>✅ {item.name}</p>
                ))}
              </div>
              <button className="dashboard-view-all" type="button" onClick={() => setActivePage("saved")}>View All</button>
            </article>

            <article className="dashboard-panel dashboard-feature-card">
              <div className="dashboard-card-header">
                <h3>📄 Applications Status</h3>
              </div>
              {applicationStatuses.length === 0 && <p className="dashboard-empty">No scholarship applications yet.</p>}
              <div className="dashboard-list">
                {applicationStatuses.map(([status, count]) => (
                  <p className="dashboard-list-item" key={status}>✅ {status}: <strong>{count}</strong></p>
                ))}
              </div>
              <button className="dashboard-view-all" type="button" onClick={() => setActivePage("track")}>View All</button>
            </article>

            <article className="dashboard-panel dashboard-feature-card">
              <div className="dashboard-card-header">
                <h3>⏰ Upcoming Deadlines</h3>
              </div>
              <div className="dashboard-list">
                {upcomingDeadlines.map((item) => (
                  <p className="dashboard-list-item" key={item.id}>✅ {item.name} – {item.deadline}</p>
                ))}
              </div>
              <button className="dashboard-view-all" type="button" onClick={() => setActivePage("notifications")}>View All</button>
            </article>
          </div>
        </div>
      </section>
    );
  };

  const renderProfile = () => (
    <section className="moon-section">
      <div className="glass stories-shell profile-shell">
        <h2>My Profile</h2>
        <p>Update your student details used for scholarship recommendations.</p>

        <form className="profile-form" id="profileForm" onSubmit={handleStudentProfileSubmit}>
          <div className="profile-form-grid">
            <label>
              Full Name
              <input
                id="name"
                type="text"
                value={studentProfileForm.fullName}
                onChange={(event) => updateStudentProfileForm("fullName", event.target.value)}
                placeholder="Full Name"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={studentProfileForm.email}
                onChange={(event) => updateStudentProfileForm("email", event.target.value)}
                placeholder="Email"
                required
              />
            </label>

            <label>
              Course
              <input
                type="text"
                value={studentProfileForm.course}
                onChange={(event) => updateStudentProfileForm("course", event.target.value)}
                placeholder="Course"
              />
            </label>

            <label>
              College Name
              <input
                type="text"
                value={studentProfileForm.collegeName}
                onChange={(event) => updateStudentProfileForm("collegeName", event.target.value)}
                placeholder="College Name"
              />
            </label>

            <label>
              Family Income
              <input
                type="number"
                value={studentProfileForm.familyIncome}
                onChange={(event) => updateStudentProfileForm("familyIncome", event.target.value)}
                placeholder="Family Income"
              />
            </label>

            <label>
              State
              <select
                value={studentProfileForm.state}
                onChange={(event) => updateStudentProfileState(event.target.value)}
              >
                <option value="">Select State</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <button
                type="button"
                className="detect-btn"
                onClick={handleDetectProfileState}
                disabled={isDetectingProfileState}
              >
                {isDetectingProfileState ? "Detecting..." : "📍 Detect My State Automatically"}
              </button>
              {profileDetectStatus && <small className="detect-status">{profileDetectStatus}</small>}
            </label>

            <label>
              District
              <select
                value={studentProfileForm.district}
                onChange={(event) => updateStudentProfileForm("district", event.target.value)}
                disabled={!studentProfileForm.state}
              >
                <option value="">Select District</option>
                {(stateDistricts[studentProfileForm.state] || []).map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select
                value={studentProfileForm.category}
                onChange={(event) => updateStudentProfileForm("category", event.target.value)}
              >
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
              </select>
            </label>

            <label className="profile-photo-field">
              Profile Photo
              <div className="profile-photo-upload-row">
                <div className="profile-photo-preview" aria-hidden="true">
                  {profilePhotoSrc ? (
                    <img src={profilePhotoSrc} alt="" />
                  ) : (
                    <span>{studentInitial}</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} />
              </div>
            </label>
          </div>

          <button className="btn-neon" type="submit">Update Profile</button>
          {profileStatus && <p className="contact-status ok">{profileStatus}</p>}
        </form>
      </div>
    </section>
  );

  const studentDisplayName =
    String(studentProfileForm.fullName || authUser?.name || "").trim()
    || String(authUser?.email || "").split("@")[0]
    || "Student";
  const navProfileName = studentDisplayName;
  const studentInitial = String(navProfileName).trim().charAt(0).toUpperCase() || "S";
  const profilePhotoSrc = studentProfileForm.profilePhoto || authUser?.profilePhoto || "";

  const renderSupportChatWidget = () => (
    <>
      {/* Floating support icon visible across pages */}
      <button
        className="support-chat-float"
        onClick={() => setIsSupportChatOpen((prev) => !prev)}
        aria-label="Open support chat"
        aria-expanded={isSupportChatOpen}
      >
        💬
      </button>

      {isSupportChatOpen && (
        <div className="support-chat-window" role="dialog" aria-label="JnanaNet Support Chat">
          <div className="support-chat-header">
            <strong>JnanaNet Support</strong>
            <button
              type="button"
              className="support-chat-close"
              onClick={() => setIsSupportChatOpen(false)}
              aria-label="Close support chat"
            >
              ✕
            </button>
          </div>

          <div className="support-chat-messages">
            {supportChatLog.map((entry) => (
              <p key={entry.id} className={`support-chat-bubble ${entry.role === "user" ? "user" : "support"}`}>
                {entry.text}
              </p>
            ))}
          </div>

          <div className="support-chat-input-row">
            <input
              type="text"
              value={supportChatMessage}
              onChange={(event) => setSupportChatMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendSupportChatMessage();
                }
              }}
              placeholder="Type your message"
            />
            <button type="button" onClick={sendSupportChatMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );

  if (!authUser) {
    // Protected app gate: users must log in before accessing any page.
    return (
      <div className={`app-shell auth-entry ${themeMode} ${miracleMode ? "miracle" : ""}`}>
        <div className="starfield" />
        <div className="demo-banner">{t.demoBanner}</div>
        {renderAuth()}
        {renderSupportChatWidget()}
      </div>
    );
  }

  return (
    <div className={`app-shell ${themeMode} ${miracleMode ? "miracle" : ""}`}>
      <div className="starfield" />
      <div className="demo-banner">{t.demoBanner}</div>

      <nav className="top-nav glass">
        <div className="nav-left">
          <div className="brand" aria-label="JnanaNet">
            <img className="brand-logo" src="/jnananet-icon.svg" alt="JnanaNet logo" />
            <span className="brand-text">JnanaNet</span>
          </div>
        </div>

        <button
          className="nav-mobile-toggle"
          type="button"
          onClick={() => setIsMobileNavOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileNavOpen}
        >
          {isMobileNavOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-collapsible ${isMobileNavOpen ? "open" : ""}`}>
          <div className="nav-center">
            <div className="nav-links">
              <button className={`nav-btn ${activePage === "dashboard" ? "active" : ""}`} onClick={() => setActivePage("dashboard")}>{t.nav.home}</button>
              <button className={`nav-btn ${activePage === "home" ? "active" : ""}`} onClick={() => setActivePage("home")}>Scholarships</button>
              <button className={`nav-btn ${activePage === "aiassistant" ? "active" : ""}`} onClick={() => setActivePage("aiassistant")}>{t.nav.assistant}</button>
              <button className={`nav-btn ${activePage === "track" ? "active" : ""}`} onClick={() => setActivePage("track")}>Track Applications</button>
              <button className={`nav-btn ${activePage === "stories" ? "active" : ""}`} onClick={() => setActivePage("stories")}>{t.nav.stories}</button>
              <button className={`nav-btn ${activePage === "faq" ? "active" : ""}`} onClick={() => setActivePage("faq")}>{t.nav.faq}</button>

              <div className="more-menu" ref={moreMenuRef}>
                <button
                  className={`nav-btn more-btn ${isMoreDropdownOpen ? "active" : ""}`}
                  type="button"
                  onClick={() => setIsMoreDropdownOpen((prev) => !prev)}
                  aria-label="Open more navigation menu"
                  aria-expanded={isMoreDropdownOpen}
                >
                  More ▾
                </button>

                {isMoreDropdownOpen && (
                  <div className="more-dropdown">
                    <button type="button" className={activePage === "eligibility" ? "active" : ""} onClick={() => handleMoreNavigation("eligibility")}>Eligibility</button>
                    <button type="button" className={activePage === "apply" ? "active" : ""} onClick={() => handleMoreNavigation("apply")}>Apply</button>
                    <button type="button" className={activePage === "saved" ? "active" : ""} onClick={() => handleMoreNavigation("saved")}>Saved</button>
                    <button type="button" className={activePage === "notifications" ? "active" : ""} onClick={() => handleMoreNavigation("notifications")}>Notifications</button>
                    <button type="button" className={activePage === "support" ? "active" : ""} onClick={() => handleMoreNavigation("support")}>Support</button>
                    <button type="button" className={activePage === "admin" ? "active" : ""} onClick={() => handleMoreNavigation("admin")}>Admin</button>
                    <button type="button" className={activePage === "portals" ? "active" : ""} onClick={() => handleMoreNavigation("portals")}>Portals</button>
                    <button type="button" className={activePage === "contact" ? "active" : ""} onClick={() => handleMoreNavigation("contact")}>Contact</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nav-right nav-actions">
            <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Tamil</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
            <button
              type="button"
              className="theme-toggle icon-toggle"
              onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span aria-hidden="true">{themeMode === "dark" ? "☀️" : "🌙"}</span>
            </button>

            <div className="profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="profile-icon"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                aria-label="Open profile menu"
                aria-expanded={isProfileDropdownOpen}
              >
                {profilePhotoSrc ? (
                  <img className="profile-image" src={profilePhotoSrc} alt={`${navProfileName} profile`} />
                ) : (
                  studentInitial
                )}
              </button>
              <span className="profile-name-label">{navProfileName}</span>

              {isProfileDropdownOpen && (
                <div id="profileDropdown" className="profile-dropdown">
                  <button className={activePage === "dashboard" ? "active" : ""} type="button" onClick={() => navigateFromProfileMenu("dashboard")}>Dashboard</button>
                  <button className={activePage === "profile" ? "active" : ""} type="button" onClick={() => navigateFromProfileMenu("profile")}>My Profile</button>
                  <button className={activePage === "track" ? "active" : ""} type="button" onClick={() => navigateFromProfileMenu("track")}>My Applications</button>
                  <button className={activePage === "saved" ? "active" : ""} type="button" onClick={() => navigateFromProfileMenu("saved")}>Saved Scholarships</button>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {activePage === "home" && renderHome()}
      {activePage === "dashboard" && renderDashboard()}
      {activePage === "profile" && renderProfile()}
      {activePage === "eligibility" && renderEligibility()}
      {activePage === "apply" && renderApply()}
      {activePage === "track" && renderTrackHistory()}
      {activePage === "saved" && renderSavedScholarships()}
      {activePage === "notifications" && renderNotifications()}
      {activePage === "support" && renderSupport()}
      {activePage === "admin" && renderAdminTickets()}
      {activePage === "aiassistant" && renderAiAssistant()}
      {activePage === "stories" && renderSuccessStories()}
      {activePage === "portals" && renderPortals()}
      {activePage === "faq" && renderFaq()}
      {activePage === "contact" && renderContact()}
      {activePage === "auth" && renderAuth()}
      {activePage === "scholarshipDetails" && renderScholarshipDetails()}

      {renderSupportChatWidget()}
      <button className="voice-float" onClick={() => setActivePage("aiassistant")}>{t.footer.voiceButton}</button>

      <footer className="footer glass">
        <div className="footer-grid">
          <div>
            <h4>Quick Links</h4>
            <p><button className="footer-link-btn" onClick={() => setActivePage("dashboard")}>Home</button></p>
            <p><button className="footer-link-btn" onClick={() => setActivePage("home")}>Scholarships</button></p>
            <p><button className="footer-link-btn" onClick={() => setActivePage("aiassistant")}>AI Assistant</button></p>
            <p><button className="footer-link-btn" onClick={() => setActivePage("track")}>Track Applications</button></p>
          </div>
          <div>
            <h4>Scholarship Portals</h4>
            <p><a className="footer-link-anchor" href="https://scholarships.gov.in" target="_blank" rel="noreferrer">National Scholarship Portal</a></p>
            <p><a className="footer-link-anchor" href="https://www.aicte-india.org" target="_blank" rel="noreferrer">AICTE</a></p>
            <p><a className="footer-link-anchor" href="https://www.buddy4study.com" target="_blank" rel="noreferrer">Buddy4Study</a></p>
          </div>
          <div>
            <h4>Contact</h4>
            <p>Email: jnananet.team@gmail.com</p>
            <p>Support: support@jnananet.com</p>
            <p>Location: India</p>
          </div>
          <div>
            <h4>Privacy Policy</h4>
            <p>We protect student profile data and use it only for scholarship discovery and assistance features.</p>
          </div>
          <div>
            <h4>Terms</h4>
            <p>JnanaNet provides guidance and redirects to official portals. Final eligibility is decided by scholarship authorities.</p>
          </div>
        </div>
        <p className="copyright">{t.footer.copyright}</p>
      </footer>
    </div>
  );
}

export default App;
