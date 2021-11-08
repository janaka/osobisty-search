import {Collection, Dbms, DbmsConfig, Document, JsonFileAdaptor} from './dbms.js'
import os from 'os'
import { object, string } from 'joi'

const dbconfig:DbmsConfig = {
  dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
  metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta"

}

const db: Dbms = new Dbms(dbconfig)

//console.log(db.Collections.length)
//console.log(db.config)

const c = new Collection("test", db)
db.Collections.set(c.name, c)

// const d = new Document("blabla", db, c.reldirname)
// const payload:object = {name: "fgsdfsf", data: "sfsdfsfsdddddsfds asdfsdf  sdf saf s"}
// d.data = payload
// d.save()
// c.Documents.push(d)

console.log(db.Collections.size)
