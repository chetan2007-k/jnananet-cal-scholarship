import { useState } from "react";

const API_BASE = "http://13.62.42.76:5000"; // ✅ AWS Backend URL

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [literacy, setLiteracy] = useState("Low");
  const [language, setLanguage] = useState("English");
  const [pdfResponse, setPdfResponse] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🎤 Voice Recognition
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang =
      language === "Hindi"
        ? "hi-IN"
        : language === "Telugu"
        ? "te-IN"
        : "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
    };

    recognition.start();
  };

  const sendRequest = async () => {
    if (!question.trim()) {
      setResponse("Please enter a question.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(`${API_BASE}/api/guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language, literacy }),
      });

      const data = await res.json();
      setResponse(data.message || "No response received.");
    } catch (error) {
      setResponse("Unable to connect to backend.");
    }

    setLoading(false);
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setPdfResponse(data.content);
    } catch {
      setPdfResponse("PDF upload failed.");
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        background: lowBandwidth
          ? "#f4f4f4"
          : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      }}
    >
      <div style={styles.card}>
        <h1 style={styles.logo}>JnanaNet</h1>
        <p style={styles.tagline}>
          Cognitive Access Layer – Scholarship Assistant
        </p>

        <div style={styles.controlRow}>
          <div style={styles.controlGroup}>
            <label>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={styles.select}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label>Literacy Level</label>
            <select
              value={literacy}
              onChange={(e) => setLiteracy(e.target.value)}
              style={styles.select}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div style={styles.toggleRow}>
          <label>
            <input
              type="checkbox"
              checked={voiceMode}
              onChange={() => setVoiceMode(!voiceMode)}
            />
            Voice Mode
          </label>

          <label>
            <input
              type="checkbox"
              checked={lowBandwidth}
              onChange={() => setLowBandwidth(!lowBandwidth)}
            />
            Low Bandwidth
          </label>
        </div>

        <div style={styles.inputSection}>
          <input
            type="text"
            placeholder={
              voiceMode
                ? "🎙 Speak your question..."
                : "Ask about scholarship process..."
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={styles.input}
          />

          {voiceMode && (
            <button onClick={startListening} style={styles.micButton}>
              🎤
            </button>
          )}

          <button onClick={sendRequest} style={styles.button}>
            Ask
          </button>
        </div>

        {loading && <div style={styles.loading}>Processing...</div>}

        <div style={styles.uploadSection}>
          <label>Upload Scholarship Form (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
          />
        </div>

        {pdfResponse && (
          <div style={styles.previewBox}>
            <h4>PDF Content Preview</h4>
            <div style={{ whiteSpace: "pre-line" }}>{pdfResponse}</div>
          </div>
        )}

        {response && (
          <div style={styles.responseBox}>
            <h3>AI Guidance</h3>
            <div style={{ whiteSpace: "pre-line" }}>{response}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  logo: {
    margin: 0,
    fontSize: "30px",
    color: "#1e3a8a",
    fontWeight: "700",
  },
  tagline: {
    marginTop: "8px",
    marginBottom: "30px",
    color: "#64748b",
    fontSize: "15px",
  },
  controlRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  controlGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  toggleRow: {
    display: "flex",
    gap: "25px",
    marginBottom: "25px",
    fontSize: "14px",
  },
  inputSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },
  micButton: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#f1f5f9",
    cursor: "pointer",
  },
  button: {
    padding: "14px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  loading: {
    marginBottom: "15px",
    color: "#2563eb",
    fontWeight: "600",
  },
  uploadSection: {
    marginBottom: "20px",
  },
  previewBox: {
    marginTop: "15px",
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  responseBox: {
    marginTop: "25px",
    padding: "22px",
    background: "#eff6ff",
    borderRadius: "14px",
    border: "1px solid #bfdbfe",
  },
};

export default App;