const subjectInput = document.getElementById("subject");
const emailBodyInput = document.getElementById("emailBody");

const analyzeButton = document.getElementById("analyzeButton");
const newEmailButton = document.getElementById("newEmailButton");
const copyButton = document.getElementById("copyButton");

const analysisSection = document.getElementById("analysisSection");
const responseSection = document.getElementById("responseSection");

const errorMessage = document.getElementById("errorMessage");
const copyMessage = document.getElementById("copyMessage");

const intentValue = document.getElementById("intentValue");
const sentimentValue = document.getElementById("sentimentValue");
const urgencyValue = document.getElementById("urgencyValue");

const summaryValue = document.getElementById("summaryValue");
const keyInformationValue = document.getElementById(
  "keyInformationValue"
);
const actionRequiredValue = document.getElementById(
  "actionRequiredValue"
);
const missingInformationValue = document.getElementById(
  "missingInformationValue"
);

const responseValue = document.getElementById("responseValue");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}

function showAnalysis() {
  analysisSection.classList.remove("hidden");
  responseSection.classList.remove("hidden");
}

function hideAnalysis() {
  analysisSection.classList.add("hidden");
  responseSection.classList.add("hidden");
}

function renderList(element, items, emptyText = "None identified") {
  element.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    element.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function renderResult(result) {
  intentValue.textContent = result.intent || "Other";
  sentimentValue.textContent = result.sentiment || "Neutral";
  urgencyValue.textContent = result.urgency || "Medium";

  summaryValue.textContent =
    result.summary || "No summary available.";

  actionRequiredValue.textContent =
    result.actionRequired || "No specific action identified.";

  renderList(
    keyInformationValue,
    result.keyInformation,
    "No key information identified."
  );

  renderList(
    missingInformationValue,
    result.missingInformation,
    "None identified."
  );

  responseValue.value = result.suggestedResponse || "";

  showAnalysis();
}

async function analyzeEmail() {
  hideError();
  copyMessage.classList.add("hidden");

  const subject = subjectInput.value.trim();
  const body = emailBodyInput.value.trim();

  if (!body) {
    showError("Please enter the customer email before analyzing.");
    emailBodyInput.focus();
    return;
  }

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analyzing...";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        body,
      }),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("ReplyMate returned an invalid server response.");
    }

    if (!response.ok) {
      throw new Error(
        data.error || "ReplyMate could not analyze the email."
      );
    }

    renderResult(data);
  } catch (error) {
    console.error(error);

    showError(
      error instanceof Error
        ? error.message
        : "Something went wrong while analyzing the email."
    );
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analyze Email";
  }
}

function resetApplication() {
  subjectInput.value = "";
  emailBodyInput.value = "";

  intentValue.textContent = "";
  sentimentValue.textContent = "";
  urgencyValue.textContent = "";

  summaryValue.textContent = "";
  actionRequiredValue.textContent = "";

  keyInformationValue.innerHTML = "";
  missingInformationValue.innerHTML = "";

  responseValue.value = "";

  hideError();
  copyMessage.classList.add("hidden");
  hideAnalysis();

  subjectInput.focus();
}

async function copyResponse() {
  hideError();
  copyMessage.classList.add("hidden");

  const responseText = responseValue.value.trim();

  if (!responseText) {
    showError("There is no response to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(responseText);

    copyMessage.textContent = "Response copied to clipboard.";
    copyMessage.classList.remove("hidden");
  } catch (error) {
    console.error(error);

    responseValue.focus();
    responseValue.select();

    showError(
      "Automatic copying was blocked. The response has been selected so you can copy it manually."
    );
  }
}

analyzeButton.addEventListener("click", analyzeEmail);

newEmailButton.addEventListener("click", resetApplication);

copyButton.addEventListener("click", copyResponse);

emailBodyInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    (event.ctrlKey || event.metaKey)
  ) {
    analyzeEmail();
  }
});