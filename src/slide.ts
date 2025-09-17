import { normalizeToLines } from "./stage.js";

import type { SlideOptions, SlideStage, StageMode, SlideRender } from "./types.js";

export class Slide {
  public readonly title: string;
  public readonly header?: string;
  public readonly footer?: string;
  public readonly render?: SlideRender;

  private readonly _content?: string | string[];
  private readonly _stages: SlideStage[];

  constructor(ctx: SlideOptions) {
    if (!ctx || !ctx.title) {
      throw new TypeError("Slide requires a title.");
    }
    this.title = ctx.title;
    this.header = ctx.header;
    this.footer = ctx.footer;
    this._content = ctx.content;
    this._stages = Array.isArray(ctx.stages) ? ctx.stages : [];
    // If stages are provided, they control rendering. Otherwise, use render or default.
    this.render = this._stages.length === 0 ? (ctx.render ?? (() => this.defaultRender())) : undefined;
  }

  public get stageCount(): number {
    return Math.max(1, this._stages.length || 1);
  }

  public hasStages(): boolean {
    return this._stages.length > 0;
  }

  // Compute the full body string for the given stage
  public async renderStage(stage: number): Promise<string> {
    if (!this.hasStages()) {
      // No stages: use legacy/custom or default
      if (this.render) {
        const body = await this.render();
        return typeof body === "string" ? body : "";
      }
      return this.defaultRender();
    }

    // Bound stage to available range
    const sIndex = Math.max(0, Math.min(stage, this._stages.length - 1));
    const current = this._stages[sIndex]!;
    const mode: StageMode = current.mode ?? "accumulate";

    const base = normalizeToLines(this._content);

    // Helper to realize a single stage's body
    const renderOne = async (idx: number): Promise<string[]> => {
      const st = this._stages[idx]!;
      if (st.render) {
        const out = await st.render({
          stage: sIndex, // current stage of the slide, by design
          totalStages: this._stages.length,
          slide: this,
        });
        return normalizeToLines(out);
      }
      return normalizeToLines(st.content);
    };

    if (mode === "replace") {
      // FIX: Always include base content
      const cur = await renderOne(sIndex);
      return [...base, ...cur].join("\n");
    }

    if (mode === "append") {
      // Base + only current stage content
      const cur = await renderOne(sIndex);
      return [...base, ...cur].join("\n");
    }

    // accumulate: base + all stages up to current
    const acc: string[] = [...base];
    for (let i = 0; i <= sIndex; i++) {
      const part = await renderOne(i);
      acc.push(...part);
    }
    return acc.join("\n");
  }

  private defaultRender(): string {
    if (typeof this._content === "string") {
      return this._content;
    }
    if (Array.isArray(this._content)) {
      return this._content.join("\n");
    }
    return "";
  }
}
