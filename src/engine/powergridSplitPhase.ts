export const SPLIT_PHASE_MAX_LOAD_KW = 24;

export function calculateSplitPhase(
  l1KW: number,
  l2KW: number,
  lineToLineKW: number,
) {
  if (
    [l1KW, l2KW, lineToLineKW].some(
      (value) =>
        !Number.isFinite(value) || value < 0 || value > SPLIT_PHASE_MAX_LOAD_KW,
    )
  ) {
    return null;
  }

  const l1BranchA = (l1KW * 1_000) / 120;
  const l2BranchA = (l2KW * 1_000) / 120;
  const lineToLineA = (lineToLineKW * 1_000) / 240;
  return {
    l1A: l1BranchA + lineToLineA,
    l2A: l2BranchA + lineToLineA,
    neutralA: Math.abs(l1BranchA - l2BranchA),
    lineToLineA,
  };
}
