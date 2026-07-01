"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitFeedback } from "../../utils/pooja-api";

interface Props {
  orderId: string;
  initialRating?: number;
  initialComment?: string;
  onClose: () => void;
  onSubmitted?: (rating: number, comment: string) => void;
}

/**
 * In-app post-puja feedback: ★ 1–5 (required) + optional free text. Idempotent on
 * the backend (one feedback per order — re-submitting edits it). Feeds the
 * astrologer's pooja rating aggregate. Never blocks order completion.
 */
export default function PoojaFeedbackModal({ orderId, initialRating = 0, initialComment = "", onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (rating < 1) {
      setError("Please tap a star to rate your puja.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitFeedback(orderId, rating, comment.trim() || undefined);
      setDone(true);
      onSubmitted?.(rating, comment.trim());
      setTimeout(onClose, 1400);
    } catch (e: any) {
      setError(e?.message || "Couldn't submit your feedback. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 font-sans" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgba(255,140,0,0.18)] p-6 relative text-[#4A3B32]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#FF8C00] transition-colors" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🙏</div>
            <p className="font-bold text-[#4A3B32]">Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-[#4A3B32]">How was your puja?</h3>
            <p className="text-sm text-gray-500 mt-1">Your feedback helps your astrologer and other devotees.</p>

            <div className="flex justify-center gap-2 my-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      n <= (hover || rating) ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share a few words (optional)"
              rows={3}
              maxLength={1000}
              className="w-full border border-orange-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF8C00] resize-none transition-colors"
            />

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <button
              onClick={submit}
              disabled={saving}
              className="mt-4 w-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {saving ? "Submitting…" : "Submit Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
