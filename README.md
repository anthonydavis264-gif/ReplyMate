\# ReplyMate — AI Email Response Assistant



ReplyMate is a local AI-powered email support assistant that analyzes customer emails, identifies intent, sentiment, and urgency, extracts important information, and generates a suggested response for human review.



It uses a local Ollama model, so customer email content can be processed locally without sending it to a paid external AI API.



> \*\*Portfolio Project:\*\* AI Generalist / AI Application Development



\---



\## 🚀 What ReplyMate Does



ReplyMate helps a customer-support agent understand incoming emails faster.



A customer email is processed through the following workflow:



\*\*Customer Email → ReplyMate UI → Express API → Prompt Builder → Ollama → Guardrails → Structured Analysis → Human Review\*\*



The system produces:



\- Intent classification

\- Sentiment classification

\- Urgency classification

\- Email summary

\- Key information extraction

\- Required action

\- Missing-information detection

\- Suggested customer response



The final response is designed for \*\*human review and editing before sending\*\*.



\---



\## ✨ Key Features



\### 📧 Email Analysis



ReplyMate analyzes incoming customer emails and identifies the primary intent.



Supported intents include:



\- Information Request

\- Complaint

\- Refund Request

\- Cancellation Request

\- Delivery Issue

\- Technical Issue

\- Account Issue

\- Meeting / Scheduling

\- Feedback

\- Request for Assistance

\- Other



\---



\### 🧠 Sentiment Analysis



The system classifies customer sentiment as:



\- Positive

\- Neutral

\- Concerned

\- Frustrated

\- Angry

\- Mixed



\---



\### 🚨 Urgency Detection



Emails are categorized as:



\- Low

\- Medium

\- High



Deterministic rules are used alongside the AI classification to improve consistency for specific scenarios.



\---



\### 🔎 Structured Information Extraction



ReplyMate extracts useful information from the email, such as:



\- Customer name

\- Order number

\- Product

\- Issue

\- Account information

\- Meeting details

\- Other relevant information



\---



\### 🛡️ AI Safety Guardrails



ReplyMate includes deterministic security guardrails that operate after the LLM response.



The system detects sensitive credentials such as:



\- Passwords

\- OTPs

\- PINs

\- Verification codes

\- Security codes



When a customer provides a credential, ReplyMate prevents that credential from being repeated in the suggested response.



For example, if a customer provides an OTP, ReplyMate does \*\*not\*\* reproduce the OTP in the response.



Instead, the system directs the customer toward the approved account/password recovery process.



\---



\### 👤 Human-in-the-Loop



ReplyMate does not automatically send emails.



The AI produces a suggested response that a human support agent can:



\*\*Review → Edit → Send\*\*



This keeps the human agent responsible for the final communication.



\---



\## 🏗️ Architecture



```text

&#x20;                        ┌─────────────────────────┐

&#x20;                        │      CUSTOMER EMAIL     │

&#x20;                        │                         │

&#x20;                        │ Subject + Email Body    │

&#x20;                        └────────────┬────────────┘

&#x20;                                     │

&#x20;                                     ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │          REPLYMATE UI           │

&#x20;                   │                                │

&#x20;                   │ HTML + CSS + JavaScript        │

&#x20;                   │ Email Input / Analysis /       │

&#x20;                   │ Suggested Response             │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                             POST /api/analyze

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │          EXPRESS API            │

&#x20;                   │                                │

&#x20;                   │ Request validation              │

&#x20;                   │ API response handling           │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │         PROMPT BUILDER          │

&#x20;                   │                                │

&#x20;                   │ Structured JSON instructions    │

&#x20;                   │ Classification rules            │

&#x20;                   │ Grounding rules                 │

&#x20;                   │ Security instructions           │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │            OLLAMA              │

&#x20;                   │                                │

&#x20;                   │      gemma4:e2b-it-qat         │

&#x20;                   │                                │

&#x20;                   │          LOCAL AI              │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                             AI-generated JSON

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │       DETERMINISTIC             │

&#x20;                   │         GUARDRAILS              │

&#x20;                   │                                │

&#x20;                   │ • Intent correction             │

&#x20;                   │ • Priority rules                │

&#x20;                   │ • Credential detection          │

&#x20;                   │ • Sensitive-data sanitization   │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │       STRUCTURED ANALYSIS       │

&#x20;                   │                                │

&#x20;                   │ Intent / Sentiment / Urgency   │

&#x20;                   │ Summary / Key Information       │

&#x20;                   │ Action / Missing Information    │

&#x20;                   └───────────────┬────────────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                   ┌────────────────────────────────┐

&#x20;                   │        HUMAN REVIEW             │

&#x20;                   │                                │

&#x20;                   │ Suggested Response              │

&#x20;                   │                                │

&#x20;                   │        Review → Edit → Send     │

&#x20;                   └────────────────────────────────┘

```



\---



\## 🧪 Automated Evaluation



ReplyMate includes an automated evaluation script:



```text

replymate-evaluation.mjs

```



The evaluation tests six representative scenarios:



| Test | Purpose | Result |

|---|---|---|

| Delivery Issue | Delivery classification | ✅ PASS |

| Refund Request | Refund classification | ✅ PASS |

| Technical Issue | Technical-problem classification | ✅ PASS |

| Complaint | Complaint classification | ✅ PASS |

| Meeting / Scheduling | Scheduling classification | ✅ PASS |

| Password + OTP Safety | Credential-safety validation | ✅ PASS |



\### Final Result



```text

Passed: 6 / 6

Failed: 0 / 6



ALL TESTS PASSED

```



The safety test specifically verifies that an OTP supplied by a customer is not exposed in the generated response.



\---



\## 🛠️ Technology Stack



\### Frontend



\- HTML5

\- CSS3

\- Vanilla JavaScript



\### Backend



\- Node.js

\- Express 5



\### AI



\- Ollama

\- `gemma4:e2b-it-qat`



\### Testing



\- Node.js evaluation script

\- Six automated evaluation scenarios

\- Manual end-to-end UI testing



\---



\## 📁 Project Structure



```text

ReplyMate/

│

├── package.json

├── package-lock.json

│

├── server.mjs

├── replymate-analysis.mjs

├── replymate-evaluation.mjs

│

└── public/

&#x20;   ├── index.html

&#x20;   ├── app.js

&#x20;   ├── styles.css

&#x20;   ├── index.html.backup

&#x20;   └── styles.css.backup

```



\### Important Files



\*\*`server.mjs`\*\*



Express server and API endpoints.



\*\*`replymate-analysis.mjs`\*\*



Core AI analysis logic, Prompt Builder, normalization, deterministic guardrails, credential protection, and suggested-response generation.



\*\*`replymate-evaluation.mjs`\*\*



Automated evaluation suite.



\*\*`public/index.html`\*\*



ReplyMate user interface.



\*\*`public/app.js`\*\*



Frontend behavior and API communication.



\*\*`public/styles.css`\*\*



Responsive application styling.



\---



\## ⚙️ How It Works



\### 1. Customer email is entered



The support agent pastes the incoming customer email into ReplyMate.



\### 2. Request is sent to the local API



The browser sends the email to:



```text

POST /api/analyze

```



\### 3. Prompt Builder creates the AI instruction



ReplyMate builds a structured prompt containing:



\- Classification requirements

\- Output schema

\- Intent definitions

\- Sentiment rules

\- Urgency rules

\- Grounding requirements

\- Security instructions



\### 4. Ollama processes the request



The prompt is sent to the locally running Ollama model:



```text

gemma4:e2b-it-qat

```



\### 5. AI response is normalized



ReplyMate parses the model's JSON response and normalizes the expected fields.



\### 6. Deterministic guardrails are applied



Rules are applied after the LLM response to handle specific cases consistently.



This includes:



\- Intent corrections

\- Urgency corrections

\- Sentiment corrections

\- Credential detection

\- Sensitive-information sanitization



\### 7. Suggested response is generated



ReplyMate creates a conservative customer-facing response.



The human support agent reviews and edits it before using it.



\---



\## 🔐 Security Design



ReplyMate follows a conservative approach to sensitive credentials.



If an incoming email contains something like:



```text

My OTP is 482913.

```



ReplyMate detects the presence of a security credential.



The actual credential is not included in the customer-facing response.



Instead, the response directs the customer toward the approved recovery process.



\### Security principle



> \*\*Never request, use, verify, repeat, or disclose passwords, OTPs, PINs, or security codes provided in customer emails.\*\*



The project also avoids making unsupported claims such as:



\- "Your password has been reset."

\- "We verified your OTP."

\- "We processed your OTP."

\- "Your account has been unlocked."



unless such actions are actually supported by the application.



\---



\## 💻 Running ReplyMate Locally



\### Prerequisites



Install:



\- Node.js

\- Ollama



Make sure Ollama is running locally.



The application expects Ollama at:



```text

http://localhost:11434

```



Make sure the required model is available:



```text

gemma4:e2b-it-qat

```



\### Install dependencies



From the ReplyMate project directory:



```powershell

npm install

```



\### Start ReplyMate



```powershell

npm start

```



The application runs on:



```text

http://localhost:3000

```



Open that address in your browser.



\---



\## 🧪 Run the Automated Evaluation



With ReplyMate running, open another PowerShell window and execute:



```powershell

node .\\replymate-evaluation.mjs

```



Expected result:



```text

Passed: 6 / 6

Failed: 0 / 6



ALL TESTS PASSED

```



\---



\## 📸 Portfolio Demonstration



A typical demonstration can show:



1\. Customer email entered into ReplyMate

2\. AI analysis generated

3\. Intent identified

4\. Sentiment identified

5\. Urgency identified

6\. Important information extracted

7\. Suggested response generated

8\. Human review before sending

9\. Automated evaluation showing `6/6` passed

10\. Password + OTP safety scenario



\---



\## 🎯 What I Learned From This Project



This project helped me practice several AI application development concepts:



\- Working with local LLMs

\- Ollama integration

\- Prompt engineering

\- Structured JSON generation

\- LLM output normalization

\- Deterministic AI guardrails

\- Sensitive-data protection

\- Human-in-the-loop AI design

\- REST API development

\- Frontend/API integration

\- AI evaluation

\- Scenario-based testing

\- End-to-end application validation



\---



\## 🔮 Possible Future Improvements



Potential future versions could include:



\- Email inbox integration

\- Multiple local LLM options

\- Confidence indicators

\- Custom company knowledge bases

\- Support-team analytics

\- Response tone controls

\- Conversation history

\- Additional automated evaluation scenarios

\- RAG-based company-policy grounding

\- Authentication and role-based access

\- Production deployment



These are future possibilities and are \*\*not part of the current validated implementation\*\*.



\---



\## ⚠️ Project Scope



ReplyMate is a \*\*portfolio/demo application\*\*.



It currently runs locally and is designed to demonstrate AI application concepts rather than function as a production email-support platform.



AI-generated content should always be reviewed by a human before being sent to a customer.



\---



\## 👨‍💻 Project



\*\*ReplyMate — AI Email Response Assistant\*\*



Built as a hands-on AI application project using local AI, prompt engineering, deterministic guardrails, and automated evaluation.



\*\*Current evaluation:\*\* `6/6 tests passed` ✅

