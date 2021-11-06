import fs, { cp } from 'fs';

export interface DbmsConfig {
  dataRootPath: string;
  metaDataRootPath: string;
}

/**
 * Embedded Javascript database manager with persistence in any textfile based structure like JSON, YAML, MarkDown
 */
export class Dbms {
  private _collections: Array<{[key: string | number]: Collection}>;
  private _collectionsIndexFileAdaptor: JsonFileAdaptor<Array<CollectionPointer>>;


  config: DbmsConfig;

  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig;

    this._collectionsIndexFileAdaptor = new JsonFileAdaptor(this.config.metaDataRootPath, "/collections-index.json")

    this._collections = new Array<{[key: string | number]: Collection}>();
    
  
    this._collections.push = (item:Collection):number => {
      Array.prototype.push.call(this._collections, item)
      this.saveCollectionsIndexToDisk(this._collections)
      return this._collections.length
    }
  }

  get Collections(): Array<{[key: string | number]: Collection}> {
    if (this._collections.length === 0 && this._collectionsIndexFileAdaptor.fileExists()) {
      console.log("Collections() cache miss.")
      const ci = this.loadCollectionsIndexFromDisk()
      const c = new Array<Collection>();
      ci.forEach((e:CollectionPointer) => {
        c.push(new Collection(e.name, this))
      });
      this._collections = c;
    }
    return this._collections
  }

  private saveCollectionsIndexToDisk(collections: Array<Collection>) {
    console.log("saveCollectionsIndexToDisk")

    const collectionsIndexArray = new Array<CollectionPointer>();

    collections.forEach((e: Collection) => {
      collectionsIndexArray.push({name: e.name, reldirname: e.reldirname})
    });

    this._collectionsIndexFileAdaptor.saveToDisk(collectionsIndexArray)
  }

  private loadCollectionsIndexFromDisk(): Array<CollectionPointer> {
    const cp = this._collectionsIndexFileAdaptor.loadFromDisk()
    if (cp === undefined) throw new Error("Collection index data load from fisk failed!")

    return cp
  }

}


export interface CollectionPointer {
  [index: string]: string,
  name: string,
  reldirname: string
}


//TODO: type collections to a particular document format like json, yaml, or text so we don't have to pass the fileadapter to each document instance
export class Collection {
  private _documents: Array<Document>;
  private _documentsIndexFileAdaptor: JsonFileAdaptor<Array<DocumentPointer>>;
  private _dbms: Dbms;
  private _fqpath:string;
  readonly name: string;
  readonly reldirname: string; 

  constructor(name:string, dbms:Dbms) {
    this._dbms = dbms;
    this.name = name;
    this.reldirname = "/"+name;
    this._fqpath = this._dbms.config.dataRootPath + this.reldirname

    this._documents = new Array<Document>();
    this._documentsIndexFileAdaptor = new JsonFileAdaptor(this._dbms.config.metaDataRootPath, "/" + this.name + "-documents-index.json")
    this._documents.push = (item:Document):number => {
      Array.prototype.push.call(this._documents, item)
      this.saveDocumentsIndexToDisk(this._documents)
      return this._documents.length
    }
    
    if (!fs.existsSync(this._fqpath)) {
      fs.mkdir(this._fqpath,(error)=> {
        if (error) throw new Error("Collection dir creation failed. Error:" + error)
      })
    }

  }

  get Documents(): Array<Document> {
    if (this._documents.length === 0 && this._documentsIndexFileAdaptor.fileExists()) {
      console.log("Dcouments() cache miss.")
      const ci = this.loadDocumentsIndexFromDisk()
      const c = new Array<Document>();
      ci.forEach((e:DocumentPointer) => {
        c.push(new Document(e.name, this._dbms, e.reldirname))
      });
      this._documents = c;
    }
    return this._documents
  }

  private saveDocumentsIndexToDisk(documents: Array<Document>) {
    console.log("saveDocumentsIndexToDisk")

    const documentsIndexArray = new Array<DocumentPointer>();

    documents.forEach((e: Document) => {
      documentsIndexArray.push({name: e.name, reldirname: this.reldirname, filename: e.filename})
    });

    this._documentsIndexFileAdaptor.saveToDisk(documentsIndexArray)
  }

  private loadDocumentsIndexFromDisk(): Array<DocumentPointer> {
    const cp = this._documentsIndexFileAdaptor.loadFromDisk()
    if (cp === undefined) throw new Error("Collection index data load from fisk failed!")

    return cp
  }

}

export interface DocumentPointer {
  [index: string]: string,
  name: string,
  reldirname: string,
  filename: string
}

/**
 * Collection is a container for a JS object.
 * Think of it as a colleciton of documents.
 * But we aren't going to be oppinionated about the stucture.
 * Consumers will use standard functionality such as Array.push
 */
export class Document {
  private _dbms: Dbms;
  private _data: object | undefined;
  private _documentFileAdaptor: BaseFileAdaptor<object>;
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
    this._data = {}; 
  
    //console.log("2: "+ this._fqpath)

    this._documentFileAdaptor = new JsonFileAdaptor<object>(this._fqpath, this.filename);
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
    if (this._data != undefined) {
      this._documentFileAdaptor.saveToDisk(this._data)
    }
  }

}



/**
 * Inherit to implement file format specific adaptor classes. Example: json or yaml or Markdown + FrontMatter. 
 * Collection instances use this to manage persistance.
 */
abstract class BaseFileAdaptor<T> {
  _fqfilename: string;

  filename:string;
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
  async saveToDisk(data: T) {
    const s: string = this.serialize(data);
    //TODO: do we need to control append vs replace content?
    console.log("1:"+this._fqfilename)
    // if (this.fileExists(this._fqfilename)) {

    // }
    fs.writeFile(this._fqfilename, s, 'utf-8', (error: any) => {
      if (error) throw new Error("Saving failed. File: "+ this._fqfilename + "error: "+ error) 
    })
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
      throw new Error("loadFromDisk() failed. Error: "+ error)
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

/**
 * Persist objects as JSON string without modifying the structure.
 */
export class JsonFileAdaptor<T> extends BaseFileAdaptor<T> {
  serialize(data: T): string {
    return JSON.stringify(data);
  }
  deserialize(data: string): T {
    const result:T = JSON.parse(data)
    return result
  }
}


// const safeJsonParse = <T>(guard: (o: any) => o is T) => 
//   (data: string): ParseResult<T> => {
//     const parsed = JSON.parse(data)
//     return guard(parsed) ? { parsed, hasError: false } : { hasError: true }
//   }

// type ParseResult<T> =
//   | { parsed: T; hasError: false; error?: undefined }
//   | { parsed?: undefined; hasError: true; error?: unknown }

/**
 * config

Dbms

dbms.collections.create/delete

dbms.collection[sadfsd]:collection

collection.data: object

collection.save

collections : index 
-collection : folder : fileAdaptor
--documents : index
---document : file

documents.




 */




