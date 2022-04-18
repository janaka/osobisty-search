import {fileIterator} from './fileIterator.js'
import fs from 'fs';
import {dateTimeNowUtc, delay, randomIntFromInterval} from './utils.js'
import { IZettleDocTypesenseSchema } from './IZettleDocTypesenseSchema.js';

export async function fullIndexKindleHighlights(typesenseClient:any) {

  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/literature/","/Users/janakaabeywardhana/code-projects/zettelkasten/literature/", ".json", indexKindleHighlight, typesenseClient);
}

// Index Kindle highlights files exported using https://readwise.io/bookcision
async function indexKindleHighlight(kindleHighlightsRootDir: string, fileDir:string, filename: string, typesenseClient:any) {
  const schemaName = "zettleDocuments";
  let highlights = null;

  try {

    fs.readFile(fileDir + filename, 'utf-8', (err: any, data: string) => {
      if (err) throw err;

      let highlights = JSON.parse(data);

      const booktitle = highlights.title
      const bookauthors = highlights.authors

      

      highlights.highlights.forEach(async (highlight: any) => {
        let content = highlight.text ? "<blockquote>" + highlight.text + "</blockquote>" : ""
        //if (highlight.note) {content += '<br /><br />Note: <br />' + highlight.note}
        let kindleHighlight: IZettleDocTypesenseSchema = {
          type: "Kindle",
          title: booktitle,
          authors: bookauthors,
          note_content: highlight.note ? highlight.note : "",
          source_content: highlight.text,          
          link: highlight.location.url,
          index_date: dateTimeNowUtc(),
          rank: 1
        }
        await delay(randomIntFromInterval(2500, 5000));
        await typesenseClient.collections(schemaName).documents().create(kindleHighlight);
        console.log("TITLE:" + booktitle + " AUTHORS: " + bookauthors + " HIGHLIGHT COUNT: " + highlights.highlights.length);
      });
    });
  } catch (err: any) {
    console.error("issue with doc: ", filename);
    console.error(err);
  }
}