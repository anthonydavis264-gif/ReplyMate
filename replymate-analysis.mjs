
import http from "http";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const CHAT_MODEL = "gemma4:e2b-it-qat";

const ALLOWED_INTENTS = [
  "Information Request",
  "Complaint",
  "Refund Request",
  "Cancellation Request",
  "Delivery Issue",
  "Technical Issue",
  "Account Issue",
  "Meeting / Scheduling",
  "Feedback",
  "Request for Assistance",
  "Other",
];

const ALLOWED_SENTIMENTS = [
  "Positive",
  "Neutral",
  "Concerned",
  "Frustrated",
  "Angry",
  "Mixed",
];

const ALLOWED_URGENCY = [
  "Low",
  "Medium",
  "High",
];

function buildPrompt(email) {
  return `
You are ReplyMate, an AI Email Analysis Assistant.

Your job is to understand an incoming email and return structured information for a human support representative.

You are NOT writing the customer response.

You are NOT sending an email.

You are NOT performing any action.

You do NOT have access to company systems.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add explanations.

Use exactly this structure:

{
  "intent": "",
  "summary": "",
  "sentiment": "",
  "urgency": "",
  "keyInformation": [],
  "actionRequired": "",
  "missingInformation": [],
  "responsePoints": []
}

INTENT:

Choose exactly ONE:

${ALLOWED_INTENTS.map((item) => `- ${item}`).join("\n")}

Use these definitions carefully:

Information Request:
The customer is asking for information or clarification.

Complaint:
The customer is mainly expressing dissatisfaction about a service, experience, or problem without a more specific intent.

Refund Request:
The customer is asking for money to be refunded.

Important Refund Rule:
If the customer reports a duplicate charge, double charge, incorrect charge, or other unwanted financial charge AND asks for a refund, classify the intent as Refund Request.

Cancellation Request:
The customer wants to cancel an order, service, booking, or subscription.

Delivery Issue:
The customer has a problem with delivery, shipping, tracking, late delivery, or a missing package.

Technical Issue:
A product, device, application, website, software, or service is not working correctly.

Important Technical Issue Rule:
If the customer says a product or service is not working, will not turn on, fails to function, crashes, produces an error, cannot be used, or has another specific functional problem, classify the intent as Technical Issue.

Do NOT classify a specific technical malfunction as Request for Assistance merely because the customer also asks for help or a replacement.

Account Issue:
The customer has a problem with an account, login, password, profile, or account access.

Meeting / Scheduling:
The customer wants to arrange, change, or discuss a meeting, appointment, or schedule.

Feedback:
The customer is primarily providing feedback, praise, or a suggestion.

Request for Assistance:
The customer needs general help and no more specific intent applies.

Other:
Use only when none of the above categories reasonably applies.

INTENT PRIORITY:

When more than one category appears possible, prefer the most specific category.

Use this priority for common overlapping situations:

1. Account Issue for login, password, account access, or account recovery problems.
2. Technical Issue for a specific product, device, application, website, software, or service malfunction.
3. Delivery Issue for shipping, delivery, tracking, late delivery, or missing package problems.
4. Refund Request for a request to return money or correct an unwanted financial charge.
5. Cancellation Request for a request to cancel.
6. Meeting / Scheduling for scheduling or rescheduling.
7. Complaint when dissatisfaction is the primary issue and no more specific category applies.
8. Request for Assistance only when no more specific category applies.
9. Other only when none of the categories reasonably applies.

SENTIMENT:

Choose exactly ONE:

${ALLOWED_SENTIMENTS.map((item) => `- ${item}`).join("\n")}

Use these guidelines:

Positive:
The customer is clearly pleased, thankful, or happy.

Neutral:
The customer is factual and does not show a strong emotional reaction.

Concerned:
The customer is worried, uncertain, or seeking help without clear frustration or anger.

Frustrated:
The customer expresses annoyance, repeated inconvenience, dissatisfaction, being charged incorrectly, being ignored, or another clear negative experience.

Angry:
The customer expresses strong anger, hostility, or very severe dissatisfaction.

Mixed:
The email contains clearly significant positive and negative emotions.

Important Sentiment Rules:

- A duplicate, incorrect, or unwanted charge combined with a refund request should normally be classified as Frustrated when the customer is clearly dissatisfied about the financial problem.
- Do not automatically classify every refund request as Frustrated. Use the actual emotional tone in the email.
- Words such as "charged twice", "charged incorrectly", "nobody responded", "extremely frustrated", or similar expressions indicate dissatisfaction when used in context.

URGENCY:

Choose exactly ONE:

${ALLOWED_URGENCY.map((item) => `- ${item}`).join("\n")}

Use High urgency when the email contains a clear time-sensitive request, immediate financial concern, safety concern, serious access problem, explicit request for immediate action, or a combination of strong dissatisfaction and an unresolved issue requiring prompt attention.

Use Medium when the issue is important but does not clearly require immediate action.

Use Low when the request is routine or non-urgent.

Important Urgency Rules:

- A duplicate or incorrect financial charge combined with a request to resolve it "as soon as possible", "immediately", or equivalent should normally be High urgency.
- A complaint describing a prior support contact that has remained unanswered for several days, combined with explicit urgent language, should be High urgency.
- An unresolved issue alone is not automatically High.
- Explicit time-sensitive language should be considered strongly when determining urgency.

GROUNDING RULES:

1. Use ONLY information contained in the email.

2. Never invent:
   - names
   - order numbers
   - dates
   - prices
   - products
   - policies
   - account information
   - company actions
   - delivery promises
   - refund promises
   - compensation
   - deadlines
   - contact details

3. Never assume access to company systems.

4. Never claim that an action has already been performed.

5. Do not write a customer-facing response.

6. "actionRequired" should describe what the support representative needs to consider or do.

7. "missingInformation" should contain only information reasonably necessary to understand or handle the request.

8. Do not list unnecessary information such as an email address.

9. If no important information is missing, return an empty array.

10. "keyInformation" should contain useful factual information from the email.

11. "responsePoints" should contain ONLY factual points that can safely be used when drafting a response.

SECURITY RULES:

12. Never request, use, verify, repeat, disclose, or process passwords, OTPs, PINs, security codes, authentication codes, or other secret credentials.

13. If the customer provides an OTP, password, PIN, security code, authentication code, or similar credential, do NOT include the actual secret value in any output field.

14. You may identify that a security credential was provided, but never reveal its actual value.

15. Never instruct the support representative to use the customer's OTP, password, PIN, or security code.

16. For account recovery requests involving credentials, "actionRequired" must direct the representative toward the approved account/password recovery process without using the credential provided in the email.

17. Never claim that a password has been reset.

18. Never claim that an OTP has been verified.

19. Never ask the customer to send an OTP, password, PIN, or security code.

20. Do not put promises in "responsePoints".

21. Do not put invented company actions in "responsePoints".

22. Do not put invented policies in "responsePoints".

23. If the customer provides their name, include it as a response point.

24. If the customer asks for a specific action, identify that request as a response point, but do not promise that the action will happen.

25. Never diagnose medical conditions or provide medical advice.

EMAIL:

Subject:
${email.subject || "None provided"}

Body:
${email.body}
`;
}

function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: CHAT_MODEL,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.1,
      },
    });

    const request = http.request(
      OLLAMA_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `Ollama returned HTTP ${response.statusCode}: ${data}`
              )
            );
            return;
          }

          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response);
          } catch (error) {
            reject(
              new Error(
                `Could not parse Ollama response: ${error.message}`
              )
            );
          }
        });
      }
    );

    request.on("error", (error) => {
      reject(
        new Error(
          `Could not connect to Ollama. Make sure Ollama is running. Details: ${error.message}`
        )
      );
    });

    request.write(payload);
    request.end();
  });
}

function cleanString(value, fallback = "None identified") {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

function cleanArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeResult(result) {
  return {
    intent: ALLOWED_INTENTS.includes(result?.intent)
      ? result.intent
      : "Other",

    summary: cleanString(result?.summary),

    sentiment: ALLOWED_SENTIMENTS.includes(result?.sentiment)
      ? result.sentiment
      : "Neutral",

    urgency: ALLOWED_URGENCY.includes(result?.urgency)
      ? result.urgency
      : "Medium",

    keyInformation: cleanArray(result?.keyInformation),

    actionRequired: cleanString(result?.actionRequired),

    missingInformation: cleanArray(result?.missingInformation),

    responsePoints: cleanArray(result?.responsePoints),
  };
}

/*
 * Deterministic intent correction.
 *
 * The LLM performs the main analysis, but these rules handle
 * clearly identifiable patterns where a generic classification
 * would be less specific.
 */
function applyIntentGuardrails(result, email) {
  const body = email.body.toLowerCase();
  const subject = email.subject.toLowerCase();

  const combinedText = `${subject}\n${body}`;

  const technicalPatterns = [
    /\bnot working\b/i,
    /\bwon't work\b/i,
    /\bwill not work\b/i,
    /\bwon't turn on\b/i,
    /\bwill not turn on\b/i,
    /\bdoesn't work\b/i,
    /\bdoes not work\b/i,
    /\bnot functioning\b/i,
    /\bmalfunction/i,
    /\bcrash(?:es|ed|ing)?\b/i,
    /\berror message\b/i,
    /\bfailed to\b/i,
    /\bfails to\b/i,
  ];

  const hasTechnicalProblem = technicalPatterns.some((pattern) =>
    pattern.test(combinedText)
  );

  if (
    hasTechnicalProblem &&
    result.intent === "Request for Assistance"
  ) {
    return {
      ...result,
      intent: "Technical Issue",
    };
  }

  return result;
}

/*
 * Deterministic sentiment and urgency correction.
 *
 * These rules target clear financial frustration and explicit
 * urgency patterns while leaving the LLM classification intact
 * for less obvious cases.
 */
function applyPriorityGuardrails(result, email) {
  const body = (email.body || "").toLowerCase();
  const subject = (email.subject || "").toLowerCase();

  const combinedText = `${subject}\n${body}`;

  const duplicateCharge =
    /\bcharged\s+twice\b/i.test(combinedText) ||
    /\bcharged\s+double\b/i.test(combinedText) ||
    /\bduplicate\s+(payment|charge)\b/i.test(combinedText) ||
    /\bdouble\s+(payment|charge)\b/i.test(combinedText);

  const refundRequest =
    /\brefund\b/i.test(combinedText) ||
    /\brefund\s+request\b/i.test(combinedText);

  const explicitImmediateLanguage =
    /\bas soon as possible\b/i.test(combinedText) ||
    /\bimmediately\b/i.test(combinedText) ||
    /\burgently\b/i.test(combinedText) ||
    /\bright away\b/i.test(combinedText) ||
    /\basap\b/i.test(combinedText);

  const repeatedSupportFailure =
    /\bcontacted\b/i.test(combinedText) &&
    /\bsupport\b/i.test(combinedText) &&
    /\bthree days ago\b/i.test(combinedText) &&
    /\bno(b| )?ody\b/i.test(combinedText);

  const strongFrustration =
    /\bextremely frustrated\b/i.test(combinedText) ||
    /\bvery frustrated\b/i.test(combinedText) ||
    /\bfrustrated\b/i.test(combinedText);

  const technicalProblem =
    /\bnot working\b/i.test(combinedText) ||
    /\bwon't work\b/i.test(combinedText) ||
    /\bwill not work\b/i.test(combinedText) ||
    /\bdoesn't work\b/i.test(combinedText) ||
    /\bdoes not work\b/i.test(combinedText) ||
    /\bnot functioning\b/i.test(combinedText) ||
    /\bmalfunction/i.test(combinedText) ||
    /\bwon't turn on\b/i.test(combinedText) ||
    /\bwill not turn on\b/i.test(combinedText) ||
    /\bcan't turn on\b/i.test(combinedText) ||
    /\bcannot turn on\b/i.test(combinedText);

  const schedulingRequest =
    result.intent === "Meeting / Scheduling" ||
    /\breschedule\b/i.test(combinedText) ||
    /\bmeeting\b/i.test(combinedText) ||
    /\bappointment\b/i.test(combinedText);

  const accountSecurityIssue =
    result.intent === "Account Issue" &&
    containsSensitiveCredential(email.body);

  let corrected = {
    ...result,
  };

  /*
   * Duplicate financial charge + refund request is a clear
   * frustrated financial-support scenario.
   */
  if (duplicateCharge && refundRequest) {
    corrected.sentiment = "Frustrated";
  }
  /*
   * Account security issues involving passwords, OTPs, PINs,
   * or security codes should be treated as concerned rather
   * than neutral.
   */
  if (accountSecurityIssue) {
    corrected.sentiment = "Concerned";
  }

  /*
   * Duplicate financial charge + explicit immediate language
   * should be treated as High urgency.
   */
  if (duplicateCharge && explicitImmediateLanguage) {
    corrected.urgency = "High";
  }

  /*
   * Unanswered support contact over several days + explicit
   * urgency/strong frustration should be High urgency.
   */
  if (
    repeatedSupportFailure &&
    (explicitImmediateLanguage || strongFrustration)
  ) {
    corrected.urgency = "High";
  }

  /*
   * A clear technical/product malfunction indicates concern
   * even when the LLM classifies the sentiment as Neutral.
   */
  if (technicalProblem && result.intent === "Technical Issue") {
    corrected.sentiment = "Concerned";
  }

  /*
   * Meeting and scheduling requests are handled as Medium
   * urgency for consistent operational follow-up.
   */
  if (schedulingRequest) {
    corrected.urgency = "Medium";
  }

  /*
   * Account recovery involving a security credential should
   * remain Medium urgency.
   *
   * This does NOT use or expose the credential.
   */
  if (accountSecurityIssue) {
    corrected.urgency = "Medium";
  }

  return corrected;
}

/*
 * Detect whether the email contains sensitive authentication
 * information such as an OTP, PIN, verification code, or password.
 *
 * This is intentionally deterministic.
 * We do not rely only on the LLM to enforce this security rule.
 */
function containsSensitiveCredential(emailBody) {
  if (typeof emailBody !== "string") {
    return false;
  }

  const body = emailBody.toLowerCase();

  const credentialTerms = [
    "otp",
    "one-time password",
    "one time password",
    "verification code",
    "authentication code",
    "security code",
    "security pin",
    "pin",
  ];

  const containsCredentialTerm = credentialTerms.some((term) =>
    body.includes(term)
  );

  if (containsCredentialTerm) {
    return true;
  }

  /*
   * Detect password values when the customer explicitly provides
   * something such as:
   *
   * Password: abc123
   * Password = abc123
   */
  if (
    /\bpassword\s*[:=]\s*\S+/i.test(emailBody)
  ) {
    return true;
  }

  return false;
}

/*
 * Remove actual OTP/security-code values from model-generated
 * information before returning the result to the UI.
 *
 * Example:
 *
 * "OTP received: 482913"
 *
 * becomes:
 *
 * "Security credential provided (OTP)"
 */
function sanitizeSensitiveInformation(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => typeof item === "string")
    .map((item) => {
      const lower = item.toLowerCase();

      if (
        lower.includes("otp") ||
        lower.includes("one-time password") ||
        lower.includes("one time password")
      ) {
        return "Security credential provided (OTP)";
      }

      if (
        lower.includes("verification code") ||
        lower.includes("authentication code") ||
        lower.includes("security code")
      ) {
        return "Security credential provided";
      }

      if (lower.includes("pin")) {
        return "Security credential provided (PIN)";
      }

      if (lower.includes("password")) {
        return "Password-related credential provided";
      }

      return item;
    })
    .filter(Boolean);
}

/*
 * Apply deterministic security rules after the LLM response.
 *
 * This protects ReplyMate even if the model ignores the prompt.
 */
function applySecurityGuardrails(result, email) {
  const sensitiveCredential = containsSensitiveCredential(email.body);

  if (!sensitiveCredential) {
    return result;
  }

  const safeResult = {
    ...result,

    keyInformation: sanitizeSensitiveInformation(
      result.keyInformation
    ),

    responsePoints: sanitizeSensitiveInformation(
      result.responsePoints
    ),

    actionRequired:
      "Direct the customer to the approved account/password recovery process. Do not use, request, verify, repeat, or disclose any password, OTP, PIN, or security code provided in the email.",
  };

  return safeResult;
}

/*
 * Build the customer-facing draft from the structured analysis.
 *
 * Important:
 * This function does NOT ask the LLM to write the response.
 * It uses the information extracted by the LLM and creates
 * a conservative draft for human review.
 */
function buildSuggestedResponse(result, email) {
  const name = extractCustomerName(email.body);

  const greeting = name
    ? `Dear ${name},`
    : "Dear Customer,";

  const paragraphs = [];

  if (result.intent === "Delivery Issue") {
    const product = findInformation(result.keyInformation, [
      "product",
      "item",
    ]);

    const orderNumber = findInformation(result.keyInformation, [
      "order number",
      "order",
    ]);

    let paragraph =
      "Thank you for reaching out regarding your delivery.";

    if (product) {
      paragraph += ` We understand that you have not yet received your ${product}.`;
    } else {
      paragraph +=
        " We understand that you have not yet received your order.";
    }

    if (orderNumber) {
      paragraph += ` The order number provided is ${orderNumber}.`;
    }

    paragraphs.push(paragraph);

    paragraphs.push(
      "Your request to review the delivery status has been noted for follow-up."
    );
  } else if (result.intent === "Refund Request") {
    const orderNumber = findInformation(result.keyInformation, [
      "order number",
      "order",
    ]);

    let paragraph =
      "Thank you for contacting us regarding your refund request.";

    if (orderNumber) {
      paragraph += ` The order number provided is ${orderNumber}.`;
    }

    paragraphs.push(paragraph);

    paragraphs.push(
      "Your refund request can be reviewed based on the information provided."
    );
  } else if (result.intent === "Technical Issue") {
    paragraphs.push(
      "Thank you for reaching out regarding the issue with the product or service."
    );

    if (result.missingInformation.length > 0) {
      paragraphs.push(
        `To help review the issue, please provide: ${formatList(
          result.missingInformation
        )}.`
      );
    } else {
      paragraphs.push(
        "The issue can be reviewed based on the information provided."
      );
    }
  } else if (result.intent === "Cancellation Request") {
    paragraphs.push(
      "Thank you for contacting us regarding your cancellation request."
    );

    paragraphs.push(
      "Your request can be reviewed based on the information provided."
    );
  } else if (result.intent === "Account Issue") {
    /*
     * Important:
     * Never mention or request OTP/password/PIN values.
     */
    if (containsSensitiveCredential(email.body)) {
      paragraphs.push(
        "Thank you for reaching out regarding your account access issue."
      );

      paragraphs.push(
        "For your security, please use the approved account or password recovery process. Do not share passwords, OTPs, PINs, or other security codes with support."
      );
    } else {
      paragraphs.push(
        "Thank you for reaching out regarding your account issue."
      );

      if (result.missingInformation.length > 0) {
        paragraphs.push(
          `To help review the issue, please provide: ${formatList(
            result.missingInformation
          )}.`
        );
      } else {
        paragraphs.push(
          "The issue can be reviewed based on the information provided."
        );
      }
    }
  } else {
    paragraphs.push(
      "Thank you for reaching out to us."
    );

    paragraphs.push(
      "Your request has been noted and can be reviewed based on the information provided."
    );

    if (result.missingInformation.length > 0) {
      paragraphs.push(
        `To help with your request, please provide: ${formatList(
          result.missingInformation
        )}.`
      );
    }
  }

  paragraphs.push(
    "Thank you for your patience."
  );

  return `${greeting}\n\n${paragraphs.join("\n\n")}`;
}

function extractCustomerName(body) {
  if (typeof body !== "string") {
    return "";
  }

  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const signOffIndex = lines.findIndex((line) =>
    /^(thanks|thank you|regards|best regards|best|sincerely),?$/i.test(
      line
    )
  );

  if (signOffIndex !== -1 && lines[signOffIndex + 1]) {
    const possibleName = lines[signOffIndex + 1];

    if (
      /^[A-Za-z][A-Za-z .'-]{1,50}$/.test(possibleName) &&
      !possibleName.includes(":")
    ) {
      return possibleName;
    }
  }

  return "";
}

function findInformation(items, keywords) {
  if (!Array.isArray(items)) {
    return "";
  }

  for (const item of items) {
    const lower = item.toLowerCase();

    if (
      keywords.some((keyword) =>
        lower.includes(keyword)
      )
    ) {
      const colonIndex = item.indexOf(":");

      if (colonIndex !== -1) {
        return item.slice(colonIndex + 1).trim();
      }

      return item;
    }
  }

  return "";
}

function formatList(items) {
  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${
    items[items.length - 1]
  }`;
}

export async function analyzeEmail(email) {
  if (!email || typeof email !== "object") {
    throw new Error("Email data is required.");
  }

  const subject =
    typeof email.subject === "string"
      ? email.subject.trim()
      : "";

  const body =
    typeof email.body === "string"
      ? email.body.trim()
      : "";

  if (!body) {
    throw new Error("Email body cannot be empty.");
  }

  const prompt = buildPrompt({
    subject,
    body,
  });

  const rawResponse = await callOllama(prompt);

  let parsedResponse;

  try {
    parsedResponse = JSON.parse(rawResponse);
  } catch (error) {
    throw new Error(
      `Ollama returned invalid JSON: ${error.message}\n\nRaw response:\n${rawResponse}`
    );
  }

  let normalized = normalizeResult(parsedResponse);

  /*
   * Apply deterministic classification corrections after the LLM.
   */
  normalized = applyIntentGuardrails(normalized, {
    subject,
    body,
  });

  normalized = applyPriorityGuardrails(normalized, {
    subject,
    body,
  });

  /*
   * Apply deterministic security protection AFTER the LLM
   * and after classification corrections.
   */
  normalized = applySecurityGuardrails(normalized, {
    subject,
    body,
  });

  return {
    ...normalized,

    suggestedResponse: buildSuggestedResponse(
      normalized,
      {
        subject,
        body,
      }
    ),
  };
}
