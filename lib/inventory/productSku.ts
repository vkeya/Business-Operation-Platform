export function getProductSkuPrefix(
  categoryName?: string | null,
): string {
  if (!categoryName) {
    return "PRD";
  }

  const normalized =
    categoryName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  if (!normalized) {
    return "PRD";
  }

  return normalized.slice(0, 3);
}
