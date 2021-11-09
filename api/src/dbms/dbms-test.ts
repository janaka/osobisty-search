import {Collection, Dbms, DbmsConfig, Document, JsonFileAdaptor} from './dbms.js'
import os from 'os'


const dbconfig:DbmsConfig = {
  dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
  metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta"

}

const db: Dbms = new Dbms(dbconfig)

//console.log(db.Collections.length)
//console.log(db.config)

// const c = new Collection("test", db)
// db.Collections.set(c.name, c)

const c2 = db.Collections.add("coll2").Documents.add("doc1", {bla: "ssome eheh ehlkh dfj w"})





console.log(db.Collections.size)
