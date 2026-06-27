// =============================================================================
//  sharecard.js — generate a shareable "your share of the debt, in sats" image
// =============================================================================
//  Draws a 1080×1080 social card from a live snapshot and lets the user
//  download it (or share via the Web Share API on supported devices).
// =============================================================================

const SIZE = 1080;

const money = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
const intl = (n) => new Intl.NumberFormat("en-CA").format(Math.round(n));

export function drawCard(ctx, snap) {
  const debtPerCitizen = snap.debtPerCitizen;
  const sats = snap.yourShareInSats;
  const btc = snap.yourShareInBTC;
  const price = snap.btcPriceCAD;

  // Background
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#0a0e14");
  bg.addColorStop(1, "#11161f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Grid lines
  ctx.strokeStyle = "rgba(70,194,255,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= SIZE; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(SIZE, x); ctx.stroke();
  }

  // Orange glow
  const glow = ctx.createRadialGradient(SIZE / 2, 640, 40, SIZE / 2, 640, 520);
  glow.addColorStop(0, "rgba(247,147,26,0.18)");
  glow.addColorStop(1, "rgba(247,147,26,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.textAlign = "center";

  // Header
  ctx.fillStyle = "#8a97a8";
  ctx.font = "600 30px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("🍁  THE CANADIAN DEBT CLOCK", SIZE / 2, 130);

  // Label
  ctx.fillStyle = "#e8edf4";
  ctx.font = "700 46px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("My share of the national debt", SIZE / 2, 250);

  // Debt per citizen (red)
  ctx.fillStyle = "#ff4d4f";
  ctx.font = "800 110px ui-monospace, Menlo, monospace";
  ctx.fillText(money(debtPerCitizen), SIZE / 2, 380);

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.moveTo(240, 470); ctx.lineTo(840, 470); ctx.stroke();

  // "in hard money"
  ctx.fillStyle = "#8a97a8";
  ctx.font = "600 34px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("priced in money that can't be printed", SIZE / 2, 545);

  // Sats (orange, huge)
  ctx.fillStyle = "#f7931a";
  ctx.font = "800 150px ui-monospace, Menlo, monospace";
  ctx.fillText(intl(sats), SIZE / 2, 690);
  ctx.font = "700 60px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("sats", SIZE / 2, 760);

  // BTC equivalent
  ctx.fillStyle = "#8a97a8";
  ctx.font = "500 32px ui-monospace, Menlo, monospace";
  ctx.fillText(
    `= ${btc.toFixed(8)} ₿   at ${money(price)} / BTC`,
    SIZE / 2,
    835
  );

  // Footer band
  ctx.fillStyle = "rgba(247,147,26,0.10)";
  ctx.fillRect(0, 930, SIZE, 150);
  ctx.fillStyle = "#f7931a";
  ctx.font = "700 40px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("canadiandebtclock.com", SIZE / 2, 1000);
  ctx.fillStyle = "#8a97a8";
  ctx.font = "500 28px -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("Fix the money, fix the country.", SIZE / 2, 1045);
}

async function exportCard(canvas) {
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  const file = new File([blob], "my-debt-in-sats.png", { type: "image/png" });

  // Prefer native share (mobile) when it can share files.
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "My share of Canada's debt",
        text: "My share of Canada's national debt, priced in Bitcoin. canadiandebtclock.com",
      });
      return;
    } catch {
      /* user cancelled — fall through to download */
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-debt-in-sats.png";
  a.click();
  URL.revokeObjectURL(url);
}

export function initShareCard(button, getSnapshot) {
  if (!button) return;
  button.addEventListener("click", async () => {
    button.disabled = true;
    const prev = button.textContent;
    button.textContent = "Generating…";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      drawCard(canvas.getContext("2d"), getSnapshot());
      await exportCard(canvas);
    } finally {
      button.textContent = prev;
      button.disabled = false;
    }
  });
}
