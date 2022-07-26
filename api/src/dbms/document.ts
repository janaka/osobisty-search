import { threadId } from "worker_threads";
import BaseFileAdaptor, { IBaseFileAdaptor } from "./baseFileAdaptor.js";
import Dbms from "./dbms";
import { JsonFileAdaptor } from "./jsonFileAdaptor.js";

export interface DocumentPointer {
  [index: string]: string,
  name: string,
  reldirname: string,
  filename: string
}

/**
 * Document is a thin wrapper for a JS object.
 * 
 * We aren't going to be oppinionated about the stucture.
 * This means you can create a type to represent any format of data.
 * Then handle the format specific (de)serialisation needs by creating FileAdaptor by inheriting the `BaseFileAdaptor`
 * 
 */
class Document {
  private _dbms: Dbms;
  private _data: object | undefined;
  private _documentFileAdaptor: IBaseFileAdaptor<object>;
  private _fqpath: string;
  private _reldirname: string;

  /**
   * Unique name of the document. Also the naming convention for the persisted file.
   */
  readonly name: string;
  readonly filename: string;

  constructor(name: string, dbms: Dbms, reldirname: string) {
    this._dbms = dbms;
    this.name = name;
    this._reldirname = reldirname
    this.filename = "/" + name + ".json";
    this._fqpath = this._dbms.config.dataRootPath + this._reldirname
    //this._data;

    //console.log("2: "+ this._fqpath)
    this._documentFileAdaptor = this._dbms.config.fileAdaptorFactory.GetInstance(this._fqpath, this.filename)
    //this._documentFileAdaptor = new JsonFileAdaptor<object>(this._fqpath, this.filename);
    //this._documentFileAdaptor = new this._dbms.config.fileAdaptor<object>(this._fqpath, this.filename);
    
  }

  /**
   * Document data
   */
  get data(): object | undefined {
    //TODO: figure out async
    if (this._data == undefined || this._data === null) {
      this._data = this._documentFileAdaptor.loadFromDisk();
    }
    return this._data;
  }

  set data(data: object | undefined) {
    this._data = data
  }

  /**
   * Persist changes to file on disk
   */
  async save() {
    if (this._data !== undefined) {
      this._documentFileAdaptor.saveToDisk(this._data)
      console.log("`Document.save() fired`")
    } else {
      console.log("`data` property is `undefined` so nothing saved to disk")
    }
  }

}

export default Document;