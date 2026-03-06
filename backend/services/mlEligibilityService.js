const path = require("path");
const { spawn } = require("child_process");

const PYTHON_COMMAND = process.env.PYTHON_COMMAND || "python";
const PREDICT_SCRIPT_PATH = path.join(__dirname, "..", "ml", "predict.py");

function normalizeState(state = "") {
  const value = String(state).trim().toLowerCase();
  const mapping = {
    "tamil nadu": "TN",
    tn: "TN",
    "andhra pradesh": "AP",
    ap: "AP",
    telangana: "TS",
    ts: "TS",
  };

  return mapping[value] || "TN";
}

function normalizeCaste(caste = "") {
  const value = String(caste).trim().toUpperCase();
  const mapping = {
    GENERAL: "OC",
    GEN: "OC",
    OC: "OC",
    OBC: "OBC",
    SC: "SC",
    ST: "ST",
    EWS: "OC",
  };

  return mapping[value] || "OC";
}

function normalizeCourse(course = "") {
  const value = String(course).trim().toLowerCase();
  if (value.includes("engineering") || value.includes("b.tech") || value.includes("btech")) return "Engineering";
  if (value.includes("b.sc") || value.includes("bsc")) return "BSc";
  if (value.includes("b.com") || value.includes("bcom")) return "BCom";
  if (value.includes("bba")) return "BBA";
  if (value.includes("arts")) return "Arts";
  return "Engineering";
}

function fallbackResult() {
  return {
    probability: 0,
    explanation: [
      "ML prediction unavailable right now",
      "Run ML training setup and retry",
    ],
  };
}

async function predictEligibility(profileData = {}) {
  const marks = Number.parseFloat(profileData.marks || "0");
  const income = Number.parseFloat(profileData.income || "0");
  const caste = normalizeCaste(profileData.caste || profileData.category || "OC");
  const state = normalizeState(profileData.state || "TN");
  const course = normalizeCourse(profileData.course || "Engineering");

  if (!Number.isFinite(marks) || !Number.isFinite(income)) {
    return {
      probability: 0,
      explanation: ["Invalid marks/income input for ML prediction"],
    };
  }

  return new Promise((resolve) => {
    const args = [
      PREDICT_SCRIPT_PATH,
      String(marks),
      String(income),
      caste,
      state,
      course,
    ];

    const pythonProcess = spawn(PYTHON_COMMAND, args, {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      pythonProcess.kill();
      resolve({
        probability: 0,
        explanation: ["ML prediction timed out"],
      });
    }, 8000);

    pythonProcess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    pythonProcess.on("close", () => {
      clearTimeout(timeout);

      try {
        const trimmed = stdout.trim();
        if (!trimmed) {
          resolve(fallbackResult());
          return;
        }

        const parsed = JSON.parse(trimmed);
        resolve({
          probability: Number.parseInt(parsed?.probability, 10) || 0,
          explanation: Array.isArray(parsed?.explanation) ? parsed.explanation : ["No explanation available"],
        });
      } catch {
        resolve({
          probability: 0,
          explanation: [
            "ML prediction parse failed",
            stderr ? stderr.trim() : "No stderr output",
          ],
        });
      }
    });

    pythonProcess.on("error", () => {
      clearTimeout(timeout);
      resolve(fallbackResult());
    });
  });
}

module.exports = {
  predictEligibility,
};
