# JnanaNet – System Design

## Architecture Overview
JnanaNet follows a **three-layer intelligent decision architecture** to transform raw student input into explainable scholarship guidance.

### Layer 1 → Data + filtering
- Captures structured user profile data.
- Filters scholarships based on eligibility constraints and profile alignment.
- Normalizes attributes for downstream scoring and reasoning.

### Layer 2 → Scoring + prediction
- Applies eligibility logic and probability scoring.
- Evaluates profile strength, risk posture, and scholarship-fit signals.
- Supports comparative analytics and recommendation prioritization.

### Layer 3 → AI explanation
- Converts scoring outputs into human-readable guidance.
- Provides multilingual, context-aware assistance through AI chat.
- Delivers decision-support narratives for student action planning.

## Core Components
- **Eligibility Engine** — Determines rule-based and model-assisted eligibility outcomes.
- **Success Probability Engine** — Computes confidence-oriented success estimates.
- **Insight Engine** — Generates actionable intelligence from user and scholarship context.
- **What-If Simulator** — Evaluates scenario-based profile changes and projected impact.
- **Recommendation Engine** — Produces ranked scholarship suggestions with decision tags.

## Data Flow
`User → Backend → Scoring → AI → UI`

### Flow Description
1. The user submits profile and scholarship interaction data from the frontend.
2. The backend validates and routes inputs to eligibility, scoring, and recommendation services.
3. Scoring modules compute eligibility, probability, profile strength, and risk metrics.
4. AI services generate explanations and guidance from computed intelligence outputs.
5. The UI presents decision-ready results, including simulations, comparisons, and recommendations.

## Platform Context
- **Frontend:** React + Vite
- **Backend:** Node + Express
- **AI Services:** Amazon Bedrock integration
- **Storage/Upload:** AWS S3

## Design Principles
- **modular** — Service-level separation enables maintainable evolution.
- **explainable** — All core scores map to interpretable user-facing reasoning.
- **scalable** — Components are structured for incremental load and feature growth.
- **user-centric** — The system prioritizes clarity, trust, and actionability for students.