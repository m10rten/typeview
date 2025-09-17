import { Slide } from "./slide.js";
import { buildDefaultTheme } from "./consts.js";

import type { TypeViewOptions, TypeViewTheme } from "./types.js";

export class TypeView {
  private readonly slides: Slide[] = [];
  private readonly opts: Required<Omit<TypeViewOptions, "theme">> & {
    theme: TypeViewTheme;
  };
  private index = 0;
  private running = false;
  private stagePerSlide: number[] = [];

  constructor(options?: TypeViewOptions) {
    const theme = { ...buildDefaultTheme(), ...(options?.theme ?? {}) };
    this.opts = {
      title: options?.title ?? "",
      header: options?.header ?? "",
      footer: options?.footer ?? "",
      clearOnRender: options?.clearOnRender ?? true,
      showControls: options?.showControls ?? true,
      showSlideIndicator: options?.showSlideIndicator ?? true,
      showStageIndicator: options?.showStageIndicator ?? true,
      keyboardNavigation: options?.keyboardNavigation ?? true,
      exitOnLastSlide: options?.exitOnLastSlide ?? false,
      nonInteractiveStages: options?.nonInteractiveStages ?? "all",
      theme,
    };
  }

  public addSlide(slideOrInit: Slide | ConstructorParameters<typeof Slide>[0]): this {
    const s = slideOrInit instanceof Slide ? slideOrInit : new Slide(slideOrInit);
    this.slides.push(s);
    // initialize stage index for this slide
    this.stagePerSlide.push(0);
    return this;
  }

  public get length(): number {
    return this.slides.length;
  }

  public async run(): Promise<void> {
    if (this.running) return;
    if (this.slides.length === 0) {
      throw new Error("TypeView has no slides. Add slides before run().");
    }

    this.running = true;
    const isTTY = typeof process !== "undefined" && process.stdin && process.stdin.isTTY;

    if (!isTTY || !this.opts.keyboardNavigation) {
      // Non-interactive environment
      for (let i = 0; i < this.slides.length; i++) {
        this.index = i;
        const slide = this.slides[i]!;
        const stages = slide.stageCount;
        if (slide.hasStages() && this.opts.nonInteractiveStages === "all") {
          for (let st = 0; st < stages; st++) {
            this.stagePerSlide[i] = st;
            await this.renderCurrent();
          }
        } else {
          // final stage only
          this.stagePerSlide[i] = Math.max(0, stages - 1);
          await this.renderCurrent();
        }
      }
      this.running = false;
      return;
    }

    // Interactive mode
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    await this.renderCurrent();

    const onData = async (key: string) => {
      if (!this.running) return;

      // Quit on 'q' or Ctrl+C
      if (key === "q" || key === "\u0003") {
        this.cleanup(onData);
        return;
      }

      // Space or Right arrow -> next stage/slide
      if (key === " " || key === "\u001b[C") {
        const moved = await this.next();
        if (!moved) {
          if (this.opts.exitOnLastSlide) {
            this.cleanup(onData);
          } else {
            await this.renderCurrent(this.opts.theme.notice("(Last slide)"));
          }
        }
        return;
      }

      // Left arrow -> prev stage/slide
      if (key === "\u001b[D") {
        const moved = await this.prev();
        if (!moved) {
          await this.renderCurrent(this.opts.theme.notice("(First slide)"));
        }
        return;
      }
    };

    process.stdin.on("data", onData);
  }

  public clear(): void {
    process.stdout.write("\x1Bc");
  }

  private async next(): Promise<boolean> {
    const slide = this.slides[this.index]!;
    const curStage = this.stagePerSlide[this.index]!;
    const lastStage = slide.stageCount - 1;

    if (curStage < lastStage) {
      this.stagePerSlide[this.index] = curStage + 1;
      await this.renderCurrent();
      return true;
    }

    if (this.index < this.slides.length - 1) {
      this.index++;
      // Keep whatever stage it had (defaults to 0 if first time)
      await this.renderCurrent();
      return true;
    }

    // At end of last slide
    return false;
  }

  private async prev(): Promise<boolean> {
    const curStage = this.stagePerSlide[this.index]!;

    if (curStage > 0) {
      this.stagePerSlide[this.index] = curStage - 1;
      await this.renderCurrent();
      return true;
    }

    if (this.index > 0) {
      this.index--;
      // Go to whatever stage the previous slide was last on (default 0)
      await this.renderCurrent();
      return true;
    }

    // At very beginning
    return false;
  }

  // Internal: render slide at current index + stage
  private async renderCurrent(notice?: string): Promise<void> {
    const totalSlides = this.slides.length;
    const slide = this.slides[this.index]!;
    const stage = this.stagePerSlide[this.index]!;
    const totalStages = slide.stageCount;

    if (this.opts.clearOnRender) this.clear();

    let title: string | null = null;
    // Presentation title (if provided)
    if (this.opts.title) {
      title = this.opts.theme.header(`${this.opts.title}`);
    }

    // Slide indicator + Stage indicator
    if (this.opts.showSlideIndicator) {
      const slidePart = `[Slide ${this.index + 1}/${totalSlides}]`;
      const stagePart = this.opts.showStageIndicator && totalStages > 1 ? ` • [Step ${stage + 1}/${totalStages}]` : "";
      process.stdout.write(
        `${this.opts.theme.slideIndicator(`${slidePart}${stagePart}`)}${title ? ` : ${title}` : ""}\n\n`,
      );
    }

    // Optional header (slide overrides default)
    const resolvedHeader = slide.header ?? this.opts.header;
    if (resolvedHeader) {
      process.stdout.write(`${this.opts.theme.header(resolvedHeader)}\n\n`);
    }

    // Slide title
    process.stdout.write(`${this.opts.theme.title(slide.title)}\n\n`);

    // Body (always printed by TypeView).
    const body = await slide.renderStage(stage);
    if (body && body.length > 0) {
      process.stdout.write(`${this.opts.theme.body(body)}\n`);
    }

    // Optional footer (slide overrides default)
    const resolvedFooter = slide.footer ?? this.opts.footer;
    if (resolvedFooter) {
      process.stdout.write(`\n${this.opts.theme.footer(resolvedFooter)}\n`);
    }

    if (notice) {
      process.stdout.write(`\n${notice}\n`);
    }

    // Controls
    if (this.opts.showControls) {
      process.stdout.write(`${"\n"}${this.opts.theme.controls("Controls: ← Back | → Next | Space Next | q Quit")}\n`);
    }
  }

  private cleanup(onData: (key: string) => void): void {
    this.running = false;
    process.stdin.setRawMode?.(false);
    process.stdin.pause();
    process.stdin.removeListener("data", onData);
    process.stdout.write(`${this.opts.theme.footer("Exiting presentation.")}\n`);
  }
}
export default TypeView;

// Re-exports (public API)
export { Slide } from "./slide.js";
export { ANSI, style, buildDefaultTheme } from "./consts.js";
export type * from "./types.js";
export { normalizeToLines, splitLines } from "./stage.js";
