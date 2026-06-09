/**
 * One-off: map the user-supplied pooja images (descriptively named, multi-MB)
 * to the clean slug filenames the catalog expects, resized + compressed for web.
 *
 *   node scripts/optimizePoojaImages.js
 *
 * Source files matched case-insensitively by a keyword fragment; the first
 * match wins (so "(1)"/"(2)" duplicates are ignored). Outputs `<slug>.jpg`
 * (~1200px wide, quality 78) into public/pooja_images, then removes the
 * original oversized source files.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'pooja_images');

// slug (matches backend seed) → keyword fragment found in the source filename
const MAP = {
  'maha-mrityunjaya-jaap-havan': 'maha_mrityunjay',
  'sudarshan-havan': 'sudarshan_havan',
  'reiki-healing': 'reiki_healing',
  'mahalakshmi-puja': 'maha_laxmi',
  'kuber-puja': 'kuber_puja_create',
  'lakshmi-kubera-yantra-puja': 'laxmi_kuber_yantra',
  'vivah-badha-nivaran-puja': 'vivah_badh',
  'relationship-healing': 'relation_ship_healing',
  'love-marriage-special-puja': 'love_marriage_special',
  'career-healing': 'career_healing',
  'surya-puja': 'surya_puja',
  'vastu-shanti-puja': 'vastu_shanti',
  'kaal-sarp-dosh-puja': 'kall_sharpa',
  'mangal-dosh-puja': 'mangal_dosh',
  'pitra-dosh-puja': 'pitra_dosh',
  'guru-chandal-dosh-puja': 'guru_chandal',
  'navagraha-shanti-puja': 'navgrah_shanti',
  'shani-sade-sati-puja': 'shani_sade_sati',
  'rahu-ketu-shanti-puja': 'rahu_ketu',
  'evil-eye-removal-puja': 'evil_eye',
};

const SLUGS = new Set(Object.keys(MAP).map((s) => `${s}.jpg`));

async function run() {
  const all = fs.readdirSync(DIR);
  // candidate source files = the raw .jpeg/.jpg the user dropped in (not our slug outputs/placeholder)
  const sources = all.filter((f) => /\.(jpe?g)$/i.test(f) && !SLUGS.has(f) && f !== 'placeholder.svg');

  const used = new Set();
  let done = 0;
  for (const [slug, frag] of Object.entries(MAP)) {
    // pick the first non-duplicate match (skip names containing "(1)"/"(2)")
    const candidates = sources
      .filter((f) => f.toLowerCase().includes(frag))
      .sort((a, b) => (a.includes('(') ? 1 : 0) - (b.includes('(') ? 1 : 0));
    const src = candidates.find((f) => !used.has(f)) || candidates[0];
    if (!src) {
      console.warn(`[img] no source for ${slug} (keyword "${frag}")`);
      continue;
    }
    used.add(src);
    const out = path.join(DIR, `${slug}.jpg`);
    await sharp(path.join(DIR, src))
      .resize({ width: 1200, height: 900, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`[img] ${slug}.jpg  ←  ${src}  (${kb} KB)`);
    done++;
  }

  // remove the original oversized source files (and duplicates) to keep the
  // deployed folder lean — only the slug outputs + placeholder remain.
  let removed = 0;
  for (const f of sources) {
    try { fs.unlinkSync(path.join(DIR, f)); removed++; } catch (_) {}
  }
  console.log(`[img] wrote ${done} optimized images, removed ${removed} originals.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
