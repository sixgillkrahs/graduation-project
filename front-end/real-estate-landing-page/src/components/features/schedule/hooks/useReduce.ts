import { SCHEDULE_TYPE } from "../dto/schedule.dto";

export type Action = {
  type: "SET_EVENTS" | "SET_FILTER_TYPE";
  payload: any;
};

export const reducer = (
  state: { events: any[]; filterType: SCHEDULE_TYPE | "ALL" },
  action: Action,
) => {
  switch (action.type) {
    case "SET_EVENTS":
      return {
        ...state,
        events: action.payload,
      };
    case "SET_FILTER_TYPE":
      return {
        ...state,
        filterType: action.payload,
      };
    default:
      return state;
  }
};
