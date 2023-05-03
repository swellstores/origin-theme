/**
 * @param {Array<object>} variants
 * @returns {Set<string>}
 */
export function getVariantOptionIds(variants) {
  const optionSet = new Set();

  if (Array.isArray(variants)) {
    for (const { optionValueIds } of variants) {
      for (const id of optionValueIds) {
        optionSet.add(id);
      }
    }
  }

  return optionSet;
}
