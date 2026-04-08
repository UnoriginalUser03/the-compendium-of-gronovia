// helpers/buildslides.ts
export interface Slide {
  src: string;
  title?: string;
  description?: React.ReactNode;
}

export function buildSlides(slides: Slide[]): Slide[] {
  // Pure pass-through, no hooks, no handouts lookup
  return slides;
}