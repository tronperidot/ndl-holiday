import * as requeast from "request-promise";
import cheerio from "cheerio";
import { Holiday } from "../models/Holiday";

const URL = "https://www.ndl.go.jp/jp/tokyo/yearholiday.html";

export class NdlHolidayService {
  public getHolidays(): Promise<Holiday[]> {
    return requeast.get(URL).then(html => {
      const $ = cheerio.load(html);
      const selection = $(".dataSet")
        .find(".section")
        .find("ul");
      const closedDateList: Holiday[] = [];
      selection.map((_idx, element) => {
        element.children
          .filter(c => c.name === "li")
          .forEach(children => {
            // 2020 年 1 月
            const [year, , month] = $(".date_case", children)
              .find("span")
              .text()
              .split(/\s+/);
            // 1日、2日、3日、4日、5日、6日、12日、13日、15日、19日、26日
            const closedDays = $(".closed", children)
              .find("dd")
              .text()
              .split("、");
            closedDays.forEach(day => {
              closedDateList.push(
                new Holiday(year, month, day.replace("日", ""))
              );
            });
          });
      });
      return closedDateList;
    });
  }
}
