import express from "express";
import dotenv from "dotenv";
import deepl from "deepl-node";

dotenv.config();

const app = express();
app.use(express.json());

const isDemo = !process.env.DEEPL_API_KEY;
const translator = !isDemo
  ? new deepl.Translator(process.env.DEEPL_API_KEY)
  : null;

app.get("/api/config", (_req, res) => {
  res.json({ demo: isDemo });
});

app.get("/api/languages", async (_req, res) => {
  if (isDemo) return res.status(503).end();

  const source = await translator.getSourceLanguages();
  const target = await translator.getTargetLanguages();
  res.json({ source, target });
});

app.get("/api/usage", async (_req, res) => {
  if (isDemo) return res.status(503).end();

  const usage = await translator.getUsage();
  res.json({
    used: usage.characterCount,
    limit: usage.characterLimit
  });
});

app.post("/api/translate", async (req, res) => {
  if (isDemo) return res.status(403).end();

  const { text, sourceLang, targetLang } = req.body;

  const result = await translator.translateText(
    text,
    sourceLang || null,
    targetLang
  );

  res.json({
    text: result.text,
    detected: result.detectedSourceLang
  });
});

app.listen(3001, () =>
  console.log("Backend → http://localhost:3001")
);
