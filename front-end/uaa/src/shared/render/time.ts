import {
  defaultDateTimeFormatterSettings,
  formatDateTimeBySettings,
} from "../../../../shared/date-time/formatter";

function toVietnamTime(isoString: string) {
  return formatDateTimeBySettings(isoString, defaultDateTimeFormatterSettings);
}

export { toVietnamTime };
