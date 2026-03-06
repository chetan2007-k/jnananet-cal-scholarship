# JnanaNet – Requirements Specification

## Functional Requirements

### FR1: User profile input
The platform shall capture structured student profile inputs such as academic score, family income, state, category, gender, and current study level to support downstream intelligence modules.

### FR2: Eligibility detection
The system shall evaluate scholarship eligibility using rule-based checks and provide interpretable acceptance or rejection rationale.

### FR3: Success probability calculation
The system shall compute scholarship success probability scores based on profile quality and scholarship-fit factors.

### FR4: What-If simulation
The platform shall allow simulated profile adjustments to estimate how changes in key attributes influence success probability.

### FR5: Recommendation engine
The system shall generate ranked scholarship recommendations aligned with user profile constraints and opportunities.

### FR6: Scholarship comparison
The platform shall support side-by-side comparison of shortlisted scholarships for informed decision-making.

### FR7: AI chat guidance
The system shall provide multilingual AI-guided scholarship support through conversational interactions.

### FR8: Tracking + reminders
The platform shall support application progress visibility and time-sensitive reminder cues for scholarship deadlines.

### FR9: Ticket/contact system
The system shall provide a support path for user queries through contact/ticket-oriented assistance channels.

## Non-Functional Requirements

### Performance → fast response
The platform should return scholarship search, scoring, and guidance responses with low latency suitable for interactive use.

### Scalability → modular backend
The backend should remain modular to support incremental growth in users, scholarships, and intelligence services without architectural disruption.

### Usability → multilingual UX
The user experience should remain clear, accessible, and multilingual-ready for diverse student populations.

### Security → auth + validation
The platform should enforce request validation, controlled access patterns, and secure handling of user-provided data and uploads.

### Reliability → stable APIs
Core APIs should remain stable and predictable, with graceful fallback behavior for non-critical AI failure scenarios.
