/**
 * Current date and time
 * 
 * @returns {string} ISO 8601 formated date YYYY-MM-DDThh:mm:ss+00:00
 */

export function dateTimeNowUtc(): string {
  let dateStr: string = "";
  const date = new Date();

  dateStr = date.getUTCFullYear.toString() + "-"
          + date.getUTCMonth.toString()  + "-"
          + date.getUTCDate.toString()  + "T"
          + date.getUTCHours.toString()  + ":"
          + date.getUTCMinutes.toString()  + ":"
          + date.getUTCSeconds.toString() + "+00:00" // explicit UTC


  return dateStr
}