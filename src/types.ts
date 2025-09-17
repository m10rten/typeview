import type { Slide } from "./slide.js";

export type SlideRender = () => string | Promise<string>;

export type StageRender = (args: {
  stage: number; // current stage index for this slide
  totalStages: number; // total stages for this slide
  slide: Slide; // the slide instance
}) => string | Promise<string>;

export type StageMode = "replace" | "append" | "accumulate";

/**
 * Configuration for a single incremental stage of a Slide.
 *
 * When a slide has stages, the base slide content is always printed first.
 * The current stage contributes content according to its mode:
 * - "replace": base + ONLY current stage
 * - "append": base + ONLY current stage (no carry-over)
 * - "accumulate": base + ALL stages from 0..current
 *
 * If both `content` and `render` are provided, `render` takes precedence.
 *
 * @interface SlideStage
 * @property {string | string[]=} content Content lines for this stage (ignored if `render` is provided).
 * @property {StageRender=} render Stage-specific renderer; receives the current slide/stage context.
 * @property {"replace"|"append"|"accumulate"=} mode How this stage combines with base/prior stages. Defaults to "accumulate".
 */
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

/**
 * Initialization options for a Slide.
 *
 * If `stages` are provided, they fully control rendering and `render` is ignored.
 * Without stages, the slide renders using `render` (if set) or the base `content`.
 * Base `content` is always printed when stages exist.
 *
 * @interface SlideOptions
 * @property {string} title Required slide title.
 * @property {string=} header Optional per-slide header (overrides TypeView default header).
 * @property {string=} footer Optional per-slide footer (overrides TypeView default footer).
 * @property {string | string[]=} content Base body content. Always printed when stages exist.
 * @property {SlideStage[]=} stages Optional incremental stages (enables step-wise rendering).
 * @property {SlideRender=} render Legacy/custom full renderer. Ignored when `stages` is set.
 *
 * @example
 * // Minimal slide
 * { title: 'Intro', content: 'Welcome' }
 *
 * @example
 * // With stages
 * {
 *   title: 'Agenda',
 *   content: 'Topics:',
 *   stages: [
 *     { content: '- One' },
 *     { content: '- Two', mode: 'accumulate' }
 *   ]
 * }
 */
export interface SlideOptions {
  title: string;
  header?: string;
  footer?: string;
  content?: string | string[]; // Base content (always shown when stages exist)
  stages?: SlideStage[]; // Optional per-slide stages
  render?: SlideRender; // Legacy/custom full render (ignored when stages are set)
}

export type StyleFn = (s: string) => string;

/**
 * Theme contract for all styled regions printed by TypeView.
 * Each function receives raw text and returns a styled string (e.g., with ANSI codes).
 * Implementations should be pure and side-effect free.
 *
 * @interface TypeViewTheme
 * @property {StyleFn} header Styles global or slide-specific headers.
 * @property {StyleFn} title Styles slide titles.
 * @property {StyleFn} footer Styles footers.
 * @property {StyleFn} controls Styles the control hints line.
 * @property {StyleFn} slideIndicator Styles the slide/stage indicator line.
 * @property {StyleFn} body Styles the rendered slide body.
 * @property {StyleFn} notice Styles transient notices (e.g., "First slide").
 */
export interface TypeViewTheme {
  header: StyleFn;
  title: StyleFn;
  footer: StyleFn;
  controls: StyleFn;
  slideIndicator: StyleFn;
  body: StyleFn;
  notice: StyleFn;
}

/**
 * Presentation runtime options for TypeView.
 *
 * @interface TypeViewOptions
 * @property {string=} title Presentation title shown next to the slide indicator.
 * @property {string=} header Default header for all slides (overridden by slide.header).
 * @property {string=} footer Default footer for all slides (overridden by slide.footer).
 * @property {boolean=} clearOnRender Whether to clear the terminal before each render. Default: true.
 * @property {boolean=} showControls Whether to print navigation controls. Default: true.
 * @property {boolean=} showSlideIndicator Whether to print slide number indicator. Default: true.
 * @property {boolean=} showStageIndicator Whether to print stage/step indicator. Default: true.
 * @property {boolean=} keyboardNavigation Enable interactive keyboard navigation. Default: true.
 * @property {Partial<TypeViewTheme>=} theme Theme overrides merged with the default theme.
 * @property {boolean=} exitOnLastSlide If true, pressing Next on the last slide exits. Default: false.
 * @property {"all"|"final"=} nonInteractiveStages In non-TTY mode: render all stages or only the final one. Default: "all".
 */
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
