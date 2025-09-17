import type { Slide } from "./slide.js";

export type SlideRender = () => string | Promise<string>;

export type StageRender = (args: {
  stage: number; // current stage index for this slide
  totalStages: number; // total stages for this slide
  slide: Slide; // the slide instance
}) => string | Promise<string>;

export type StageMode = "replace" | "append" | "accumulate";

export interface SlideStage {
  // Content for this stage (ignored if render is provided)
  content?: string | string[];
  // Optional stage-specific renderer (takes precedence over content)
  render?: StageRender;
  // Controls how this stage is printed relative to base content and previous stages
  // IMPORTANT: Base slide content is ALWAYS shown when stages exist.
  // - replace: base content + ONLY the current stage content
  // - append: base content + ONLY the current stage content (no carry-over)
  // - accumulate: base content + ALL stages from 0..current
  mode?: StageMode;
}

export interface SlideOptions {
  title: string;
  header?: string;
  footer?: string;
  content?: string | string[]; // Base content (always shown when stages exist)
  stages?: SlideStage[]; // Optional per-slide stages
  render?: SlideRender; // Legacy/custom full render (ignored when stages are set)
}

export type StyleFn = (s: string) => string;

export interface TypeViewTheme {
  header: StyleFn;
  title: StyleFn;
  footer: StyleFn;
  controls: StyleFn;
  slideIndicator: StyleFn;
  body: StyleFn;
  notice: StyleFn;
}

export interface TypeViewOptions {
  title?: string; // Presentation title (printed above slide title if provided)
  header?: string; // Default header for all slides (slide.header overrides)
  footer?: string; // Default footer for all slides (slide.footer overrides)
  clearOnRender?: boolean; // Default true
  showControls?: boolean; // Default true
  showSlideIndicator?: boolean; // Default true
  showStageIndicator?: boolean; // Default true
  keyboardNavigation?: boolean; // Default true
  theme?: Partial<TypeViewTheme>;
  exitOnLastSlide?: boolean; // If true, pressing next on last slide exits (default false)
  // Non-interactive mode behavior: render all stages or only final stage
  nonInteractiveStages?: "all" | "final"; // Default "all"
}
