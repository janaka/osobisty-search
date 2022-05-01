
import Typesense from 'typesense';
import matter from 'gray-matter';

import { fullIndexZettkeDocuments } from './zettle.js'
import { fullIndexKindleHighlights } from './kindle.js'
import { fullIndexTwitterBookmarks } from './twitter.js'
import fs from 'fs';
import os from 'os';
import 'dotenv/config';
import { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import { DocumentSchema, SearchResponseHit } from 'typesense/lib/Typesense/Documents'


const TYPESENSE_HOST: string = process.env.TYPESENSE_HOST ? process.env.TYPESENSE_HOST : "";
const TYPESENSE_PORT: number = process.env.TYPESENSE_PORT ? Number(process.env.TYPESENSE_PORT) : 0;
const TYPESENSE_KEY: string = process.env.TYPESENSE_KEY ? process.env.TYPESENSE_KEY : "";
const TYPESENSE_TOKEN: string = process.env.TYPESENSE_TOKEN ? process.env.TYPESENSE_TOKEN : "";
const TYPESENSE_PROTOCOL: string = process.env.TYPESENSE_PROTOCOL ? process.env.TYPESENSE_PROTOCOL : "https";

let configOptions: ConfigurationOptions = {
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: "asdflsdfasdfsadfasdfsdfasdfdsfa",
  connectionTimeoutSeconds: 5,
}

if (TYPESENSE_KEY !== "") {
  configOptions.apiKey = TYPESENSE_KEY
} else {
  if (TYPESENSE_TOKEN !== "") {
    let tokenHeader: Record<string, string> = {
      Authorization: `Bearer ${TYPESENSE_TOKEN}`,
    }
    configOptions.additionalHeaders = tokenHeader;
  } else {
    throw "One of TYPESENSE_KEY or TYPESENSE_KEY must be configured but both were empty";
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
  case 'reindexZettle':
    await deleteDocsByType("zettleDocuments", "zettle-project")
    await deleteDocsByType("zettleDocuments", "zettle-fleeting")
    await deleteDocsByType("zettleDocuments", "zettle-literature")
    await deleteDocsByType("zettleDocuments", "zettle-recipe")
    await deleteDocsByType("zettleDocuments", "zettle-unknown")
    await deleteDocsByType("zettleDocuments", "zettle-permanent")
    await deleteDocsByType("zettleDocuments", "zettle-journal")
    await deleteDocsByType("zettleDocuments", "zettle-todo")
    await deleteDocsByType("zettleDocuments", "zettle-keyword")
    await deleteDocsByType("zettleDocuments", "zettle-feature")
    await deleteDocsByType("zettleDocuments", "zettle-meta")
    fullIndexZettkeDocuments(typesense)
    break;
  case 'reportIndexZettle':
    await countDocsByType("zettleDocuments", "zettle-project")
    await countDocsByType("zettleDocuments", "zettle-fleeting")
    await countDocsByType("zettleDocuments", "zettle-literature")
    await countDocsByType("zettleDocuments", "zettle-recipe")
    await countDocsByType("zettleDocuments", "zettle-unknown")
    await countDocsByType("zettleDocuments", "zettle-permanent")
    await countDocsByType("zettleDocuments", "zettle-journal")
    await countDocsByType("zettleDocuments", "zettle-todo")
    await countDocsByType("zettleDocuments", "zettle-keyword")
    await countDocsByType("zettleDocuments", "zettle-feature")
    await countDocsByType("zettleDocuments", "zettle-meta")
    break;


  case 'reindexKindle':
    await deleteDocsByType("zettleDocuments", "Kindle")
    fullIndexKindleHighlights(typesense)
    break;
  case 'reindexTwitter':
    await deleteDocsByType("zettleDocuments", "Twitter-bm")
    fullIndexTwitterBookmarks(typesense);
    break;
  case 'reportRuntimeConfig':
    console.log(typesense.configuration);
    break;

  case 'health':
    let r = await typesense.health.retrieve();

    console.log("\x1b[36m%s\x1b[0m", "health status: " + r.ok);
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
    console.log("`yarn start reindexZettle` to index Zettle content");
    console.log("`yarn start reindexTwitter` to re-index (delete then index) Twitter content");
    console.log("`yarn start reindexKindle` to index Kindle content");
    console.log("`yarn start reportIndexZettle` to report zettle document counts by type");
    console.log("`yarn start reportRuntimeConfig` to report the server connection details that are being used at runtime by the Typesense client");
    console.log("`yarn start health` hit the Typesense health endpoint using typesense.health.retrieve()");
    console.log("`yarn start test1` to test write MD frontmatter file");
    console.log("`yarn start test2` to test read parse MD frontmatter file");
    console.log("`yarn start test3` to test Typesense connection by calling typesense.collections('zettleDocuments').retrieve()");
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
    let r = await typesense.collections(collectionName).documents().delete({ filter_by: 'type: ' + typeName.trim() })
    console.log("\x1b[36m%s\x1b[0m", r.num_deleted + " " + typeName + " docs deleted!");
  } catch (err: any) {
    //console.error(err);
  }
}

async function countDocsByType(collectionName: string, typeName: string) {
  try {
    let r = await typesense.collections(collectionName).documents().search({ q: '*', query_by: 'type', filter_by: 'type: ' + typeName.trim() })
    console.log("\x1b[36m%s\x1b[0m", r.found + " " + typeName + " docs!");
  } catch (err: any) {
    //console.error(err);
  }
}

async function listDocsByType(collectionName: string, typeName: string) {
  try {
    let r = await typesense.collections(collectionName).documents().search({ q: '*', query_by: 'type', filter_by: 'type: ' + typeName.trim() });
    interface doc extends DocumentSchema{
      id: string;
      title: string;
      link: string
    }

    if (r.hits) {
      for (let i = 0; i < r.hits.length; i++) {
        console.log(r.hits[i]);
      }
    }

    console.log("\x1b[36m%s\x1b[0m", r.found + " " + typeName + " docs!");

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
      { name: 'note_content', type: 'string', facet: false }, 
      { name: 'source_content', type: 'string', facet: false, optional: true },
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

  // interface fmData { [key: string]: any }

  // const filepath = os.homedir + "/code-projects/zettelkasten/projects/osobisty personal universal search engine.md"

  // fs.readFile(filepath, "utf-8", (err: any, data: any) => {
  //   if (err) throw err;
  //   let dataStr: string = data;
  //   let fmData: fmData = {}
  //   const fmDelimiter = "---\n"
  //   const fmOpenPosition = fmDelimiter.length
  //   const fmClosePostion = dataStr.indexOf(fmDelimiter, fmOpenPosition)

  //   const fmSection = dataStr.slice(fmOpenPosition, fmClosePostion - 1)
  //   const contentSection = dataStr.slice(fmClosePostion + fmDelimiter.length)
  //   console.log(fmSection)

  //   const fmSectionArray = fmSection.split("\n")
  //   console.log("# elements: " + fmSectionArray.length)
  //   console.log("element 0: " + fmSectionArray[0])

  //   fmSectionArray.forEach((e: string) => {
  //     //let fmField = e.split(":")
  //     const key: string = e.slice(0, e.indexOf(":")).trim()
  //     const value: string = e.slice(e.indexOf(":") + 1, e.length).trim()

  //     fmData[key] = value
  //   })

  //   console.log(fmData.title)
  //   console.log("id:" + fmData.id)
  //   fmData.id = "234234"
  //   console.log("id:" + fmData.id)

  //   let t: string = fmDelimiter

  //   for (const key in fmData) {
  //     t += key + ": " + fmData[key] + "\n"
  //   };

  //   t += fmDelimiter
  //   t += contentSection

  //   console.log("============")
  //   console.log(t)


  //   fs.writeFile(filepath, t, "utf-8", (err: any) => {
  //     if (err) throw err
  //   })


  // })

}


//t();
//export {};