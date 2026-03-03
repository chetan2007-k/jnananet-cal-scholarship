# JnanaNet – AI Powered Scholarship Discovery Platform for Bharat

## Project Overview
JnanaNet is a hackathon project designed to help students across India discover scholarships, financial aid opportunities, and government education schemes in a simple and guided way. The platform combines curated scholarship portals with an AI assistant so students can quickly understand where to apply based on their needs. Instead of manually searching across many websites, students get structured guidance and direct links to trusted official platforms.

### Project Links
- Frontend URL: http://jnananet-frontend-chetan.s3-website.eu-north-1.amazonaws.com/
- GitHub Repository: https://github.com/chetan2007-k/jnananet-cal-scholarship

## System Architecture
The system follows a lightweight cloud architecture suitable for rapid hackathon development and future growth.

### Core Components
1. **Frontend (AWS S3 Hosted Website)**
   - A static, mobile-friendly web interface hosted on Amazon S3.
   - Allows students to browse scholarship resources and interact with the AI assistant.

2. **Backend API (AWS EC2 Hosted Service)**
   - A Node.js backend running on an Amazon EC2 instance.
   - Handles API requests from the frontend and routes scholarship/AI queries.

3. **AI Assistant Layer**
   - Processes scholarship-related user queries.
   - Returns guidance, suggestions, and relevant scholarship portal recommendations.

4. **External Scholarship Portals**
   - Trusted sources such as:
     - National Scholarship Portal (NSP)
     - Buddy4Study
     - Vidya Lakshmi
   - Students are redirected to official websites for application and verification.

5. **Future Multilingual AI Support**
   - Planned support for Indian languages to improve accessibility for students from diverse regions.

## Architecture Flow
The high-level interaction flow is:

**User → Frontend Website → Backend API → AI Assistant → Scholarship Suggestion → Redirect to Official Portal**

### Flow Explanation
1. A student opens the JnanaNet frontend website.
2. The student submits a scholarship-related query or browses options.
3. The frontend sends the request to the backend API hosted on EC2.
4. The backend invokes the AI assistant logic to process user intent.
5. The system returns curated scholarship suggestions.
6. The student is redirected to the relevant official scholarship portal for next steps.

## AWS Services Used
JnanaNet currently uses core AWS services and is designed for extension.

### Current Usage
- **Amazon S3**
  - Hosts the static frontend website with low operational overhead.
- **Amazon EC2**
  - Hosts the backend server and business logic processing.

### Optional/Scalable AWS Services
- **Amazon API Gateway**
  - For managed API exposure, request throttling, and versioning.
- **AWS Lambda**
  - For serverless query processing and event-driven tasks.
- **Amazon DynamoDB**
  - For scalable storage of user interactions, FAQs, and recommendation metadata.
- **Amazon Bedrock**
  - For managed foundation model integration for AI-powered response generation.

## AI Design
The AI assistant is designed to simplify scholarship discovery and reduce confusion for students.

### AI Responsibilities
- Understand scholarship-related questions in natural language.
- Provide practical guidance on where to search and what to check.
- Suggest relevant scholarship portals based on user query context.
- Assist with common concerns like eligibility, deadlines, and documents (as guidance).

### Fallback Response Mechanism
If the AI service is unavailable or fails to respond:
- The backend returns a graceful fallback message.
- The frontend presents curated default scholarship portals and FAQs.
- The user can continue navigation without service interruption.

This ensures continuity and a reliable user experience even during partial outages.

## Scalability Design
JnanaNet can scale to serve millions of students through cloud-native expansion.

### Scalability Strategy
- Use CDN + S3 for high-traffic static content delivery.
- Add load balancing and auto-scaling groups for EC2 backend instances.
- Move selected backend workloads to Lambda for elastic scaling.
- Introduce managed databases (for example, DynamoDB) for high-throughput access.
- Cache popular queries and FAQs to reduce backend load.
- Separate AI inference service calls using asynchronous patterns where needed.

This approach enables both horizontal scaling and cost control as usage grows.

## Security Considerations
Security is critical when guiding students to external platforms.

### Key Security Practices
- Enforce secure API communication using HTTPS/TLS.
- Validate and sanitize user input before backend/AI processing.
- Redirect users only to trusted, verified scholarship portal domains.
- Prevent unsafe or untrusted URL redirection.
- Log and monitor API activity for anomaly detection and operational visibility.

These controls help maintain trust, data safety, and responsible user guidance.