/**
 * Discriminated result shape rendered by `ResultCard`. The astrology pages
 * currently only emit `{ kind: "json", ... }` (the feature-service envelope is
 * unwrapped in `featureApi.ts`), but the renderer also knows how to display
 * SVG charts, PDFs, images, and plain text in case a future endpoint returns
 * them inline.
 */
export type ApiResult =
  | { kind: "json"; data: unknown; endpoint?: string }
  | { kind: "svg"; svg: string; endpoint?: string }
  | { kind: "pdf"; base64: string; mime: string; endpoint?: string }
  | { kind: "image"; base64: string; mime: string; endpoint?: string }
  | { kind: "text"; text: string; endpoint?: string };
