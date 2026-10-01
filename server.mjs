import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeEmail } from "./replymate-analysis.mjs";

const app = express();

const PORT = 3000;
const HOST = "127.0.0.1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.json({ limit: "1mb" }));

// Serve the ReplyMate frontend.
app.use(express.static(PUBLIC_DIR));

// Explicitly serve the main ReplyMate interface.
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Health check.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    application: "ReplyMate",
    model: "gemma4:e2b-it-qat",
  });
});

// Analyze an email.
app.post("/api/analyze", async (req, res) => {
  try {
    const { subject, body } = req.body || {};

    if (typeof body !== "string" || body.trim() === "") {
      return res.status(400).json({
        error: "Email body cannot be empty.",
      });
    }

    const result = await analyzeEmail({
      subject,
      body,
    });

    return res.json(result);
  } catch (error) {
    console.error("");
    console.error("ReplyMate analysis error:");
    console.error(error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "ReplyMate analysis failed.",
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("========================================");
  console.log("           REPLYMATE SERVER");
  console.log("========================================");
  console.log("");
  console.log(`ReplyMate: http://localhost:${PORT}`);
  console.log(`Health:    http://localhost:${PORT}/api/health`);
  console.log(`Frontend:  ${PUBLIC_DIR}`);
  console.log("");
  console.log("Ollama model: gemma4:e2b-it-qat");
  console.log("");
  console.log("Waiting for an email...");
  console.log("");
});