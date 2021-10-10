import {fileIterator} from './fileIterator.js'
import fs from 'fs';

export async function fullIndexKindleHighlights(typesenseClient:any) {

  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/literature/", ".json", indexKindleHighlight, typesenseClient);
}

// Index Kindle highlights files exported using https://readwise.io/bookcision
async function indexKindleHighlight(kindleHighlightsDir: string, filename: string, typesenseClient:any) {
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
        await typesenseClient.collections(schemaName).documents().create(kindleHighlight);
      });
    });
  } catch (err: any) {
    console.error("issue with doc: ", filename);
    console.error(err);
  }
}