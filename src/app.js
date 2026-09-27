const path = require("path");
const express = require("express");
const { createLinksRouter } = require("./routes/links");

function createApp(store) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.get("/", async (req, res) => {
    const links = await store.findAll();
    res.render("index", { links });
  });

  // Mounted last: its GET /:code catch-all must not shadow the routes above.
  app.use(createLinksRouter(store));

  app.use((req, res) => {
    res.status(404).render("404", { code: req.params.code || req.path });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  });

  return app;
}

module.exports = { createApp };
