

export interface ISerializer<T> {
  /**
   * Data type T to string.
   */
  serialize(data: T): string;

  /**
   * Data string to type T
   */
  deserialize(data: string): T;

  /**
   * Default file extension for this format.
   * Implement as a static property
   */
  defaultFileExtension: string;

}
