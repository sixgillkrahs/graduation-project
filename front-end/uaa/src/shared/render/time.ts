import {
  defaultDateTimeFormatterSettings,
  formatDateTimeBySettings,
} from "gra-helper";

function toVietnamTime(isoString: string) {
  return formatDateTimeBySettings(isoString, defaultDateTimeFormatterSettings);
}

export { toVietnamTime };
