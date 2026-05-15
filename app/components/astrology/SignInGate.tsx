"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface Props {
  feature: string;
  description?: string;
}

export default function SignInGate({ feature, description }: Props) {
  return (
    <div className="rounded-xl border border-[#E5C99F] bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF6E8] text-[#C66C0D]">
        <Lock size={20} />
      </div>
      <h3 className="font-garamond text-xl font-semibold text-[#2a1304]">
        Sign in to use {feature}
      </h3>
      <p className="mt-2 text-sm text-[#6b4a1f]">
        {description ?? "We need a verified account to generate your personalized chart and save it for later."}
      </p>
      <Link
        href="/login"
        className="mt-5 inline-block rounded-lg bg-gradient-to-r from-[#F7941D] to-[#E08015] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-[#E08015] hover:to-[#C66C0D]"
      >
        Sign in / Sign up
      </Link>
    </div>
  );
}
