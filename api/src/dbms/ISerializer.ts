

export interface ISerializer {
  /**
   * Data Json object to string.
   */
  serialize(data: object): string;

  /**
   * Data string to Json object
   */
  deserialize(data: string): object;

  /**
   * Default file extension for this format.
   * Implement as a static property
   */
  defaultFileExtension: string;
}
