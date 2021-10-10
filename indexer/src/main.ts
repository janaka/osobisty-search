
import Typesense from 'typesense';
import matter from 'gray-matter';

import {fullIndexZettkeDocuments} from './zettle.js'
import {fullIndexKindleHighlights} from './kindle.js'
import {fullIndexTwitterBookmarks} from './twitter.js'

let typesense = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});



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
    fullIndexTwitterBookmarks(typesense)
    break;
  case 'test':
    testParseFrontMatter();
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
    console.error(err);
  }
}

async function recreateCollections() {
  const schemaName = "zettleDocuments";
  let schemaZettleDocuments = {
    name: schemaName,
    fields: [
      { name: 'id', type: 'string', facet: false },
      { name: 'type', type: 'string', facet: true },
      { name: 'content', type: 'string', facet: false },
      { name: 'title', type: 'string', facet: false, optional: true },
      { name: 'authors', type: 'string', facet: false, optional: true },
      { name: 'tags', type: 'string', facet: true, optional: true },
      { name: 'link', type: 'string', facet: false, optional: true },
      { name: 'date', type: 'string', facet: true, optional: true },
      { name: 'rank', type: 'int32', facet: false },
    ],
    default_sorting_field: 'rank',
  };

  await deleteCollection(schemaName);

  await createCollection(schemaZettleDocuments);
}


async function testParseFrontMatter() {
  try {
    let mdfile = matter.read("/Users/janakaabeywardhana/code-projects/zettelkasten/projects/osobisty personal universal search engine.md");
    console.log("title:" + mdfile.data.title)
    console.log("tags:" + mdfile.data.tags)
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




//t();
//export {};