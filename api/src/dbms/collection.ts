import Dbms from "./dbms.js";
import { JsonSerializer } from "./JsonSerializer.js";
import { IStorageAdapter } from "./IStorageAdapter.js";
import Document, { DocumentPointer } from "./document.js";
import { DiskStorageAdapter } from "./DiskStorageAdapter.js";
import fs from 'fs'
import { Mutex } from "async-mutex";
import { throws } from "assert";
import { logger } from "../utils/logger.js";


export interface CollectionPointer {
  [index: string]: string,
  name: string,
  reldirname: string
}

/**
 * A collection of `Document`s of type `Map`
 * 
 */
class Collection {
  private _dbms: Dbms;
  private _documents: Map<string, Document>;
  private _documentsIndexStorageAdaptor: IStorageAdapter;
  private _documentsIndexFileName: string;
  private readonly _documentsIndexMutex: Mutex;

  private _fqpath: string;

  readonly name: string;
  readonly reldirname: string;

  constructor(name: string, dbms: Dbms) {
    this._documentsIndexMutex = new Mutex();
    this._dbms = dbms;
    if (name.includes("/")) throw new Error("Invalid collection name `" + name + "`. Slash character is not allowed! Path selector syntax not supported yet.");
    this.name = name;
    this.reldirname = "/" + name;
    this._fqpath = this._dbms.config.dataRootPath + this.reldirname;
    this._documentsIndexFileName = this.name + "-documents-index.json";

    // Serializing the index as json is an internal impelementaiton choice.
    // we want it to be fixed as opposed to the data serializer which is a configuration.
    // So hard code rather than couple to the data serializer passed in through config.
    this._documentsIndexStorageAdaptor = this._dbms.config.storageAdaptorFactory.GetInstance(new JsonSerializer())

    this._documents = this.initialiseDocuments(); // this depends on the storage adapter being initialised


    /**
     * Adds or updates an element with a specified key and a value
     * @param key unique alphamumeric value. 
     */
    this._documents.set = (key: string, value: Document): Map<string, Document> => {
      if (key !== value.name) throw new Error("`key` and `Document.name` must be the same")
      const dd = Map.prototype.set.call(this._documents, key, value)
      this._documents = dd;
      value.save(); // persist the document data
      this.saveDocumentsIndexToDisk(this._documents);
      return this._documents
    }

    /**
     * adds Document to collection and calls save to disk
     */
    this._documents.add = (name: string, data?: object): Document => {
      const d = new Document(name, this._dbms, this.reldirname);
      if (d.data == undefined && data) d.data = data;
      this._documents.set(d.name, d);
      return d
    }

    /**
     * Deletes the file from storage and
     * Removes the file from the in-mem collection
     */
    this._documents.delete = (key: string): boolean => {

      this._documents.get(key)?.delete();

      const isDocumentRemoved = Map.prototype.delete.call(this._documents, key);

      this.saveDocumentsIndexToDisk(this._documents);
      return isDocumentRemoved;
    }

    /**
     * Remove the file JUST from the in-mem collection.
     * Does NOT delete the file from storage
     */
    this._documents.remove = (name: string): boolean => {
      const isDocumentRemoved = Map.prototype.delete.call(this._documents, name);
      this.saveDocumentsIndexToDisk(this._documents);
      return isDocumentRemoved
    }

    this._documents.get = (key: string): Document | undefined => {
      const document = Map.prototype.get.call(this._documents, key);

      return document;
    }

    this._documents.has = (key: string): boolean => {
      const hasCollection = Map.prototype.has.call(this._documents, key);
      return hasCollection;
    }

    if (!fs.existsSync(this._fqpath)) {
      fs.mkdir(this._fqpath, (error) => {
        if (error) throw new Error("Collection dir creation failed. Error:" + error)
      })
    }

  }

  get Documents(): Map<string, Document> {
    // if (this._documents.size === 0 && this._documentsIndexStorageAdaptor.fileExists(this._dbms.config.metaDataRootPath, this._documentsIndexFileName)) {
    //   console.log("Documents() cache miss.")

    // }
    return this._documents
  }

  /**
   * Delete this collection from disk
   */
  public async delete() {

    await this.deleteCollectionFromDisk();
  }

  private initialiseDocuments(): Map<string, Document> {
    const documents = new Map<string, Document>();
    if (this._documentsIndexStorageAdaptor.fileExists(this._dbms.config.metaDataRootPath, this._documentsIndexFileName)) {
      console.log("initialiseDocuments(). Loading docs from disk as cache");
      const di = this.loadDocumentsIndexFromDisk()
      di.forEach((e: DocumentPointer) => {
        documents.set(e.name, new Document(e.name, this._dbms, e.reldirname))
      });
    }
    return documents;
  }

  private async saveDocumentsIndexToDisk(documents: Map<string, Document>) {
    await this._documentsIndexMutex.runExclusive(
      async () => {

        try {


          console.log("saveDocumentsIndexToDisk")

          const documentsIndexArray = new Array<DocumentPointer>();

          documents.forEach((value: Document, key: string) => {
            documentsIndexArray.push({ name: value.name, reldirname: this.reldirname, filename: value.filename })
          });

          await this._documentsIndexStorageAdaptor.saveToDisk(documentsIndexArray, this._dbms.config.metaDataRootPath, this._documentsIndexFileName)
        } catch (error) {
          throw new Error("Error saving document index to storage. " + error)
        }
      }
    )

  }

  private async deleteCollectionFromDisk() {
    await this._documentsIndexMutex.runExclusive(
      () => {
        if (this._documents.size == 0) {
          console.log("deleteCollectionFromDisk(`" + this.name + "`)");

          this._documentsIndexStorageAdaptor.deleteFromDisk(this._dbms.config.dataRootPath, this.reldirname)

          this._documentsIndexStorageAdaptor.deleteFromDisk(this._dbms.config.metaDataRootPath, this._documentsIndexFileName)
        } else {
          throw new Error("collection not empty. Explicity delete document in colleciton before calling delete on the collection.")
        }
      }
    )

  }


  private loadDocumentsIndexFromDisk(): Array<DocumentPointer> {
    let documentsIndexArray: Array<DocumentPointer>;
    const documentsIndexObject: object | undefined = this._documentsIndexStorageAdaptor.loadFromDisk(this._dbms.config.metaDataRootPath, this._documentsIndexFileName)
    if (documentsIndexObject === undefined) throw new Error("Collection index data load from fisk failed!");
    if (Array.isArray(documentsIndexObject)) {
      try {
        documentsIndexArray = documentsIndexObject as Array<DocumentPointer>;
        //documentsIndexArray.push(ele as DocumentPointer)  
      } catch (error) {
        throw new Error("Documents index data load from fisk failed! Serialized format is incorrect or corrupt. Should be an Array<DocumentPointer>" + error)
      }
    } else {
      throw new Error("Documents index data load from fisk failed! Serialized format is incorrect or corrupt or not an Array. Should be an Array<DocumentPointer>");
    }
    return documentsIndexArray
  }

}

export default Collection;