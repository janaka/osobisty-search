import fs from 'fs';

export interface IBaseFileAdaptor<T> {
  serialize(data: T): string;
  deserialize(data: string): T;
  saveToDisk(data: T): Promise<void>;
  loadFromDisk(): T | undefined;
  fileExists(): boolean;
}

/**
 * Inherit to implement file format specific adaptor classes. Example: json or yaml or Markdown + FrontMatter. 
 * Collection instances use this to manage persistance.
 * <T> is the type of the object being handled
 */
 abstract class BaseFileAdaptor<T> implements IBaseFileAdaptor<T> {
  _fqfilename: string;

  filename: string;
  path: string;

  /**
   * @param path fully qualified path to where `filename` will be persisted. Include leading slash
   * @param filename filename to load/save on disk.
   */
  constructor(path: string, filename: string) {
    this.path = path;
    this.filename = filename;
    this._fqfilename = path + filename

    if (!this.dirExists()) {
      throw new Error("`path`:" + this.path + " doesn't exist. Please make sure the path exists.")
    }
  }

  /**
   * Data Json object to string. 
   */
  abstract serialize(data: T): string

  /**
   * Data string to Json object
   */
  abstract deserialize(data: string): T

  /**
   * Save data of type `T` to disk at what ever structure implemented in by the `serializer()` method.
   * @param data as `object`
   */
  async saveToDisk(data: T): Promise<void> {
    const s: string = this.serialize(data);
    //TODO: do we need to control append vs replace content?
    
    // if (this.fileExists(this._fqfilename)) {

    // }
    fs.writeFile(this._fqfilename, s, 'utf-8', (error: any) => {
      if (error) throw new Error("BaseFileAdaptor.saveToDisk() saving failed. Filename: " + this._fqfilename + " " + error)
    })
    console.log("BaseFileAdaptor.saveToDisk() saved successfully. Filename: " + this._fqfilename)
  }

  /**
   * Load data from disk and deserialize using the implementation specific deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as a type `T` using the concreate deserializer() method.
   */
  loadFromDisk(): T | undefined {
    try {
      const s: string = fs.readFileSync(this._fqfilename, "utf-8")
      let c: T | undefined = this.deserialize(s);
      return c;
    } catch (error) {
      const e = error as NodeJS.ErrnoException
      if (e.code==="ENOENT") { 
        console.log("BaseFileAdaptor.loadFromDisk() file doesn't exist so returning `undefined`. Likely legit. " + error)
        return undefined
      } else {
        throw new Error("BaseFileAdaptor.loadFromDisk() failed. " + error)
      }
    }

    // fs.readFileSync(this._fqfilename, 'utf-8', (error: any, data: string) => {
    //   if (!error) throw new Error("loadFromDisk() failed. Error: "+ error);
    //   if (data) {
    //     console.log("raw data:"+data)
    //     c = this.deserialize(data);
    //   }
    // })



  }

  /**
   * Check a file exists with the configured `path`
   * @param filename Check if the file exists without opening or modifiying
   * @returns `true` if exists else `false`
   */
  fileExists(): boolean {
    try {
      fs.accessSync(this._fqfilename, fs.constants.F_OK)
      return true;
    } catch (error) {
      return false;
    }



  }

  /**
   * Check if the configrued adaptor `path` exits
   * @returns `true` if the directory exists, else `false`
   */
  private dirExists(): boolean {
    return fs.existsSync(this.path)
  }
}

export default BaseFileAdaptor