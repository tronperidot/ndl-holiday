import { calendar_v3 } from "googleapis";
import { InsertParams } from "../models/InsertParams";

export class GoogleCalendarService {
  calendar: calendar_v3.Calendar;
  calendarId: string;

  constructor(calendar: calendar_v3.Calendar, calendarId: string) {
    this.calendar = calendar;
    this.calendarId = calendarId;
  }

  public async getYearEvents(
    year: number
  ): Promise<calendar_v3.Schema$Event[]> {
    const currentYear = new Date(year);
    const nextYear = new Date(year + 1);
    const events = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: currentYear.toISOString(),
      timeMax: nextYear.toISOString()
    });
    return Promise.resolve(events.data.items || []);
  }

  public async eventInserts(insertParamsList: InsertParams[]) {
    const retryList: InsertParams[] = [];
    for (const params of insertParamsList) {
      await this.calendar.events
        .insert(params.value)
        .then(value => console.log(`inserted by:${value.data.start?.date}`))
        .catch(_err => retryList.push(params))
        .finally(() => this.sleep(300));
    }
    if (retryList.length > 0) {
      console.log(`retry data count: ${retryList.length}`);
      this.sleep(1000);
      this.eventInserts(retryList);
    } else {
      console.log("complate");
    }
  }

  public async eventDeletes(events: calendar_v3.Schema$Event[] = []) {
    const retryList: calendar_v3.Schema$Event[] = [];
    for (const event of events) {
      await this.calendar.events
        .delete({
          calendarId: this.calendarId,
          eventId: event.id!
        })
        .catch(_err => retryList.push(event))
        .finally(() => this.sleep(300));
    }
    if (retryList.length > 0) {
      console.log(`retry data count: ${retryList.length}`);
      this.sleep(1000);
      this.eventDeletes(retryList);
    } else {
      console.log("complate");
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }
}
