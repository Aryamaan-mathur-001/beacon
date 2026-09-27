const express = require("express");
const { generateShortCode } = require("../utils/shortcode");

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createLinksRouter(store) {
  const router = express.Router();

  // GET /api/links — list all shortened links, newest first
  router.get("/api/links", async (req, res) => {
    const links = await store.findAll();
    res.json(links);
  });

  // POST /api/links — shorten a new URL
  router.post("/api/links", async (req, res) => {
    const { originalUrl, label } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Enter a valid http:// or https:// URL." });
    }

    let shortCode = generateShortCode();
    // Extremely unlikely collision, but guard against it anyway.
    let existing = await store.findByCode(shortCode);
    let attempts = 0;
    while (existing && attempts < 5) {
      shortCode = generateShortCode();
      existing = await store.findByCode(shortCode);
      attempts += 1;
    }

    const link = await store.create({ shortCode, originalUrl, label: label || "" });
    res.status(201).json(link);
  });

  // DELETE /api/links/:id — remove a link
  router.delete("/api/links/:id", async (req, res) => {
    const removed = await store.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "That link could not be found." });
    }
    res.json({ ok: true });
  });

  // GET /:code — redirect to the original URL and record the click
  router.get("/:code", async (req, res, next) => {
    const link = await store.findByCode(req.params.code);
    if (!link) return next(); // fall through to 404
    await store.incrementClicks(req.params.code);
    res.redirect(302, link.originalUrl);
  });

  return router;
}

module.exports = { createLinksRouter, isValidUrl };
