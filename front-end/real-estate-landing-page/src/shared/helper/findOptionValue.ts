export const findOptionValue = (
  text: string | undefined,
  options: { label: string; value: string }[],
) => {
  if (!text) return "";
  const lowerText = text.toLowerCase();
  // Try exact match first, then includes
  const match = options.find(
    (opt) =>
      opt.value.toLowerCase() === lowerText ||
      opt.label.toLowerCase() === lowerText ||
      opt.label.toLowerCase().includes(lowerText) ||
      lowerText.includes(opt.label.toLowerCase()) ||
      opt.value.toLowerCase().includes(lowerText),
  );
  return match ? match.value : "";
};

export const findOptionLabel = (
  value: string | undefined,
  options: { label: string; value: string }[],
) => {
  if (!value) return "";
  const lowerValue = value.toLowerCase();
  // Try exact match first
  const match = options.find(
    (opt) =>
      opt.value.toLowerCase() === lowerValue ||
      opt.label.toLowerCase() === lowerValue,
  );
  return match ? match.label : value;
};
