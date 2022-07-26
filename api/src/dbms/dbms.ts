import Collection, { CollectionPointer } from './collection.js';
import { JsonFileAdaptor } from './jsonFileAdaptor.js';
import { IBaseFileAdaptor } from './baseFileAdaptor.js';

export interface DbmsConfig {
  dataRootPath: string;
  metaDataRootPath: string;
}

/**
 * Embedded Javascript database manager with persistence in any textfile based structure like JSON, YAML, MarkDown
 */
class Dbms {
  private _collections: Map<string, Collection>;
  private _collectionsIndexFileAdaptor: JsonFileAdaptor<Array<CollectionPointer>>;

  config: DbmsConfig;

  /**
   * Create a new database management instance
   * @param dbmsConfig Instance configuration
   */
  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig;

    this._collectionsIndexFileAdaptor = new JsonFileAdaptor(this.config.metaDataRootPath, "/collections-index.json")

    this._collections = new Map()

    /**
     * Adds or updates an element with a specified key and a value
     * @param key unique alphamumeric value. 
     */
    this.Collections.set = (key: string, value: Collection): Map<string, Collection> => {
      if (key !== value.name) throw new Error("`key` and `Collection.name` must be the same");
      const cc = Map.prototype.set.call(this._collections, key, value);
      this._collections = cc;
      this.saveCollectionsIndexToDisk(this._collections);
      return this._collections;
    }

    //TODO: override clear() and delete() to deal with persistence


    this.Collections.add = (name: string, data?: object): Collection => {
      const c = new Collection(name, this);
      this.Collections.set(c.name, c);
      return c;
    }

  }


  get Collections(): Map<string, Collection> {
    if (this._collections.size === 0 && this._collectionsIndexFileAdaptor.fileExists()) {
      console.log("Collections() cache miss.")
      const ci = this.loadCollectionsIndexFromDisk()
      const c = new Map<string, Collection>();
      ci.forEach((e: CollectionPointer) => {
        c.set(e.name, new Collection(e.name, this))
      });
      this._collections = c;
    }
    return this._collections
  }

  /**
   * Call this when shutting down app to clean up
   */
  destroy(): void {
    // TODO: add clean up code, close any connection, filehandles etc.  
  }

  private saveCollectionsIndexToDisk(collections: Map<string, Collection>) {
    console.log("saveCollectionsIndexToDisk")

    const collectionsIndexArray = new Array<CollectionPointer>();


    collections.forEach((value: Collection, key: string) => {
      collectionsIndexArray.push({ name: value.name, reldirname: value.reldirname })
    });

    this._collectionsIndexFileAdaptor.saveToDisk(collectionsIndexArray)
  }

  private loadCollectionsIndexFromDisk(): Array<CollectionPointer> {
    const cp: Array<CollectionPointer> | undefined = this._collectionsIndexFileAdaptor.loadFromDisk()
    if (cp === undefined) throw new Error("Collection index data load from fisk failed!")

    return cp
  }

}

export default Dbms;


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




