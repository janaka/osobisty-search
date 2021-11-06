import {Collection, Dbms, DbmsConfig, Document, JsonFileAdaptor} from './dbms.js'
import os from 'os'

const dbconfig:DbmsConfig = {
  dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test",
  metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/test/meta"

}

const db: Dbms = new Dbms(dbconfig)

console.log(db.Collections.length)

const c = new Collection("weblippingPages", db)
const l = db.Collections.push(c)
const dfa = new JsonFileAdaptor<object>("/code-projects/osobisty-search/api/data/test", "aslfjsldfjl.json")
const d = new Document("sdfssasdfdsfwwe", db, dfa)
c.Documents.push(d)


console.log(db.Collections.length)
//console.log(l)