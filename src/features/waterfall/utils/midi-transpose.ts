export function transposeMidi(
  midi: number,
  semitones: number,
): number | null {
  const shifted = midi + semitones
  if (shifted < 0 || shifted > 127) {
    return null
  }
  return shifted
}
