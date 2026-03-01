import { useMemo, useState } from "react";

function ScholarshipDetails({ scholarship, onBack, onCheckEligibility, eligibilityResult, isChecking }) {
  const [marks, setMarks] = useState("");
  const [income, setIncome] = useState("");

  const normalizedDocuments = useMemo(() => {
    if (!scholarship?.documents) return [];
    return Array.isArray(scholarship.documents) ? scholarship.documents : [];
  }, [scholarship]);

  if (!scholarship) {
    return (
      <section className="moon-section">
        <div className="glass stories-shell scholarship-details-shell">
          <h2>Scholarship Details</h2>
          <p>Scholarship not found.</p>
          <button className="btn-glass" onClick={onBack}>Back</button>
        </div>
      </section>
    );
  }

  const submitEligibilityCheck = (event) => {
    event.preventDefault();
    onCheckEligibility({
      marks: Number.parseFloat(marks || "0"),
      income: Number.parseFloat(income || "0"),
      scholarshipId: scholarship.id,
    });
  };

  return (
    <section className="moon-section">
      <div className="glass stories-shell scholarship-details-shell">
        <div className="scholarship-details-header">
          <h2>{scholarship.name}</h2>
          <button className="btn-glass" onClick={onBack}>Back to Scholarships</button>
        </div>

        <div className="scholarship-details-grid">
          <article className="scholarship-detail-card">
            <h3>Scholarship Name</h3>
            <p>{scholarship.name}</p>

            <h3>Provider</h3>
            <p>{scholarship.provider}</p>

            <h3>Amount</h3>
            <p>{scholarship.amount}</p>

            <h3>Eligibility Criteria</h3>
            <p>Course: {scholarship.course}</p>
            <p>Minimum Marks: {scholarship.minMarks}%</p>
            <p>Maximum Family Income: ₹{Number(scholarship.maxIncome).toLocaleString("en-IN")}</p>

            <h3>Required Documents</h3>
            <ul>
              {normalizedDocuments.map((document) => (
                <li key={`${scholarship.id}-${document}`}>{document}</li>
              ))}
            </ul>

            <h3>Deadline</h3>
            <p>{scholarship.deadline}</p>

            <h3>Description</h3>
            <p>{scholarship.description}</p>

            <a className="portal-link" href={scholarship.officialLink} target="_blank" rel="noreferrer">
              Official Link
            </a>
          </article>

          <article className="scholarship-detail-card">
            <h3>Eligibility Checker</h3>
            <p>Enter your academic marks and family income to check if you qualify.</p>

            <form className="detail-eligibility-form" onSubmit={submitEligibilityCheck}>
              <label>
                Marks (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(event) => setMarks(event.target.value)}
                  required
                />
              </label>

              <label>
                Family Income (₹)
                <input
                  type="number"
                  min="0"
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                  required
                />
              </label>

              <button className="btn-neon" type="submit" disabled={isChecking}>
                {isChecking ? "Checking..." : "Check Eligibility"}
              </button>
            </form>

            {eligibilityResult && (
              <div className={`result-box ${eligibilityResult.status === "Eligible" ? "ok" : "warn"}`}>
                <h4>{eligibilityResult.status}</h4>
                <p>{eligibilityResult.reason}</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export default ScholarshipDetails;
