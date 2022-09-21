import Dbms from "./dbms.js";
import { ISerializer } from "./ISerializer.js";
import { IStorageAdapter } from "./IStorageAdapter.js";
import { Mutex } from 'async-mutex';
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
export class Document {
  private _dbms: Dbms;
  private _data: any | undefined;
  //private _documentFileAdaptor: IBaseFileAdaptor<object>;
  private _storageAdaptor: IStorageAdapter;
  private _dataSerializer: ISerializer<any>;
  private _fqpath: string;
  private _reldirname: string;
  private readonly _documentMutex: Mutex;
  /**
   * Unique name of the document. Also the naming convension for the persisted file.
   */
  readonly name: string;
  readonly filename: string;


  /**
   * @param filename1 filename including extension, no leading slash e..g `something.json` . If the file exists at the
   * @reldirname it will be bound. Else new file created.
   * @param dbms reference to the dbms singleton instance.
   * @param reldirname relative directory where this file is/will be located. Include leader slash
   */
  constructor(filename1: string, dbms: Dbms, reldirname: string);
  /**
   * 
   * @param {string} name Unique name of the document. Also the naming convension for the persisted file unless @filename1 (see below). File extension is set by the serializer.
   * @param {Dbms} dbms 
   * @param {string} reldirname path to the data @filename relative to the datarootpath configured for the single Dbms instance. Include leading slash.
   * @param {string} filename1 (optional) filename including extension, no leading slash e..g `something.json` . If the file exists at the
   * @reldirname it will be bound. Else new file created. The name part of the file name will be assigned to property name ignoring the constructure param @name
   */
  constructor(name: string, dbms: Dbms, reldirname: string, filename1?: string) {
    this._dbms = dbms;
    this._dataSerializer = this._dbms.config.dataSerializerFactory.GetInstance();
    this._storageAdaptor = this._dbms.config.storageAdaptorFactory.GetInstance(this._dataSerializer)
    this.name = filename1 ? filename1.split(".")[0] : name;
    this._reldirname = reldirname
    this.filename = filename1 ? "/" + filename1 : "/" + name + this._dataSerializer.defaultFileExtension;
    this._fqpath = this._dbms.config.dataRootPath + this._reldirname
    this._documentMutex = new Mutex();


    if (this._storageAdaptor.fileExists(this._fqpath, this.filename)) {
      this._data = this._storageAdaptor.loadFromDisk(this._fqpath, this.filename)
    }


  }


  /**
   * Document data, that is the deserialized contents of the file. 
   */
  get data(): any | undefined {

    // if (this._data == undefined || this._data === null) {
    //   this._storageAdaptor.loadFromDisk(this._fqpath, this.filename)
    // }
    return this._data;
  }

  set data(data: any | undefined) {
    this._data = data
  }

  /**
   * Persist changes to file on disk
   */
  async save() {
    await this._documentMutex.runExclusive(async () => {
      if (this._data !== undefined) {
        //this._documentFileAdaptor.saveToDisk(this._data)
        this._storageAdaptor.saveToDisk(this._data, this._fqpath, this.filename)
        console.log("`Document.save() fired`")
      } else {
        console.info("`data` property is `undefined` so nothing saved to disk")
      }
    })
    
  }

  /**
   * Delete the persisted file from storage
   */
   delete() {
    this._documentMutex.runExclusive(() => {
      
        //this._documentFileAdaptor.saveToDisk(this._data)
        this._storageAdaptor.deleteFromDisk(this._fqpath, this.filename)
        console.log("`Document.delete() fired`")
      
    })
    
  }

}

export default Document;