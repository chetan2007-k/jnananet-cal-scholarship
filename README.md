# JnanaNet – AI Powered Multilingual Scholarship Discovery Platform

🏆 AI for Bharat Hackathon 2026 Submission

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-blue)
![Node.js](https://img.shields.io/badge/backend-Node.js-green)
![AWS](https://img.shields.io/badge/cloud-AWS-orange)

## Overview
JnanaNet helps Indian students discover and apply for scholarships through a simple AI-assisted experience. The platform combines scholarship guidance, eligibility analysis, multilingual support, and application-oriented workflows so students can move from confusion to action quickly.

## Live Demo

Frontend:  
http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com

Backend API:  
Running on AWS EC2

## How It Works

1. Student asks the AI assistant about scholarships.
2. JnanaNet analyzes eligibility criteria and user profile.
3. The system recommends suitable scholarships.
4. Students are guided to official portals to apply.

## Problem Statement
Millions of students in India miss scholarship opportunities due to:
- Lack of awareness about available schemes
- Language barriers while understanding eligibility and process
- Complex and fragmented scholarship criteria

## Solution
JnanaNet provides:
- AI scholarship assistant
- Eligibility checker
- Multilingual interface
- Scholarship portal directory
- Application guidance

## Features
- AI Assistant for scholarship guidance
- Scholarship eligibility checker
- Multilingual interface (English, Hindi, Tamil, Telugu)
- Scholarship recommendation engine
- Document guidance
- Application tracker
- Scholarship portal directory

## Architecture

### Frontend
- React + Vite
- Hosted as static website

### Backend
- Node.js + Express API

### Cloud Infrastructure
- Amazon S3 (frontend hosting)
- Amazon EC2 (backend server)

### AI Layer
- AI guidance engine (currently rule-based)
- Future integration with AWS Bedrock

## System Architecture

Frontend → React Web App  
Backend → Node.js API  
Cloud → AWS S3 + AWS EC2  
AI Engine → Scholarship reasoning module

_Architecture diagram will be added in `docs/`._

## Project Structure

```text
jnananet-cal-scholarship/
├── frontend/   # React application, UI, AI assistant interface
├── backend/    # Node.js server, API routes, scholarship logic
└── docs/       # Architecture diagrams and screenshots
```

### frontend/
React application, UI, AI assistant interface.

### backend/
Node.js server, API routes, scholarship logic.

### docs/
Architecture diagrams and screenshots.

## Setup Instructions

### 1) Clone Repository
```bash
git clone https://github.com/chetan2007-k/jnananet-cal-scholarship
cd jnananet-cal-scholarship
```

### 2) Install and Run Backend
```bash
cd backend
npm install
node server.js
```

### 3) Install and Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Screenshots

### Homepage UI
_Add screenshot here_

### AI Assistant
_Add screenshot here_

### Eligibility Checker
_Add screenshot here_

### Scholarship Recommendations
_Add screenshot here_

## Future Enhancements
- Integration with AWS Bedrock AI models
- Voice AI assistant for rural students
- AI-based scholarship recommendation engine
- Mobile app version

## Hackathon
AI for Bharat Hackathon 2026 submission.

## License
This project is licensed under the MIT License.
