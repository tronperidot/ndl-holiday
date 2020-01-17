import { CalendarAuthService } from "./services/CalendarAuthService";
import { config } from "dotenv";
import { NdlHolidayService } from "./services/NdlHolidayService";
config({ path: ".env" });

const authService = new CalendarAuthService();
const ndlService = new NdlHolidayService();

const main = async () => {
  const closedDateList = await ndlService.getHolidays();
  console.log(closedDateList.map(d => d.toString()));
  const calendar = await authService.getCalendar();
  calendar.events
    .list({
      calendarId: process.env.CALENDAR_ID
    })
    .then(value => {
      console.log(value);
    });
};

main();
console.log(process.env.CALENDAR_ID);
