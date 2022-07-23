import BaseFileAdaptor from './baseFileAdaptor.js'

/**
 * Persist objects as JSON string without modifying the structure.
 */
 export class JsonFileAdaptor<T> extends BaseFileAdaptor<T> {
  serialize(data: T): string {
    return JSON.stringify(data);
  }
  deserialize(data: string): T {
    const result: T = JSON.parse(data)
    return result
  }
}
