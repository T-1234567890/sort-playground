import type { Step } from "../../core/types";

export function manualSortSteps(input: number[]): Step[] {
  return [{
    array: [...input],
    action: "compare",
    indices: [],
  }];
}
