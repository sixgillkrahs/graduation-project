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

export function formatChatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 10) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (diffDays <= 0) return "Hôm qua";
  return `${diffDays} ngày trước`;
}
