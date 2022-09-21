import { ISerializer } from "./ISerializer.js";


/**
 * Implement this interface to create adaptors for different types of storage systems like local disk, Google Drive, S3 etc.
 */
export interface IStorageAdapter {
  
  //TODO: refactor to remove 'toDisk' from the method names


  /**
   * Save data to disk in what ever structure implemented in by the `serializer()` method.
   * @param {object} data as `object`
   */
  saveToDisk(data: object, path: string, filename: string): Promise<void>;
    /**
   * Load data from disk and deserialize using a deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as a type `T` using the concreate deserializer() method.
   */
  loadFromDisk(path: string, filename: string): object | undefined;

  /**
   * Permanently deleted the file or folder from disk. We should be able to depend on the backing storage API for recycle bin (untested).
   * @param path path to the file to delete
   * @param filename name of the file or folder to delete
   */
  deleteFromDisk(path: string, filename: string): void;

  fileExists(path: string, filename: string): boolean;
}
