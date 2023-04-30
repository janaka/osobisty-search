import fs from 'fs';
import { IStorageAdapter } from './IStorageAdapter';
import { ISerializer } from "./ISerializer";
import { IAbstractStorageAdapterFactory } from './IAbstractStorageAdapterFactory';


export class DiskStorageAdapter implements IStorageAdapter {

  private _serializer: ISerializer<any>;
  // _fqfilename: string;
  // filename: string;
  // path: string;
  // /**
  //  * @param path fully qualified path to where `filename` will be persisted. Include leading slash
  //  * @param filename filename to load/save on disk.
  //  */
  // constructor(path: string, filename: string) {
  //   this.path = path;
  //   this.filename = filename;
  //   this._fqfilename = path + filename
  //   if (!this.dirExists()) {
  //     throw new Error("`path`:" + this.path + " doesn't exist. Please make sure the path exists.")
  //   }
  // }
  constructor(serializer: ISerializer<any>) {
    this._serializer = serializer;
  }

  /**
   * Permanently deleted the file or folder from disk. We should be able to depend on the backing storage API for recycle bin (untested).
   * @param path path to the file to delete
   * @param filename name of the file or folder to delete
   */
  deleteFromDisk(path: string, filename: string): void {
    const _fqfilename: string = DiskStorageAdapter.fqfilename(path, filename);
    // ref: https://nodejs.org/api/fs.html#fsrmsyncpath-options
    console.log("deleteFromDisk(`" + _fqfilename + "`)");
    fs.rmSync(_fqfilename, { force: true, recursive: true })
    //throw new Error('Method not implemented.');
  }

  /**
   * Save data to disk at what ever structure implemented in by the `serializer()` method.
   * @param data as `object`
   */
  public async saveToDisk(data: object, path: string, filename: string): Promise<void> {
    const s: string = this._serializer.serialize(data);
    const _fqfilename: string = DiskStorageAdapter.fqfilename(path, filename);

    try {
      // if (!DiskStorageAdapter.dirExists(path)) {
      //   throw new Error("`path`:" + path + " doesn't exist. Please make sure the path exists.");
      // }

      console.log("MD serialized data, just before calling fs.writefile(): ", s);
      if (this.fileExists(path, filename)) {
        fs.truncate(_fqfilename, 0, (error: any) => {
          if (error)
            throw new Error("DiskStorageAdaptor.saveToDisk() saving failed. Fine truncate failed. Filename: " + _fqfilename + " " + error);

        });
      }
      //TODO: switch to syncfile write
      fs.writeFile(_fqfilename, s, 'utf-8', (error: any) => {
        if (error)
          throw new Error("DiskStorageAdaptor.saveToDisk() saving failed. Filename: " + _fqfilename + " " + error);
      });
      console.log("DiskStorageAdaptor.saveToDisk() saved successfully. Filename: " + _fqfilename);
    } catch (error) {
      throw new Error("Save failed" + error);
    }
  }

  /**
   * Load data from disk and deserialize using the implementation specific deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as a type `T` using the concreate deserializer() method.
   */
  public loadFromDisk(path: string, filename: string): object | undefined {
    let fqfn: string = "";
    let c: object | undefined;
    let s: string = "";
    //let b: Buffer;
    try {
      fqfn = DiskStorageAdapter.fqfilename(path, filename);
      s = fs.readFileSync(fqfn, "utf-8");
      if (s.length == 0) s = "[]" // bug/behaviour: readFileSync returns empty string when file has `[]` i.e empty array. Maybe copy function over to debug https://cs.github.com/nodejs/node/blob/2a7ac9298e896760ce3c1cfed8437fa8bdbde2bb/lib/fs.js#L464
     
      
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        console.log("DiskStorageAdaptor.loadFromDisk(" + fqfn + "): fs.readFileSync() error. File doesn't exist so returning `undefined`. Likely legit. " + error);
        return undefined;
      } else {
        throw new Error("DiskStorageAdaptor.loadFromDisk(" + fqfn + ") fs.readFileSync() error: " + error + ". Error Code: " + e.code + "data string: " + s);
      }
    } 

    try {
      console.log(`DiskStorageAdaptor.loadFromDisk() deserialize(): concrete serializer name: ${this._serializer.constructor.name}`);
      c = this._serializer.deserialize(s);
      return c;
    } catch (error) {
      throw new Error(`DiskStorageAdaptor.loadFromDisk(${fqfn}) deserialize() error. Concrete serializer name: ${this._serializer.constructor.name} , error message: ${error as NodeJS.ErrnoException}, data string: ${s}`);
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
   * Check if a file exists without touching (opening or modifiying)
   * @param {string} path pull path to the fileaname.
   * @param {string} filename name of the file to check
   * @returns `true` if exists else `false`
   */
  public fileExists(path: string, filename: string): boolean {
    try {
      fs.accessSync(DiskStorageAdapter.fqfilename(path, filename), fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the configrued adaptor `path` exits
   * @returns `true` if the directory exists, else `false`
   */
  private static dirExists(path: string): boolean {
    return fs.existsSync(path);
  }

  /**
   * Return a fully qualified path name
   * @param {string} path - full path with or without trailing slash.
   * @param {string} filename - filename with or without leading slash.
   * @returns
   */
  private static fqfilename(path: string, filename: string): string {
    if (!path.endsWith("/") && !filename.startsWith("/"))
      path += "/";
    return path + filename;
  }

}


export class DiskStorageAdaptorFactory implements IAbstractStorageAdapterFactory {
  GetInstance(serializer: ISerializer<any>): IStorageAdapter {
    return new DiskStorageAdapter(serializer);
  }
}