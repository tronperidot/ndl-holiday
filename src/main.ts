import { config } from "dotenv";
import { calendar_v3 } from "googleapis";
import { CalendarAuthService } from "./services/CalendarAuthService";
import { NdlHolidayService } from "./services/NdlHolidayService";
import { InsertParams } from "./models/InsertParams";
config({ path: ".env" });

const authService = new CalendarAuthService();
const ndlService = new NdlHolidayService();

const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
};

const main = async () => {
  const closedDateList = await ndlService.getHolidays();
  console.log(`holiday count: ${closedDateList.length}`);
  // console.log(closedDateList.map(d => d.toString()));
  const calendar = await authService.getCalendar();
  const calendarId = process.env.CALENDAR_ID!;
  const first = closedDateList[0];
  const last = closedDateList[closedDateList.length - 1];
  const events = await calendar.events.list({
    calendarId,
    timeMin: first.value.toISOString(),
    timeMax: last.value.toISOString()
  });
  console.log(`a year event count: ${events.data.items?.length}`);
  events.data.items?.forEach(item => {
    calendar.events.delete({
      calendarId,
      eventId: item.id!
    });
  });
  const insertParamsList = closedDateList.map(
    holiday => new InsertParams(calendarId, holiday)
  );
  eventInserts(calendar, insertParamsList);
};

const eventInserts = async (
  calendar: calendar_v3.Calendar,
  insertParamsList: InsertParams[]
) => {
  const retryList: InsertParams[] = [];
  for (const params of insertParamsList) {
    await calendar.events
      .insert(params.value)
      .then(value => {
        console.log(`inserted by:${value.data.start?.date}`);
      })
      .catch(err => {
        retryList.push(params);
      })
      .finally(() => sleep(300));
  }
  if (retryList.length > 0) {
    console.log(`retry data count: ${retryList.length}`);
    sleep(1000);
    eventInserts(calendar, retryList);
  } else {
    console.log("complate");
  }
};

main();
