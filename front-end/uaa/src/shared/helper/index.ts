import type { Moment } from "moment";

export const cleanEmpty = (obj: Record<string, any>) =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, value]) => value !== "" && value !== undefined && value !== null,
        ),
    );

export const buildDateRange = (range?: [Moment, Moment]) => {
    if (!range || range.length !== 2) return undefined;

    const [from, to] = range;

    return {
        from: from.startOf("day").toISOString(),
        to: to.endOf("day").toISOString(),
    };
};