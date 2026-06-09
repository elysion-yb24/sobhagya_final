# Pooja images

Drop the image files for the Pooja/Remedy shop here. The UI references them by
**exact filename** (set in the backend seed `scripts/seedPooja.js`). Until a file
exists, the UI falls back to `placeholder.svg`, so the layout always looks complete.

- Format: `.jpg` (or `.jpeg`/`.png` — but the seed paths use `.jpg`, so keep `.jpg`).
- Recommended size: **landscape ~800×600** for product/hero images, **square ~400×400**
  for pandit avatars and **wide ~1600×500** for category banners.
- These are served statically at `/pooja_images/<filename>`.

## Product images (one per puja) — `/pooja_images/<slug>.jpg`
| File | Puja |
|---|---|
| `maha-mrityunjaya-jaap-havan.jpg` | Maha Mrityunjaya Jaap & Havan |
| `sudarshan-havan.jpg` | Sudarshan Havan |
| `reiki-healing.jpg` | Reiki Healing Session |
| `mahalakshmi-puja.jpg` | Mahalakshmi Puja |
| `kuber-puja.jpg` | Kuber Puja |
| `lakshmi-kubera-yantra-puja.jpg` | Lakshmi-Kubera Yantra Puja |
| `vivah-badha-nivaran-puja.jpg` | Vivah Badha Nivaran Puja |
| `relationship-healing.jpg` | Relationship Healing |
| `love-marriage-special-puja.jpg` | Love Marriage Special Puja |
| `career-healing.jpg` | Career Healing |
| `surya-puja.jpg` | Surya Puja |
| `vastu-shanti-puja.jpg` | Vastu Shanti Puja |
| `kaal-sarp-dosh-puja.jpg` | Kaal Sarp Dosh Nivaran Puja |
| `mangal-dosh-puja.jpg` | Mangal Dosh (Manglik) Puja |
| `pitra-dosh-puja.jpg` | Pitra Dosh Nivaran Puja |
| `guru-chandal-dosh-puja.jpg` | Guru Chandal Dosh Puja |
| `navagraha-shanti-puja.jpg` | Navagraha Shanti Puja |
| `shani-sade-sati-puja.jpg` | Shani Sade Sati Puja |
| `rahu-ketu-shanti-puja.jpg` | Rahu-Ketu Shanti Puja |
| `evil-eye-removal-puja.jpg` | Evil Eye (Nazar) Removal Puja |

## Category banners (optional) — `/pooja_images/banner-<x>.jpg`
`banner-hero.jpg` (main shop hero), `banner-health.jpg`, `banner-wealth.jpg`,
`banner-love.jpg`, `banner-career.jpg`, `banner-dosh.jpg`, `banner-shanti.jpg`

## Pandit avatars (optional) — `/pooja_images/pandit-<name>.jpg`
`pandit-shivokt.jpg`, `pandit-jaisudarshan.jpg`, `pandit-harkirat.jpg`,
`pandit-kaustubha.jpg`, `pandit-shyam.jpg`

> If you rename any file, also update the matching path in
> `backend/sobhagya-backend-new/user-service/scripts/seedPooja.js` and re-run
> `npm run seed:pooja`.
