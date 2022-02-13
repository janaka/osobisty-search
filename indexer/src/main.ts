
import Typesense from 'typesense';
import matter from 'gray-matter';

import {fullIndexZettkeDocuments} from './zettle.js'
import {fullIndexKindleHighlights} from './kindle.js'
import { fullIndexTwitterBookmarks} from './twitter.js'
import fs from 'fs';
import os from 'os';
import 'dotenv/config';
import { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';


const TYPESENSE_HOST:string = process.env.TYPESENSE_HOST ? process.env.TYPESENSE_HOST : "";
const TYPESENSE_PORT:number = process.env.TYPESENSE_PORT ? Number(process.env.TYPESENSE_PORT) : 0;
const TYPESENSE_KEY:string = process.env.TYPESENSE_KEY ? process.env.TYPESENSE_KEY : "";
const TYPESENSE_TOKEN:string = process.env.TYPESENSE_TOKEN ? process.env.TYPESENSE_TOKEN : "";

let configOptions:ConfigurationOptions = {
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: 'https',
    },
  ],
  apiKey: "asdflsdfasdfsadfasdfsdfasdfdsfa",
  connectionTimeoutSeconds: 2,
  additionalHeaders: {
    Authorization: `Bearer ${TYPESENSE_TOKEN}`,
  }
} 

let typesense = new Typesense.Client(configOptions);
//let d = await typesense.debug.retrieve()

//console.log(d)

var myArgs = process.argv.slice(2);

myArgs.forEach((arg) => {
  console.log(arg)
})
switch (myArgs[0]) {
  case 'delete-collections':
    deleteCollection("zettleDocuments")
    break;
  case 'delete-by-type':
    myArgs[1] && myArgs[1].length > 0 ? deleteDocsByType("zettleDocuments", myArgs[1]) : console.error("missing param doctype name")
    break;
  case 'recreate-collections':
    recreateCollections();
    break;
  case 'indexAll':
    fullIndexKindleHighlights(typesense)
    fullIndexZettkeDocuments(typesense)
    fullIndexTwitterBookmarks(typesense)
    break;
  case 'indexZettle':
    fullIndexZettkeDocuments(typesense)
    break;
  case 'indexKindle':
    fullIndexKindleHighlights(typesense)
    break;
  case 'indexTwitter':
    deleteDocsByType("zettleDocuments", "Twitter-bm")
    //fullIndexTwitterBookmarks(typesense);
    break;
    case 'health':
      let r = await typesense.health.retrieve();

      console.log("\x1b[36m%s\x1b[0m", r.status);
      break;
    case 'test1':
    testFrontMatterWrite();
    break;
  case 'test2':
    testParseFrontMatter();
    break;
  case 'test3':
    testTypesenseConnection();
    break;
  default:
    console.log(myArgs[0])
    console.log("`yarn start delete-collections` to drop all collections and recreate");
    console.log("`yarn start delete-by-type <type_name>` only drop docs of `type`=<type_name>");
    console.log("`yarn start recreate-collections` to drop all collections and recreate");
    console.log("`yarn start indexAll` to index all content");
    console.log("`yarn start indexZettle` to index Zettle content");
    console.log("`yarn start indexTwitter` to index Twitter content");
    console.log("`yarn start indexKindle` to index Kindle content");
    console.log("`yarn start test` to test parse MD file");
}


async function createCollection(schema: any) {
  try {
    let res = await typesense.collections(schema.name).retrieve();
    //console.log(res);
    console.log("collection exists");
  } catch (err: any) {

    await typesense.collections().create(schema)
    console.log("collection doesn't exist, created.")
  }
}

async function deleteCollection(name: string) {
  try {
    await typesense.collections(name).delete()
    console.log("collection deleted");
  } catch (err: any) {
    console.log("collection doesn't exist");
  }
}

async function deleteDocsByType(collectionName: string, typeName: string) {
  try {
    let r = await typesense.collections(collectionName).documents().delete({ filter_by: 'type:=' + typeName.trim() })
    console.log("\x1b[36m%s\x1b[0m", r.num_deleted + " " + typeName + " docs deleted!");
  } catch (err: any) {
    //console.error(err);
  }
}

async function recreateCollections() {
  const schemaName = "zettleDocuments";
  let schemaZettleDocuments = {
    name: schemaName,
    fields: [
      { name: 'id', type: 'string', facet: false },
      { name: 'type', type: 'string', facet: true },
      { name: 'content', type: 'string', facet: false }, //TODO: refactor `content` -> `notes_content`
      { name: 'source_content', type: 'string', facet: false, optional:true},
      { name: 'title', type: 'string', facet: false, optional: true },
      { name: 'authors', type: 'string', facet: false, optional: true },
      { name: 'tags', type: 'string', facet: true, optional: true },      
      { name: 'date', type: 'string', facet: true, optional: true },
      { name: 'rank', type: 'int32', facet: false },
      //{ name: 'link', type: 'string'}, // we don't need to index this field, just persist in the database
      //{ name: 'index_date', type: 'string'}, // we don't need to index this field, just persist in the database
    ],
    default_sorting_field: 'rank',
  };

  await deleteCollection(schemaName);

  await createCollection(schemaZettleDocuments);
}


async function testParseFrontMatter() {
  try {
    let mdfile = matter.read(os.homedir + "/code-projects/zettelkasten/projects/osobisty personal universal search engine.md");
    console.log("title:" + mdfile.data.title)
    console.log("tags:" + mdfile.data.tags)
    console.log("")
    //console.log("content:" + mdfile.content)
    //console.log("stringifydata:" + mdfile.stringify("data"))

  } catch (err: any) {
    console.error(err);
  }
}

async function testTypesenseConnection() {
  try {
    const z = await typesense.collections('zettleDocuments').retrieve()  
    console.log(JSON.stringify(z))
  } catch (error) {
    console.error("Collection retrieve failed!", error)
  }
  
}

async function testFrontMatterWrite() {

  // Check if MD file has an _Id_ field
  // if not, generate an unique Id and insert the field

  // fs.readFile the file content into string
  // edit the content in mem 
  // fs.writeFilr to overwrite
  //let fileContents: string

 interface fmData { [key: string]: any }

  const filepath = os.homedir + "/code-projects/zettelkasten/projects/osobisty personal universal search engine.md"

  fs.readFile(filepath,"utf-8",(err:any, data:any) => {
    if (err) throw err;
    let dataStr:string = data;
    let fmData:fmData = {}
    const fmDelimiter = "---\n"
    const fmOpenPosition = fmDelimiter.length
    const fmClosePostion = dataStr.indexOf(fmDelimiter,fmOpenPosition) 
    
    const fmSection = dataStr.slice(fmOpenPosition, fmClosePostion - 1)
    const contentSection = dataStr.slice(fmClosePostion + fmDelimiter.length)
    console.log(fmSection)

    const fmSectionArray = fmSection.split("\n")
    console.log("# elements: " + fmSectionArray.length)
    console.log("element 0: " + fmSectionArray[0])

    fmSectionArray.forEach((e:string) =>{
      //let fmField = e.split(":")
      const key: string = e.slice(0, e.indexOf(":")).trim()
      const value: string = e.slice(e.indexOf(":")+1, e.length).trim()      

      fmData[key] = value
    })
    
    console.log(fmData.title) 
    console.log("id:"+ fmData.id)
    fmData.id = "234234"
    console.log("id:"+ fmData.id)

    let t: string = fmDelimiter

    for (const key in fmData) {
      t += key + ": " + fmData[key] + "\n"
    };

    t += fmDelimiter
    t += contentSection

console.log("============")
    console.log(t)

    
    fs.writeFile(filepath, t,"utf-8", (err:any) =>{
      if (err) throw err
    })


  })
  
}


//t();
//export {};