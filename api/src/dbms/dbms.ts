import Collection, { CollectionPointer } from './collection.js';
import { IStorageAdapter } from './IStorageAdapter.js';
import { JsonSerializer } from './JsonSerializer.js';
import { IAbstractSerializerFactory } from "./IAbstractSerializerFactory.js";
import { IAbstractStorageAdapterFactory } from './IAbstractStorageAdapterFactory.js';
import {Mutex} from 'async-mutex';

//TODO: 
// - reconsider how to handle new docs vs existing docs 1) binding 2) remove/delete handling the file deletion.
//   - consider adding an explicit file delete option rather than implicit when removed from the collection.
// - check that serializer and storageAdaptor are static
// - write a few more test cases
// - ADD MardownSerializer

/**
 * Configuration to instantiate a Dbms database instance
 */
export interface DbmsConfig {
  /** location where all data will be read/written */
  dataRootPath: string;
  /** location where Dbms metadata will be read/written */
  metaDataRootPath: string;

  /** An instence of a storate adaptor factory {IAbstractStorageAdaptorFactory} 
   * like {DiskStorageAdaptorFactory} for local disk storage. */
  storageAdaptorFactory: IAbstractStorageAdapterFactory

  /**
   * The serializer used to persist data (i.e. the value of `Document.data`). Example serializers: {JsonSerializer} or {MarkdownSerlializer}
   */
  dataSerializerFactory: IAbstractSerializerFactory
}

/**
 * Embedded Javascript database manager with persistence in any textfile based structure like JSON, YAML, MarkDown
 */
export class Dbms {
  private _collections: Map<string, Collection>;
  private _collectionsIndexFileName: string = "/collections-index.json";
  private _collectionIndexStorageAdaptor: IStorageAdapter;
  private readonly _collectionsIndexMutex: Mutex;


  config: DbmsConfig;



  /**
   * Create a new database management instance
   * @param dbmsConfig Instance configuration
   */
  constructor(dbmsConfig: DbmsConfig) {
    this._collectionsIndexMutex = new Mutex();
    this.config = dbmsConfig;

    // Serializing the index as json is an internal impelementaiton choice.
    // we want it to be fixed as opposed to the data serializer which is a configuration.
    // So hard code rather than couple to the data serializer passed in through config.
    this._collectionIndexStorageAdaptor = this.config.storageAdaptorFactory.GetInstance(new JsonSerializer())

    // reassigning `_collection` will overwite the assinged handler functions below.
    this._collections = this.initialiseCollections(); // this depends on the storage adapter being initialised

    /**
     * Override the default set() method
     * Adds or updates an element with a specified key and a value
     * @param key unique alphamumeric value. 
     */
    this._collections.set = (key: string, value: Collection): Map<string, Collection> => {
      if (key !== value.name) throw new Error("`key` and `Collection.name` must be the same");
      const cc = Map.prototype.set.call(this._collections, key, value);
      //this._collections = cc;

      console.log("just added collection. Map: ", JSON.stringify(this._collections))
      this.saveCollectionsIndexToDisk(this._collections);
      return this._collections;
    }

    //TODO: override clear() to deal with persistence


    /**
     * Add a new Collection. Key/name must be uniques
     */
    this._collections.add = (name: string): Collection => {
      if (this._collections.has(name)) throw new Error("Collection with key/name=`" + name + "` already exists! key must be unique.")
      const c = new Collection(name, this);
      this._collections.set(c.name, c);
      return c;
    }

    this._collections.delete = (key: string): boolean => {
      const isCollectionRemoved = Map.prototype.delete.call(this._collections, key);
      //TODO: delete the folder named `key`

      this.saveCollectionsIndexToDisk(this._collections);
      return isCollectionRemoved;
    }

    this._collections.remove = (name: string): boolean => {
      return this._collections.delete(name)
    }

    this._collections.get = (key: string): Collection | undefined => {
      const colleciton = Map.prototype.get.call(this._collections, key);

      return colleciton;
    }

    this._collections.has = (key: string): boolean => {
      const hasCollection = Map.prototype.has.call(this._collections, key);
      return hasCollection;
    }

  }


  get Collections(): Map<string, Collection> {

    // if (this._collections.size === 0 && this._collectionIndexStorageAdaptor.fileExists(this.config.metaDataRootPath, this._indexFileName)) {
    //   //const c = new Map<string, Collection>();
    //   console.log("Collections() cache miss.")
    //   const ci = this.loadCollectionsIndexFromDisk()

    //   ci.forEach((e: CollectionPointer) => {
    //     this._collections.add(e.name, new Collection(e.name, this))
    //   });
    // }
    return this._collections
  }

  /**
   * Call this when shutting down app to clean up
   */
  destroy(): void {
    // TODO: add clean up code, close any connection, filehandles etc.  
  }


/**
 * Call ONCE in the constructor to initialise the local collections field.
 * @returns 
 */
  private initialiseCollections(): Map<string, Collection> {
    const collections = new Map<string, Collection>();
    if (this._collectionIndexStorageAdaptor.fileExists(this.config.metaDataRootPath, this._collectionsIndexFileName)) {
      const ci: Array<CollectionPointer> = this.loadCollectionsIndexFromDisk();

      ci.forEach((cp: CollectionPointer) => {
        collections.add(cp.name, new Collection(cp.name, this))
      });
    }
    return collections;
  }

  private async saveCollectionsIndexToDisk(collections: Map<string, Collection>) {
    await this._collectionsIndexMutex.runExclusive(
      async() => {
        console.log("saveCollectionsIndexToDisk")

        const collectionsIndexArray = new Array<CollectionPointer>();
    
        collections.forEach((value: Collection, key: string) => {
          collectionsIndexArray.push({ name: value.name, reldirname: value.reldirname })
        });
    
        console.log("CollectionsIdexArray just before saving: ", JSON.stringify(collectionsIndexArray))
    
        await this._collectionIndexStorageAdaptor.saveToDisk(collectionsIndexArray, this.config.metaDataRootPath, this._collectionsIndexFileName)

      }
    )
  }

  private loadCollectionsIndexFromDisk(): Array<CollectionPointer> {

    let collectionsIndexArray: Array<CollectionPointer>;
    const collectionsIndexObject: object | undefined = this._collectionIndexStorageAdaptor.loadFromDisk(this.config.metaDataRootPath, this._collectionsIndexFileName)


    if (collectionsIndexObject === undefined) throw new Error("Collection index data load from fisk failed!");
    if (Array.isArray(collectionsIndexObject)) {

      try {
        //collectionsIndexArray.push(ele as CollectionPointer)  
        collectionsIndexArray = collectionsIndexObject as Array<CollectionPointer>
      } catch (error) {
        throw new Error("Collections index data load from fisk failed! Serialized format is incorrect or corrupt. Should be an Array<CollectionPointer>" + error)
      }

    } else {
      throw new Error("Collections index data load from fisk failed! Serialized format is incorrect or corrupt or not an Array. Should be an Array<CollectionPointer>");
    }

    return collectionsIndexArray;
  }

}

export default Dbms;







