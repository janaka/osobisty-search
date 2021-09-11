

// import {Typesense} from 'typesense'
import Typesense from 'typesense';
import fs from 'fs';
import matter from 'gray-matter';

console.log('Hello World');

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


let schemaZettleDocuments = {
  name: 'zettleDocuments',
  fields: [
    { name: 'id', type: 'string', facet: false },
    { name: 'title', type: 'string', facet: false, optional: true },
    { name: 'content', type: 'string', facet: false },
    { name: 'rank', type: 'int32', facet: false },
  ],
  default_sorting_field: 'rank',
};

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


async function indexZettleDocs(zettleDir: string) {

  // loopthrough directories recursively and index all *.md files
  fs.readdir(zettleDir, { withFileTypes: true }, (err: any, files: fs.Dirent[]) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file: fs.Dirent) => {

      if (file.isFile()) {
        console.log("file:" + file.name)
        if (file.name.endsWith(".md")) {
          try {
            let mdfile = matter.read(zettleDir+file.name);
            console.log("title:"+mdfile.data.title)
            let mddoc = {
              title: mdfile.data.title,
              content: mdfile.content,
              rank: 1
            }

            typesense.collections("zettleDocuments").documents().create(mddoc);


          } catch (err:any) {
            console.error(err);
          }
        }

      } else {
        console.log("dir:" + file.name)
        if (!file.name.startsWith(".")) {
          indexZettleDocs(zettleDir + file.name + "/")
        }
      }

    });

  });
}

async function t() {
  try {
    let mdfile = matter.read("/Users/janakaabeywardhana/code-projects/zettelkasten/projects/osobisty personal search engine.md");
    console.log("title:"+mdfile.data.title)
  } catch (err:any) {
    console.error(err);
  }
}



async function createCollections() {

  createCollection(schemaZettleDocuments);

}

//deleteCollection("zettleDocuments")

//createCollections();

indexZettleDocs("/Users/janakaabeywardhana/code-projects/zettelkasten/");
//t();
export { };