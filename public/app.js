const form = document.getElementById("new-link");
const errorEl = document.getElementById("form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const originalUrl = document.getElementById("originalUrl").value.trim();
  const label = document.getElementById("label").value.trim();

  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalUrl, label }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    errorEl.textContent = data.error || "Something went wrong.";
    errorEl.hidden = false;
    return;
  }

  window.location.reload();
});

document.getElementById("links")?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='remove']");
  if (!btn) return;
  const row = e.target.closest("tr");
  const id = row.dataset.id;

  const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
  if (res.ok) {
    row.remove();
  }
});
