import express from "express";
import dotenv from "dotenv";
import * as deepl from "deepl-node";

dotenv.config();

const app = express();
app.use(express.json());

const isDemo = !process.env.DEEPL_API_KEY;
const deeplClient = !isDemo
  ? new deepl.DeepLClient(process.env.DEEPL_API_KEY)
  : null;

app.get("/api/config", (_req, res) => {
  res.json({ demo: isDemo });
});

app.get("/api/languages", async (_req, res) => {
  if (isDemo) return res.status(503).end();

  const source = await deeplClient.getSourceLanguages();
  const target = await deeplClient.getTargetLanguages();
  res.json({ source, target });
});

app.get("/api/usage", async (_req, res) => {
  if (isDemo) return res.status(503).end();

  const { character } = await deeplClient.getUsage();

  if (!character) {
    return res.json({ used: null, limit: null });
}

  res.json({
    used: character.count,
    limit: character.limit
  });
});

app.post("/api/translate", async (req, res) => {
  if (isDemo) return res.status(403).end();

  const { text, sourceLang, targetLang } = req.body;

  const result = await deeplClient.translateText(
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
