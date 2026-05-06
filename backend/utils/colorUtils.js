/**
 *
 * @param {string} hex
 * @returns {string}
 */
export const calculateFengShui = (hex) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return "Thổ";

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);

  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;

  if (l < 12) return "Thủy";

  if (s < 10) return "Kim";

  if (l < 40 && h < 50) return "Thổ";

  if ((h >= 0 && h < 25) || (h >= 330 && h <= 360)) return "Hỏa";
  if (h >= 25 && h < 55) return "Thổ";
  if (h >= 55 && h < 150) return "Mộc";
  if (h >= 150 && h < 255) return "Thủy";
  if (h >= 255 && h < 330) return "Hỏa";

  return "Thổ";
};
