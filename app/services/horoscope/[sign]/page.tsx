"use client";

import { useParams } from "next/navigation";
import HoroscopePage from "../page";
import { ZODIAC_SIGNS, type ZodiacSign } from "../../../lib/astrology/types";

export default function ZodiacSignPage() {
  const params = useParams();
  const raw = (params?.sign as string | undefined)?.toLowerCase();
  const initialSign: ZodiacSign | undefined = ZODIAC_SIGNS.includes(raw as ZodiacSign)
    ? (raw as ZodiacSign)
    : undefined;
  return <HoroscopePage initialSign={initialSign} />;
}
