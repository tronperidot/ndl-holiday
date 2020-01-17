import { Holiday } from "./Holiday";
import { calendar_v3 } from "googleapis";

export class InsertParams {
  readonly value: calendar_v3.Params$Resource$Events$Insert;

  constructor(calendarId: string, holiday: Holiday) {
    const date = holiday.toString();
    const requestBody: calendar_v3.Schema$Event = {
      summary: "国立国会図書館（休館日）",
      start: { date },
      end: { date },
      description:
        "年間スケジュール \n \n https://www.ndl.go.jp/jp/tokyo/yearholiday.html"
    };
    this.value = {
      calendarId,
      requestBody
    };
  }
}
