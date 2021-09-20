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



var myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'delete-collections':
    deleteCollection("zettleDocuments")
    deleteCollection("kindleHighlights")
    break;
  case 'indexZettle':
    fullIndexZettkeDocuments()
    break;
  case 'indexKindle':
    fullIndexKindleHighlights()
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
        if (file.name.endsWith(fileExtFilter)) {
          console.log("file:" + file.name)
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

async function fullIndexZettkeDocuments() {
  const schemaName = "zettleDocuments";
  
  let schemaZettleDocuments = {
    name: schemaName,
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
  
  await deleteCollection(schemaName);

  await createCollection(schemaZettleDocuments);

  fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", indexZettleDoc);
}

// Index a single Zettle document
async function indexZettleDoc(zettleDir: string, filename: string) {
  let mdfile = null;
  const schemaName = "zettleDocuments";

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
    await typesense.collections(schemaName).documents().create(mddoc);

  } catch (err: any) {
    console.error("issue with doc: ", filename);
    mdfile ? console.error(mdfile.stringify("data")) : console.error("gray-matter failed to load mdfile.")
    console.error(err);
  }
}


async function fullIndexKindleHighlights() {
  const schemaName = "kindleHighlights";
  
  let schemaKindleHighlights = {
    name: schemaName,
    fields: [
      { name: 'id', type: 'string', facet: false },
      { name: 'type', type: 'string', facet: true }, // kindle
      { name: 'bookTitle', type: 'string', facet: true},
      { name: 'bookAuthors', type: 'string', facet: false },
      { name: 'content', type: 'string', facet: false },
      { name: 'note', type: 'string', facet: false, optopnal: true},
      { name: 'locationLink', type: 'string', facet: false },
      { name: 'locationValue', type: 'int32', facet: false },
      { name: 'rank', type: 'int32', facet: false },
    ],
    default_sorting_field: 'rank',
  };
  
  await deleteCollection(schemaName);

  await createCollection(schemaKindleHighlights);

  fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/literature/", ".json", indexKindleHighlight);
}

// Index Kindle highlights files exported using https://readwise.io/bookcision
async function indexKindleHighlight(kindleHighlightsDir: string, filename: string) {
  const schemaName = "kindleHighlights";
  let highlights = null;

  try {

    fs.readFile(kindleHighlightsDir + filename, 'utf-8', (err: any, data: string) => {
      if (err) throw err;
      
      let highlights = JSON.parse(data);
      
      const booktitle = highlights.title
      const bookauthors = highlights.authors

      console.log("TITLE:" + highlights.title + " AUTHORS: "+ highlights.authors + " HIGHLIGHT COUNT: " + highlights.highlights.length);

      highlights.highlights.forEach(async (highlight: any) => {
        let kindleHighlight = {
          type: "Kindle",
          bookTitle: booktitle,
          bookAuthors: bookauthors, 
          content: highlight.text ? highlight.text : "",
          note: highlight.note ? highlight.note : "",
          locationLink: highlight.location.url,
          locationValue: highlight.location.value,
          rank: 1
        }
        await typesense.collections(schemaName).documents().create(kindleHighlight);
      });
    });



  } catch (err: any) {
    console.error("issue with doc: ", filename);
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



//t();
export { };