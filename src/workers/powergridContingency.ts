import {
  compareSingleBranchOutages,
  type MeshedInputs,
} from "../engine/powergridMeshed";

export type ContingencyRequest = {
  input: MeshedInputs;
  baseline: Parameters<typeof compareSingleBranchOutages>[1];
};

export type ContingencyResponse =
  | { comparison: ReturnType<typeof compareSingleBranchOutages> }
  | { error: true };

self.onmessage = ({ data }: MessageEvent<ContingencyRequest>) => {
  try {
    const response: ContingencyResponse = {
      comparison: compareSingleBranchOutages(data.input, data.baseline),
    };
    self.postMessage(response);
  } catch {
    const response: ContingencyResponse = { error: true };
    self.postMessage(response);
  }
};
