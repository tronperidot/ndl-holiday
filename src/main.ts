import { config } from "dotenv";
import { CalendarAuthService } from "./services/CalendarAuthService";
import { NdlHolidayService } from "./services/NdlHolidayService";
import { InsertParams } from "./models/InsertParams";
import { GoogleCalendarService } from "./services/GoogleCalendarService";
config({ path: ".env" });

const authService = new CalendarAuthService();
const ndlService = new NdlHolidayService();

const main = async () => {
  const closedDateList = await ndlService.getHolidays();
  console.log(`holiday count: ${closedDateList.length}`);
  // console.log(closedDateList.map(d => d.toString()));
  const calendar = await authService.getCalendar();
  const calendarId = process.env.CALENDAR_ID!;
  const calendarService = new GoogleCalendarService(calendar, calendarId);
  const first = closedDateList[0];
  const events = await calendarService.getYearEvents(first.value.getFullYear());
  console.log(`a year event count: ${events.length}`);
  await calendarService.eventDeletes(events);
  const insertParamsList = closedDateList.map(
    holiday => new InsertParams(calendarId, holiday)
  );
  calendarService.eventInserts(insertParamsList);
};

main();
