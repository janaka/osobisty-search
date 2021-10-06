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
    fullIndexKindleHighlights()
    fullIndexZettkeDocuments()
    fullIndexTwitterBookmarks()
    break;
  case 'indexZettle':
    fullIndexZettkeDocuments()
    break;
  case 'indexKindle':
    fullIndexKindleHighlights()
    break;
  case 'indexTwitter':
    fullIndexTwitterBookmarks()
    break;
  case 'test':
    t();
    break;
  default:
    console.log(myArgs[0])
    console.log("`yarn start delete-collections` to drop all collections and recreate");
    console.log("`yarn start delete-by-type <type_name>` only drop docs of `type`=<type_name>");
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

async function deleteDocsByType(collectionName: string, typeName: string) {
  try {
    let r = await typesense.collections(collectionName).documents().delete({ filter_by: 'type:=' + typeName.trim() })
    console.log("\x1b[36m%s\x1b[0m", r.num_deleted + " " + typeName + " docs deleted!");
  } catch (err: any) {
    console.error(err);
  }
}

/* 
*   Generic recursive file iterator.
*   Opens each file in `dir` and runs `indexerFunction` aginast the file
*   indexerFunctions are doc type specific
*   Only runs indexerFunction on files that match the `fileExtFilter`
*/
async function fileIteractor(dir: string, fileExtFilter: string, baseDir: string, indexerFunction: (path: string, filename: string, basePath?: string,) => void) {
  // loopthrough directories recursively and index all *.md files
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
          indexerFunction(dir, file.name, baseDir)
        }
      } else {
        console.log("dir:" + file.name)
        if (!file.name.startsWith(".")) {
          fileIteractor(dir + file.name + "/", fileExtFilter, baseDir, indexerFunction)
        }
      }

    });

  });
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

async function fullIndexZettkeDocuments() {

  fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", "/Users/janakaabeywardhana/code-projects/zettelkasten/", indexZettleDoc);
}

// Index a single Zettle document
async function indexZettleDoc(zettleDir: string, filename: string, zettleBaseDir = "") {
  let mdfile = null;
  const schemaName = "zettleDocuments";

  try {
    mdfile = matter.read(zettleDir + filename);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags)

    let relDir = zettleDir.replace(zettleBaseDir, "") + filename

    let mddoc = {
      type: mdfile.data.type ? "zettle-" + mdfile.data.type : "zettle-unknown",
      title: mdfile.data.title == null ? mdfile.data.title : filename,
      tags: mdfile.data.tags ? mdfile.data.tags : "",
      date: mdfile.data.date ? mdfile.data.date : "",
      content: mdfile.content ? mdfile.content : "",
      link: relDir,
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

  fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/literature/", ".json", indexKindleHighlight);
}

// Index Kindle highlights files exported using https://readwise.io/bookcision
async function indexKindleHighlight(kindleHighlightsDir: string, filename: string) {
  const schemaName = "zettleDocuments";
  let highlights = null;

  try {

    fs.readFile(kindleHighlightsDir + filename, 'utf-8', (err: any, data: string) => {
      if (err) throw err;

      let highlights = JSON.parse(data);

      const booktitle = highlights.title
      const bookauthors = highlights.authors

      console.log("TITLE:" + booktitle + " AUTHORS: " + bookauthors + " HIGHLIGHT COUNT: " + highlights.highlights.length);

      highlights.highlights.forEach(async (highlight: any) => {
        let content = highlight.text ? "<quote>" + highlight.text + "</quote>" : ""
        content = highlight.note ? content + "<br />Note: " + highlight.note : ""
        let kindleHighlight = {
          type: "Kindle",
          title: booktitle,
          authors: bookauthors,
          content: content,
          link: highlight.location.url,
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


async function fullIndexTwitterBookmarks() {

  //indexTwitterBookmarks("/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/twitter-bookmarks.json")
  fileIteractor("/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/", ".json", "/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/", indexTwitterBookmarks);
}

async function indexTwitterBookmarks(twitterBookmarksJsonFile: string, filename: string) {
  const schemaName = "zettleDocuments";
  let c = 0;
  try {
    fs.readFile(twitterBookmarksJsonFile + filename, 'utf-8', (err: any, data: string) => {
      if (err) throw err;
      let twitterBookmarks = JSON.parse(data);

      console.log("==============")
      console.log(filename)
      console.log("==============")
      //data.bookmark_timeline.timeline.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.full_text
      twitterBookmarks.data.bookmark_timeline.timeline.instructions[0].entries.forEach(async (entry: any) => {
        c = c + 1;
        if (entry.content.entryType == "TimelineTimelineItem") {
          console.log("\x1b[36m%s\x1b[0m", c + ": " + entry.entryId)
          if (entry.content.itemContent.tweet_results.result) {
            console.log(entry.content.itemContent.tweet_results.result.legacy.full_text)
            const screenName = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
            const tweetRestId = entry.content.itemContent.tweet_results.result.rest_id
            // Tweet Link Ex.1 https://twitter.com/QuinnyPig/status/1091041507342086144?s=20
            // Ex.2 https://twitter.com/b0rk/status/1091554624711081985?s=20
            const tweetLink = "https://twitter.com/" + screenName + "/status/" + tweetRestId + "?s=20"
            let twitterBookmark = {
              type: "Twitter-bm",
              authors: entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.name + " (@" + screenName + ")",
              content: entry.content.itemContent.tweet_results.result.legacy.full_text,
              date: entry.content.itemContent.tweet_results.result.legacy.created_at,
              link: tweetLink,
              rank: 1
            }
            await typesense.collections(schemaName).documents().create(twitterBookmark);
          } else {
            console.log(">>>>>>>>>> tweet_results is empty")
          }
        }
      })
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
    //console.log("content:" + mdfile.content)
    //console.log("stringifydata:" + mdfile.stringify("data"))

  } catch (err: any) {
    console.error(err);
  }
}



//t();
export { };