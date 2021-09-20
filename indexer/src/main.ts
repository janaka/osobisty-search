// import {Typesense} from 'typesense'
import Typesense from 'typesense';
import fs from 'fs';
import matter from 'gray-matter';

let typesense = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: '8108',
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});

let schemaZettleDocuments = {
  name: 'zettleDocuments',
  fields: [
    { name: 'id', type: 'string', facet: false },
    { name: 'type', type: 'string', facet: true },
    { name: 'title', type: 'string', facet: false, optional: true },
    { name: 'tags', type: 'string', facet: true },
    { name: 'content', type: 'string', facet: false },
    { name: 'date', type: 'string', facet: true },
    { name: 'rank', type: 'int32', facet: false },
  ],
  default_sorting_field: 'rank',
};

var myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'delete-collections':
    deleteCollection("zettleDocuments")
    break;
  case 'create-collections':
    createCollections();
    break;
  case 'index':
    fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", indexZettleDocs);
    break;
  case 'test':
    t();
    break;
  default:
    console.log("`yarn start delete-collections` to drop all collections and recreate");
    console.log("`yarn start create-collections` to drop all collections and recreate");
    console.log("`yarn start index` to index content");
    console.log("`yarn start test` to test parse MD file");
}




/* let schemaZettleDocuments = {
  name: 'zettleDocuments',
  fields: [
    { name: 'id', type: 'string', facet: false },
    { name: 'type', type: 'string', facet: true },
    { name: 'title', type: 'string', facet: false },
    { name: 'link', type: 'string', facet: false },
    { name: 'content', type: 'string', facet: false },
    { name: 'date', type: 'string', facet: true },
    { name: 'rank', type: 'int32', facet: false },
  ],
  default_sorting_field: 'rank',
}; */


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
    console.error(err);
  }
}


/* 
*   Generic recursive file iterator.
*   Opens each file in `dir` and runs `indexerFunction` aginast the file
*   indexerFunctions are doc type specific
*   Only runs indexerFunction on files that match the `fileExtFilter`
*/ 
async function fileIteractor(dir: string, fileExtFilter: string, indexerFunction: (path: string, filename: string) => void) {
  // loopthrough directories recursively and index all *.md files
  //TODO: add support other file extentions
  fs.readdir(dir, { withFileTypes: true }, (err: any, files: fs.Dirent[]) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach(async (file: fs.Dirent) => {
      let mdfile = null;
      if (file.isFile()) {
        console.log("file:" + file.name)
        if (file.name.endsWith(fileExtFilter)) {
          indexerFunction(dir, file.name)
        }
      } else {
        console.log("dir:" + file.name)
        if (!file.name.startsWith(".")) {
          fileIteractor(dir + file.name + "/", fileExtFilter, indexerFunction)
        }
      }

    });

  });
}

async function indexZettleDocs(zettleDir: string, filename: string) {
  let mdfile = null;
  try {
    mdfile = matter.read(zettleDir + filename);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags)

    let mddoc = {
      type: mdfile.data.type ? "zettle-" + mdfile.data.type : "unknown",
      title: mdfile.data.title ? mdfile.data.title : filename,
      tags: mdfile.data.tags ? mdfile.data.tags : "",
      date: mdfile.data.date ? mdfile.data.date : "",
      content: mdfile.content ? mdfile.content : "",
      rank: 1
    }
    await typesense.collections("zettleDocuments").documents().create(mddoc);

  } catch (err: any) {
    console.error("issue with doc: ", filename);
    mdfile ? console.error(mdfile.stringify("data")) : console.error("gray-matter failed to load mdfile.")
    console.error(err);
  }
}

// Index Kindle highlights files exported using https://readwise.io/bookcision
async function indexKindleHighlights(kindleHighlightsDir: String) {
  let highlightfile = null;
  try {
    
    highlightfile = await fs.readFile(zettleDir + filename);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags)

    let mddoc = {
      type: mdfile.data.type ? "zettle-" + mdfile.data.type : "unknown",
      title: mdfile.data.title ? mdfile.data.title : filename,
      tags: mdfile.data.tags ? mdfile.data.tags : "",
      date: mdfile.data.date ? mdfile.data.date : "",
      content: mdfile.content ? mdfile.content : "",
      rank: 1
    }
    await typesense.collections("zettleDocuments").documents().create(mddoc);

  } catch (err: any) {
    console.error("issue with doc: ", filename);
    mdfile ? console.error(mdfile.stringify("data")) : console.error("gray-matter failed to load mdfile.")
    console.error(err);
  }
}


async function t() {
  try {
    let mdfile = matter.read("/Users/janakaabeywardhana/code-projects/zettelkasten/projects/osobisty personal universal search engine.md");
    console.log("title:" + mdfile.data.title)
    console.log("tags:" + mdfile.data.tags)
    console.log("content:" + mdfile.content)
    console.log("stringifydata:" + mdfile.stringify("data"))

  } catch (err: any) {
    console.error(err);
  }
}

async function createCollections() {
  createCollection(schemaZettleDocuments);
}


//t();
export { };