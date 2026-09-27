require("dotenv").config();

const { connectDb } = require("./src/db");
const { createApp } = require("./src/app");
const { createMongoLinkStore } = require("./src/linkStore");
const LinkModel = require("./src/models/Link");

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/beacon";

async function main() {
  await connectDb(MONGODB_URI);
  console.log("Connected to MongoDB");

  const store = createMongoLinkStore(LinkModel);
  const app = createApp(store);

  app.listen(PORT, () => {
    console.log(`Beacon listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Beacon:", err);
  process.exit(1);
});
