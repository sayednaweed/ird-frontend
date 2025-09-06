import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { CACHE, CALENDAR, CALENDAR_LOCALE } from "@/lib/constants";
import { getCalender } from "@/lib/utils";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import type { Calendar, Locale } from "react-date-object";
export interface SystemLanguage {
  calendar: Calendar | undefined;
  local: Locale | undefined;
  info: {
    calendarId: string;
    localeId: string;
  };
  format: string;
}
type State = {
  systemLanguage: SystemLanguage;
};

type Action = { type: "changeLanguage"; payload: SystemLanguage };

const initialState: State = {
  systemLanguage: {
    calendar: gregorian,
    local: gregorian_en,
    info: {
      calendarId: CALENDAR.Gregorian,
      localeId: CALENDAR_LOCALE.english,
    },
    format: "YYYY-MM-DD hh:mm A",
  },
};

const GlobalStateContext = createContext<
  [State, React.Dispatch<Action>] | undefined
>(undefined);

const globalStateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "changeLanguage":
      return { ...state, systemLanguage: action.payload };
    default:
      return state;
  }
};

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getComponentCache } = useCacheDB();
  const [state, dispatch] = useReducer(globalStateReducer, initialState);
  const initialize = async () => {
    const calendar = await getComponentCache(CACHE.SYSTEM_CALENDAR);
    if (calendar) {
      const { calender, locale } = getCalender(
        calendar.value.calendarId,
        calendar.value.localeId
      );
      dispatch({
        type: "changeLanguage",
        payload: {
          calendar: calender,
          local: locale,
          info: {
            calendarId: calendar.value.calendarId,
            localeId: calendar.value.localeId,
          },
          format: calendar.value.format,
        },
      });
    }
  };
  useEffect(() => {
    initialize();
  }, []);
  return (
    <GlobalStateContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
