export const createBullMqJobId = (...parts: Array<string | number | undefined>) =>
  parts
    .filter((part) => part !== undefined && part !== null && part !== "")
    .map((part) => String(part).replace(/[:\s]+/g, "-"))
    .join("-");
