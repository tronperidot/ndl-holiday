export class Holiday {
  value: Date;

  constructor(year: string, month: string, day: string) {
    this.value = new Date(Number(year), Number(month) - 1, Number(day));
  }

  toString(): string {
    return `${this.value.getFullYear()}-${this.value.getMonth() +
      1}-${this.value.getDate()}`;
  }
}
