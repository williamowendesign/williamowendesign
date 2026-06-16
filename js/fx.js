// Ambient site-wide FX: live clock readout + random glitch slips.

document.addEventListener('DOMContentLoaded', () => {

  // ── LIVE CLOCK (nav status) ──
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const tick = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }
});
