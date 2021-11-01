
import fs from 'fs';
import { object } from 'joi';


export interface DbmsConfig {
  dataRootPath: string;
  metaDataRootPath: string;
}

/**
 * Embedded Javascript database manager with persistence in any textfile based structure like JSON, YAML, MarkDown
 */
export class Dbms {

  config: DbmsConfig;
  private _collections: Array<Collection>;


  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig; // TODO: if paths don't exist then create them
    this._collections = []

  }


  get Collections(): Collection[] {
    if (this._collections === undefined) {
      this._collections = this.loadCollectionsIndex()
    }
    return this._collections
  }

  private loadCollectionsIndex(): Array<Collection> {
    //TODO: implement collection index persistence
    throw new Error('Method not implemented.');
    return new Array<Collection>();
  }

}



/**
 * Collection is a container for a JS object.
 * Think of it as a colleciton of documents.
 * But we aren't going to be oppinionated about the stucture.
 * Consumers will use standard functionality such as Array.push
 */
export class Collection {
  private _dbms: Dbms;
  _data: object;
  _fileAdaptor: BaseFileAdaptor;

  readonly name: string;
  //readonly filename: string;

  constructor(name: string, dbms: Dbms, fileAdaptor: BaseFileAdaptor) {
    this.name = name;
    //this.filename = name + ".json";
    this._data = {}; //TODO: extend Object and figure out how to remove the data property
    this._dbms = dbms;
    this._fileAdaptor = fileAdaptor;
  }

/**
 * Collection data
 */
  get data(): object {
    //TODO: figure out async
    if (this._data == undefined || this._data === null) {
      this._data = this._fileAdaptor.loadFromDisk();
    }
    return this._data;
  }

  /**
   * Persist changes to fiel on disk
   */
  async save() {
    this._fileAdaptor.saveToDisk(this._data)
  }

}


/**
 * Inherit to implement file format specific adaptor classes. Example: json or yaml or Markdown + FrontMatter. 
 * Collection instances use this to manage persistance.
 */
abstract class BaseFileAdaptor {

  filename:string;

  /**
   * 
   * @param filename filename, with fully qualified path, to load/save on disk.
   */
  constructor(filename:string) {
    this.filename = filename
  }

  /**
   * Json object to string. 
   */
  abstract serialize(collectionData: object): string

  /**
   * string to Json object
   */
  abstract deserialize(collectionData: string): object


  /**
   * Save data to disk is whatevery structure implemented in by the `serializer()`  method.
   * @param collectionData `object`
   */
  async saveToDisk(collectionData: object) {
    const s: string = this.serialize(collectionData);
    
    fs.writeFile(this.filename, s, 'utf-8', (error: any) => {
      if (error) throw error
    })
  }

  /**
   * Load data from disk and deserialize using the implementation specific deserializer.
   * Expects the file to be in UTF-8
   * @returns deserialized file data as an `object`.
   */
  async loadFromDisk(): Promise<object> {
    const s:string = "";

    let c: object = {};
    if (this.fileExists(this.filename)) {
      fs.readFile(this.filename, 'utf-8', (error: any, data: string) => {
        if (!error) throw new Error(error);
        if (data) {
          c = this.deserialize(data);
        }
      })
    }
    return c;
    
  }

  /**
   * 
   * @param filename Check if the file exists without opening or modifiying
   * @returns `true` if exists else `false`
   */
  private fileExists(filename: string): boolean {
    let exists: boolean = false
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(err)
        exists = false;
      } else {
        exists = true;
      }
    })
    return exists
  }



}

/**
 * Persist objects as JSON string without modifying the structure.
 */
export class JsonFileAdaptor extends BaseFileAdaptor {
  serialize(collectionData: object): string {
    return object.toString();
  }
  deserialize(collectionData: string): object {
    return JSON.parse(collectionData);
  }
}

/**
 * config

Dbms

dbms.collections.create/delete

dbms.collection[sadfsd]:collection

collection.data: object

collection.save
 */




