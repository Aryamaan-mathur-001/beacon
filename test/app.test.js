const request = require("supertest");
const { createApp } = require("../src/app");
const { createMemoryLinkStore } = require("../src/linkStore");

let app;

beforeEach(() => {
  app = createApp(createMemoryLinkStore());
});

describe("GET /health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /api/links", () => {
  it("rejects a missing URL", async () => {
    const res = await request(app).post("/api/links").send({});
    expect(res.status).toBe(400);
  });

  it("rejects an invalid URL", async () => {
    const res = await request(app).post("/api/links").send({ originalUrl: "not-a-url" });
    expect(res.status).toBe(400);
  });

  it("creates a link with a generated short code", async () => {
    const res = await request(app)
      .post("/api/links")
      .send({ originalUrl: "https://example.com/reports/q3", label: "Q3 report" });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{7}$/);
    expect(res.body.originalUrl).toBe("https://example.com/reports/q3");
    expect(res.body.clicks).toBe(0);
  });
});

describe("GET /api/links", () => {
  it("lists created links", async () => {
    await request(app).post("/api/links").send({ originalUrl: "https://example.com/a" });
    await request(app).post("/api/links").send({ originalUrl: "https://example.com/b" });

    const res = await request(app).get("/api/links");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /:code", () => {
  it("redirects to the original URL and increments clicks", async () => {
    const created = await request(app)
      .post("/api/links")
      .send({ originalUrl: "https://example.com/target" });

    const redirect = await request(app).get(`/${created.body.shortCode}`);
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe("https://example.com/target");

    const list = await request(app).get("/api/links");
    expect(list.body[0].clicks).toBe(1);
  });

  it("renders 404 for an unknown code", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/links/:id", () => {
  it("removes an existing link", async () => {
    const created = await request(app)
      .post("/api/links")
      .send({ originalUrl: "https://example.com/temp" });

    const del = await request(app).delete(`/api/links/${created.body.id}`);
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/links");
    expect(list.body).toHaveLength(0);
  });

  it("404s for an unknown id", async () => {
    const res = await request(app).delete("/api/links/does-not-exist");
    expect(res.status).toBe(404);
  });
});
