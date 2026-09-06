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

// Palette — matches the light hand-drawn site theme.
const INK = "#241f1a";
const MUTED = "#8c8880";
const DEBT = "#d92d20";
const BTC = "#f7931a";
const BTC_INK = "#b9640a";
const MONO = '"Courier New", Courier, monospace';
const SANS = "-apple-system, Segoe UI, Roboto, sans-serif";

// A small hand-drawn alarm clock, echoing the site's brand doodle.
function drawClock(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-4 * Math.PI) / 180);
  const s = r / 21; // the doodle is authored around r=21
  ctx.scale(s, s);
  // offset orange fill
  ctx.save();
  ctx.translate(1.6, 2.2);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = BTC;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // ink outline
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.stroke();       // body
  ctx.beginPath(); ctx.moveTo(-14, 20); ctx.lineTo(-20, 27); ctx.stroke(); // left leg
  ctx.beginPath(); ctx.moveTo(14, 20); ctx.lineTo(20, 27); ctx.stroke();   // right leg
  ctx.beginPath(); ctx.arc(-14, -18, 8, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke(); // left bell
  ctx.beginPath(); ctx.arc(14, -18, 8, Math.PI * 1.1, Math.PI * 2.1); ctx.stroke();  // right bell
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -12); ctx.stroke();     // minute hand
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(11, 3); ctx.stroke();      // hour hand
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(0, 0, 1.9, 0, Math.PI * 2); ctx.fill();         // hub
  ctx.restore();
}

// A wobbly hand-drawn rounded rect (used for the sketch frame).
function sketchRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawCard(ctx, snap) {
  const debtPerCitizen = snap.debtPerCitizen;
  const sats = snap.yourShareInSats;
  const btc = snap.yourShareInBTC;
  const price = snap.btcPriceCAD;

  // Paper background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Faint graph-paper grid
  ctx.strokeStyle = "rgba(36,31,26,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= SIZE; x += 54) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, x); ctx.lineTo(SIZE, x); ctx.stroke();
  }

  // Hand-drawn sketch frame (offset shadow + ink border)
  ctx.fillStyle = "rgba(36,31,26,0.08)";
  sketchRect(ctx, 52, 58, SIZE - 88, SIZE - 88, 34); ctx.fill();
  ctx.fillStyle = "#ffffff";
  sketchRect(ctx, 44, 46, SIZE - 88, SIZE - 88, 34); ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  sketchRect(ctx, 44, 46, SIZE - 88, SIZE - 88, 34); ctx.stroke();

  ctx.textAlign = "center";

  // Brand: clock doodle + wordmark
  drawClock(ctx, SIZE / 2 - 232, 150, 26);
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${SANS}`;
  ctx.fillText("The Canadian Debt Clock", SIZE / 2 + 26, 163);

  // Label
  ctx.fillStyle = MUTED;
  ctx.font = `700 40px ${SANS}`;
  ctx.fillText("MY SHARE OF THE NATIONAL DEBT", SIZE / 2, 275);

  // Debt per citizen (red, Courier)
  ctx.fillStyle = DEBT;
  ctx.font = `700 116px ${MONO}`;
  ctx.fillText(money(debtPerCitizen), SIZE / 2, 400);

  // Divider
  ctx.strokeStyle = "rgba(36,31,26,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(260, 480); ctx.lineTo(820, 480); ctx.stroke();

  // "priced in hard money"
  ctx.fillStyle = MUTED;
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText("priced in money that can't be printed", SIZE / 2, 552);

  // Sats (orange, huge, Courier)
  ctx.fillStyle = BTC_INK;
  ctx.font = `700 154px ${MONO}`;
  ctx.fillText(intl(sats), SIZE / 2, 705);
  ctx.fillStyle = BTC;
  ctx.font = `700 58px ${SANS}`;
  ctx.fillText("sats", SIZE / 2, 772);

  // BTC equivalent
  ctx.fillStyle = MUTED;
  ctx.font = `500 32px ${MONO}`;
  ctx.fillText(`= ${btc.toFixed(8)} ₿   at ${money(price)} / BTC`, SIZE / 2, 842);

  // Footer band
  ctx.fillStyle = "rgba(247,147,26,0.10)";
  ctx.fillRect(44, 928, SIZE - 88, 108);
  ctx.fillStyle = BTC_INK;
  ctx.font = `700 42px ${SANS}`;
  ctx.fillText("canadiandebtclock.com", SIZE / 2, 982);
  ctx.fillStyle = MUTED;
  ctx.font = `600 28px ${SANS}`;
  ctx.fillText("Fix the money, fix the country.", SIZE / 2, 1022);
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
