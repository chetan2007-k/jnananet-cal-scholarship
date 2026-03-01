import { useState } from "react";
import "./index.css";

const API_BASE = "http://13.62.42.76:5000";

function App() {
  const [language, setLanguage] = useState("English");
  const [literacy, setLiteracy] = useState("Low");
  const [voiceMode, setVoiceMode] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [activePage, setActivePage] = useState("assistant");

  // Eligibility checker states
  const [eligibilityPercentage, setEligibilityPercentage] = useState("");
  const [eligibilityIncome, setEligibilityIncome] = useState("");
  const [eligibilityInstitution, setEligibilityInstitution] = useState("Government");
  const [eligibilityAadhaar, setEligibilityAadhaar] = useState("Yes");
  const [eligibilityResult, setEligibilityResult] = useState(null);


  // Check eligibility handler
  const handleCheckEligibility = () => {
    const percentage = parseFloat(eligibilityPercentage);
    const income = parseFloat(eligibilityIncome);
    const hasAadhaar = eligibilityAadhaar === "Yes";

    const isEligible =
      percentage >= 60 &&
      income <= 300000 &&
      hasAadhaar;

    setEligibilityResult(isEligible);
  };

  // Impact cards data
  const impactCards = [
    {
      icon: "🌐",
      title: "Multi-Language Support",
      description: "Supports English, Hindi, and Telugu."
    },
    {
      icon: "🧠",
      title: "Literacy-Aware Guidance",
      description: "Adapts explanation based on user literacy level."
    },
    {
      icon: "📄",
      title: "Smart Form Understanding",
      description: "Explains uploaded scholarship forms in simple terms."
    },
    {
      icon: "⚡",
      title: "Low Bandwidth Mode",
      description: "Accessible even in limited connectivity environments."
    }
  ];

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">JnanaNet</div>
          <ul className="navbar-links">
            <li>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("home");
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("about");
                }}
              >
                About Scholarship
              </a>
            </li>
            <li>
              <a
                href="#eligibility"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("eligibility");
                }}
              >
                Eligibility
              </a>
            </li>
            <li>
              <a
                href="#apply"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage("assistant");
                }}
              >
                Apply Now
              </a>
            </li>
            <li><a href="#status">Application Status</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* HOME PAGE - Impact Dashboard */}
      {activePage === "home" && (
        <section className="home-impact-section">
          <div className="home-content">
            <h1 className="home-title">Making Scholarships Accessible for Every Student</h1>
            <p className="home-subtitle">
              JnanaNet – Cognitive Access Layer simplifies complex scholarship workflows into language-aware, literacy-aware step-by-step guidance.
            </p>

            {/* Impact Cards Grid */}
            <div className="impact-cards-grid">
              {impactCards.map((card, index) => (
                <div key={index} className="impact-card">
                  <div className="card-icon">{card.icon}</div>
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="home-cta">
              <button
                className="btn-start-guidance"
                onClick={() => setActivePage("assistant")}
              >
                Start Scholarship Guidance
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ABOUT SCHOLARSHIP PAGE */}
      {activePage === "about" && (
        <section className="about-section">
          <div className="about-content">
            <h1 className="about-title">About the Scholarship Program</h1>
            <p className="about-description">
              This scholarship supports students from economically weaker backgrounds by providing financial assistance for higher education through a transparent and structured process.
            </p>

            {/* Info Cards Grid */}
            <div className="about-cards-grid">
              <div className="about-info-card">
                <div className="about-card-icon">🎯</div>
                <h3 className="about-card-title">Purpose</h3>
                <p className="about-card-text">Supports students who need financial help to continue education.</p>
              </div>

              <div className="about-info-card">
                <div className="about-card-icon">👨‍🎓</div>
                <h3 className="about-card-title">Who Can Apply</h3>
                <p className="about-card-text">Undergraduate, postgraduate, and technical students meeting eligibility criteria.</p>
              </div>

              <div className="about-info-card">
                <div className="about-card-icon">💰</div>
                <h3 className="about-card-title">What It Covers</h3>
                <p className="about-card-text">Tuition fees, examination fees, and maintenance allowance.</p>
              </div>

              <div className="about-info-card">
                <div className="about-card-icon">📅</div>
                <h3 className="about-card-title">Application Process</h3>
                <p className="about-card-text">Apply → Verification → Approval → Fund Disbursement.</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="about-cta">
              <button
                className="btn-apply-now"
                onClick={() => setActivePage("assistant")}
              >
                Apply Now
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ELIGIBILITY CHECKER PAGE */}
      {activePage === "eligibility" && (
        <section className="eligibility-section">
          <div className="eligibility-content">
            <h1 className="eligibility-title">Check Your Eligibility</h1>
            <p className="eligibility-subtitle">
              Answer a few quick questions to see if you qualify for the scholarship.
            </p>

            {/* Eligibility Criteria Card */}
            <div className="eligibility-criteria-card">
              <h3 className="criteria-heading">Eligibility Requirements:</h3>
              <ul className="criteria-list">
                <li>Must be a student of a recognized institution</li>
                <li>Minimum 60% marks in previous exam</li>
                <li>Family income below ₹3,00,000 per year</li>
                <li>Valid Aadhaar and bank account required</li>
              </ul>
            </div>

            {/* Eligibility Checker Form */}
            <div className="eligibility-checker-card">
              <h3 className="checker-heading">Self-Check Tool</h3>

              <div className="eligibility-form-row">
                <div className="eligibility-form-group">
                  <label>Percentage Scored (%)</label>
                  <input
                    type="number"
                    value={eligibilityPercentage}
                    onChange={(e) => setEligibilityPercentage(e.target.value)}
                    placeholder="e.g., 75"
                    className="eligibility-input"
                  />
                </div>

                <div className="eligibility-form-group">
                  <label>Family Income (₹)</label>
                  <input
                    type="number"
                    value={eligibilityIncome}
                    onChange={(e) => setEligibilityIncome(e.target.value)}
                    placeholder="e.g., 250000"
                    className="eligibility-input"
                  />
                </div>
              </div>

              <div className="eligibility-form-row">
                <div className="eligibility-form-group">
                  <label>Institution Type</label>
                  <select
                    value={eligibilityInstitution}
                    onChange={(e) => setEligibilityInstitution(e.target.value)}
                    className="eligibility-select"
                  >
                    <option>Government</option>
                    <option>Private</option>
                    <option>Recognized</option>
                  </select>
                </div>

                <div className="eligibility-form-group">
                  <label>Aadhaar Available?</label>
                  <select
                    value={eligibilityAadhaar}
                    onChange={(e) => setEligibilityAadhaar(e.target.value)}
                    className="eligibility-select"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              <button
                className="btn-check-eligibility"
                onClick={handleCheckEligibility}
              >
                Check Eligibility
              </button>

              {/* Result Message */}
              {eligibilityResult !== null && (
                <div className={`eligibility-result ${eligibilityResult ? "eligible" : "not-eligible"}`}>
                  {eligibilityResult ? (
                    <div className="result-message">
                      <span className="result-icon">✅</span>
                      <span className="result-text">You are likely eligible for this scholarship.</span>
                    </div>
                  ) : (
                    <div className="result-message">
                      <span className="result-icon">❌</span>
                      <span className="result-text">You may not meet the eligibility criteria.</span>
                    </div>
                  )}

                  {eligibilityResult && (
                    <button
                      className="btn-proceed-apply"
                      onClick={() => setActivePage("assistant")}
                    >
                      Proceed to Apply Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ASSISTANT PAGE - Existing UI */}
      {activePage === "assistant" && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">JnanaNet</h1>
              <p className="hero-subtitle">Cognitive Access Layer – Scholarship Assistant</p>
            </div>
          </section>

          {/* Main Content */}
          <section className="main-content">
            <div className="content-wrapper">
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option>English</option>
                      <option>Tamil</option>
                      <option>Hindi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Literacy Level</label>
                    <select
                      value={literacy}
                      onChange={(e) => setLiteracy(e.target.value)}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={voiceMode}
                        onChange={() => setVoiceMode(!voiceMode)}
                      />
                      Voice Mode
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={lowBandwidth}
                        onChange={() => setLowBandwidth(!lowBandwidth)}
                      />
                      Low Bandwidth
                    </label>
                  </div>
                </div>

                <div className="form-group full-width">
                  <input
                    type="text"
                    placeholder="Ask about scholarship process..."
                    className="input-field"
                  />
                  <button className="btn-primary">Ask</button>
                </div>

                <div className="form-group full-width">
                  <label>Upload Scholarship Form (PDF)</label>
                  <input type="file" accept="application/pdf" className="file-input" />
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <p>&copy; 2026 JnanaNet. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;