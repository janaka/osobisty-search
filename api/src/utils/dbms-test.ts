import {Collection, Dbms, DbmsConfig, Document, JsonFileAdaptor} from './dbms.js'

const dbconfig:DbmsConfig = {
  dataRootPath: "/Users/janaka/code-projects/osobisty-search/api/data/test",
  metaDataRootPath: "/Users/janaka/code-projects/osobisty-search/api/data/test/meta"

}

const db: Dbms = new Dbms(dbconfig)

console.log(db.Collections.length)

const c = new Collection("weblippingPages", db)
const l = db.Collections.push(c)
const dfa = new JsonFileAdaptor("aslfjsldfjl")
const d = new Document("sdfssasdfdsfwwe", db, dfa)
c.Documents.push(d)


console.log(db.Collections.length)
console.log(l)