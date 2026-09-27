/**
 * Both stores implement the same async interface, so routes never know or
 * care which one is backing them. Production uses the Mongo store; tests
 * inject the in-memory one and never need a real database.
 */

function createMongoLinkStore(LinkModel) {
  return {
    async create({ shortCode, originalUrl, label }) {
      const doc = await LinkModel.create({ shortCode, originalUrl, label });
      return toPlain(doc);
    },
    async findAll() {
      const docs = await LinkModel.find().sort({ createdAt: -1 });
      return docs.map(toPlain);
    },
    async findByCode(shortCode) {
      const doc = await LinkModel.findOne({ shortCode });
      return doc ? toPlain(doc) : null;
    },
    async incrementClicks(shortCode) {
      const doc = await LinkModel.findOneAndUpdate(
        { shortCode },
        { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } },
        { new: true }
      );
      return doc ? toPlain(doc) : null;
    },
    async remove(id) {
      const res = await LinkModel.deleteOne({ _id: id });
      return res.deletedCount > 0;
    },
  };
}

function toPlain(doc) {
  const obj = doc.toObject({ versionKey: false });
  return { ...obj, id: obj._id.toString(), _id: undefined };
}

function createMemoryLinkStore() {
  const links = new Map(); // id -> link

  let seq = 1;

  return {
    async create({ shortCode, originalUrl, label }) {
      const id = String(seq++);
      const now = new Date();
      const link = {
        id,
        shortCode,
        originalUrl,
        label: label || "",
        clicks: 0,
        lastClickedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      links.set(id, link);
      return { ...link };
    },
    async findAll() {
      return [...links.values()].sort((a, b) => b.createdAt - a.createdAt);
    },
    async findByCode(shortCode) {
      const link = [...links.values()].find((l) => l.shortCode === shortCode);
      return link ? { ...link } : null;
    },
    async incrementClicks(shortCode) {
      const link = [...links.values()].find((l) => l.shortCode === shortCode);
      if (!link) return null;
      link.clicks += 1;
      link.lastClickedAt = new Date();
      return { ...link };
    },
    async remove(id) {
      return links.delete(id);
    },
  };
}

module.exports = { createMongoLinkStore, createMemoryLinkStore };
