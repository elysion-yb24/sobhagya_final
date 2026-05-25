import { NextResponse } from "next/server";
import { getHoroscopeCollection, type HoroscopeDoc } from "../../lib/mongodb";
import { ZODIAC_SIGNS, type ZodiacSign } from "../../lib/astrology/types";

export const dynamic = "force-dynamic";

const PERIODS = ["today", "tomorrow", "weekly", "monthly", "yearly"] as const;
type Period = (typeof PERIODS)[number];

function isPeriod(v: string): v is Period {
  return (PERIODS as readonly string[]).includes(v);
}
function isSign(v: string): v is ZodiacSign {
  return (ZODIAC_SIGNS as readonly string[]).includes(v);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sign = (url.searchParams.get("sign") || "").toLowerCase();
  const period = (url.searchParams.get("period") || "").toLowerCase();

  if (!isSign(sign)) {
    return NextResponse.json(
      { success: false, message: `Invalid sign. Expected one of: ${ZODIAC_SIGNS.join(", ")}` },
      { status: 400 },
    );
  }
  if (!isPeriod(period)) {
    return NextResponse.json(
      { success: false, message: `Invalid period. Expected one of: ${PERIODS.join(", ")}` },
      { status: 400 },
    );
  }

  let doc: HoroscopeDoc | null;
  try {
    const collection = await getHoroscopeCollection();
    doc = await collection.findOne({ sign, period }, { sort: { date: -1 } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mongo query failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json(
      { success: false, message: `No horoscope found for ${sign} / ${period}.` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "ok",
    data: {
      fromCache: false,
      sign,
      period,
      dateKey: doc.date,
      data: {
        text: doc.text,
        url: doc.url,
        scrapedAt: doc.scraped_at instanceof Date ? doc.scraped_at.toISOString() : doc.scraped_at,
      },
    },
  });
}
