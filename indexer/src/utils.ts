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

/**
 * Sleep for `time` 
 * @param time to sleep in milliseconds
 * @returns 
 */
export function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
} 
/**
 * Generate a random number between the range
 * @param min 
 * @param max 
 * @returns random number
 */
export function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
