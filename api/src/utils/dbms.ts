import fs from 'fs';

interface DbmsConfig {
  DataPath: string;
}


export class Dbms {

  config: DbmsConfig;

  constructor(dbmsConfig: DbmsConfig) {
    this.config = dbmsConfig;

  }

  createNewCollection(name: string): Collection {
    const c = new Collection(name)
    try {

      if(!this.FileExists(c.filename)) {
        this.SaveCollectionToFile(c)
      }
      
    } catch (error) {
      throw error
    }
    return c
  }


  private FileExists(filename: string): boolean {
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

  private LoadCollectionFromFile(name: string): Collection {
    const c: Collection = new Collection(name, this)

    if (this.FileExists(c.filename)) {
      fs.readFile(c.filename, 'utf-8', (error: any, data: string) => {
        if (!error) throw error;
        if (data) {
          c.data = JSON.parse(data);
        }
      })
    }
    return c;
  }

  SaveCollectionToFile(collection: Collection) {
    fs.writeFile(collection.filename, JSON.stringify(collection.data),'utf-8', (error:any) => {
      if (error) throw error
    })
  }


}

class Collection {
  readonly name: string;
  readonly filename: string;
  data: object;
  private _dbms:Dbms;

  constructor(name: string, dbms: Dbms) {
    this.name = name;
    this.filename = name + ".json";
    this.data = {};
    this._dbms = dbms;
  }

  save() {
    this._dbms.SaveCollectionToFile(this)
  }
}