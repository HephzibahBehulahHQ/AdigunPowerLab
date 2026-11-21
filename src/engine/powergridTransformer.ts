export interface TransformerLossModel {
  ratingKva: number;
  coreLossKw: number;
  ratedWindingLossKw: number;
}

export function calculateTransformerLoading(
  loadKva: number,
  powerFactor: number,
  { ratingKva, coreLossKw, ratedWindingLossKw }: TransformerLossModel,
) {
  if (
    ![loadKva, powerFactor, ratingKva, coreLossKw, ratedWindingLossKw].every(
      Number.isFinite,
    ) ||
    loadKva < 0 ||
    powerFactor <= 0 ||
    powerFactor > 1 ||
    ratingKva <= 0 ||
    coreLossKw < 0 ||
    ratedWindingLossKw < 0
  )
    throw new RangeError("Invalid transformer model inputs.");

  const loading = loadKva / ratingKva;
  const windingLossKw = ratedWindingLossKw * loading ** 2;
  const outputKw = loadKva * powerFactor;
  const lossKw = coreLossKw + windingLossKw;
  const inputKw = outputKw + lossKw;
  if (!Number.isFinite(loading) || !Number.isFinite(inputKw))
    throw new RangeError("Transformer results must be finite.");
  return {
    loadKva,
    powerFactor,
    loading,
    windingLossKw,
    outputKw,
    lossKw,
    inputKw,
    efficiency: inputKw > 0 ? outputKw / inputKw : null,
    overloaded: loading > 1,
  };
}
