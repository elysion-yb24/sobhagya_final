"use client";

interface Props { svg: string; className?: string; }

export default function ChartSVG({ svg, className }: Props) {
  const cleaned = normaliseSvg(svg);
  return (
    <div className={className ?? "w-full flex justify-center"}>
      <div
        className={
          "relative aspect-square w-full max-w-[35rem] " +
          "rounded-xl bg-white shadow-inner p-8 sm:p-10 " +
          "flex items-center justify-center " +
          "[&_svg]:block [&_svg]:w-full [&_svg]:h-full " +
          "[&_svg]:max-w-full [&_svg]:max-h-full " +
          "[&_svg]:overflow-visible"
        }
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    </div>
  );
}

function normaliseSvg(raw: string): string {
  let s = raw.trim();

  if (!/<svg[\s>]/i.test(s) && /&lt;svg/i.test(s)) {
    s = s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
  }

  s = s.replace(/<svg\b([^>]*)>/i, (_match, rawAttrs: string) => {
    let attrs = rawAttrs;
    const widthMatch = /\swidth\s*=\s*"([^"]*)"/i.exec(attrs);
    const heightMatch = /\sheight\s*=\s*"([^"]*)"/i.exec(attrs);
    attrs = attrs
      .replace(/\swidth\s*=\s*"[^"]*"/i, "")
      .replace(/\sheight\s*=\s*"[^"]*"/i, "");
    let vbMatch = /viewBox\s*=\s*"([^"]+)"/i.exec(attrs);
    if (!vbMatch && widthMatch && heightMatch) {
      const w = parseFloat(widthMatch[1]);
      const h = parseFloat(heightMatch[1]);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        attrs += ` viewBox="0 0 ${w} ${h}"`;
        vbMatch = /viewBox\s*=\s*"([^"]+)"/i.exec(attrs);
      }
    }
    if (vbMatch) {
      const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        const [x, y, w, h] = parts;
        const pad = Math.max(w, h) * 0.08;
        const expanded = `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`;
        attrs = attrs.replace(/viewBox\s*=\s*"[^"]+"/i, `viewBox="${expanded}"`);
      }
    }
    if (!/\spreserveAspectRatio\s*=/.test(attrs)) {
      attrs += ' preserveAspectRatio="xMidYMid meet"';
    }
    return `<svg${attrs}>`;
  });

  return s;
}

export function looksLikeSvg(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const t = v.trim();
  if (t.length < 20) return false;
  return /<svg[\s>]/i.test(t) || /^&lt;svg/i.test(t);
}

export function looksLikeImageUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  return /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg)(\?\S*)?$/i.test(v.trim());
}
