import Dbms from "./dbms.js";
import Document, {DocumentPointer } from "./document.js";
import { JsonFileAdaptor } from "./jsonFileAdaptor.js";
import fs from 'fs'

export interface CollectionPointer {
  [index: string]: string,
  name: string,
  reldirname: string
}


//TODO: type collections to a particular document format like json, yaml, or text 
// so we don't have to pass the fileadapter to each document instance
/**
 * A collection of `Document`s of type `Map`
 * 
 */
class Collection {
  private _documents: Map<string, Document>;
  private _documentsIndexFileAdaptor: JsonFileAdaptor<Array<DocumentPointer>>;
  private _dbms: Dbms;
  private _fqpath: string;
  readonly name: string;
  readonly reldirname: string;

  constructor(name: string, dbms: Dbms) {
    this._dbms = dbms;
    this.name = name;
    this.reldirname = "/" + name;
    this._fqpath = this._dbms.config.dataRootPath + this.reldirname

    this._documents = new Map();
    this._documentsIndexFileAdaptor = new JsonFileAdaptor(this._dbms.config.metaDataRootPath, "/" + this.name + "-documents-index.json")

    /**
     * Adds or updates an element with a specified key and a value
     * @param key unique alphamumeric value. 
     */
    this.Documents.set = (key: string, value: Document): Map<string, Document> => {
      if (key !== value.name) throw new Error("`key` and `Document.name` must be the same")
      const dd = Map.prototype.set.call(this._documents, key, value)
      this._documents = dd;
      value.save(); // persist the document
      this.saveDocumentsIndexToDisk(this._documents);
      return this._documents
    }

    // this.Documents.add = (document: Document): Document => {
    //   this.Documents.set(document.name, document);
    //   return document;
    // }
    this.Documents.add = (name: string, data?: object): Document => {
      const d = new Document(name, this._dbms, this.reldirname);
      if (data) d.data = data; 
      this.Documents.set(d.name, d);
      return d
    }

    if (!fs.existsSync(this._fqpath)) {
      fs.mkdir(this._fqpath, (error) => {
        if (error) throw new Error("Collection dir creation failed. Error:" + error)
      })
    }

  }

  get Documents(): Map<string, Document> {
    if (this._documents.size === 0 && this._documentsIndexFileAdaptor.fileExists()) {
      console.log("Documents() cache miss.")
      const ci = this.loadDocumentsIndexFromDisk()
      const c = new Map<string, Document>();
      ci.forEach((e: DocumentPointer) => {
        c.set(e.name, new Document(e.name, this._dbms, e.reldirname))
      });
      this._documents = c;
    }
    return this._documents
  }

  private saveDocumentsIndexToDisk(documents: Map<string, Document>) {
    console.log("saveDocumentsIndexToDisk")

    const documentsIndexArray = new Array<DocumentPointer>();

    documents.forEach((value: Document, key: string) => {
      documentsIndexArray.push({ name: value.name, reldirname: this.reldirname, filename: value.filename })
    });

    this._documentsIndexFileAdaptor.saveToDisk(documentsIndexArray)
  }

  private loadDocumentsIndexFromDisk(): Array<DocumentPointer> {
    const cp = this._documentsIndexFileAdaptor.loadFromDisk()
    if (cp === undefined) throw new Error("Collection index data load from fisk failed!")

    return cp
  }

}

export default Collection;