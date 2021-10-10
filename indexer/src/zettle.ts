import {fileIterator} from './fileIterator.js'
import matter, { GrayMatterFile } from 'gray-matter';


export async function fullIndexZettkeDocuments(typesenseClient:any) {


  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", indexZettleDoc, typesenseClient);
}

// Index a single Zettle document
export async function indexZettleDoc(zettleDir: string, filename: string, typesenseClient: any) {
  let mdfile: matter.GrayMatterFile<string> = matter("");
  const schemaName = "zettleDocuments";

  try {
    mdfile = matter.read(zettleDir + filename);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags)

    let mddoc = GreyMatterFileToTsZettleDoc(mdfile, filename)

    await typesenseClient.collections(schemaName).documents().create(mddoc);

  } catch (err: any) {
    console.error("issue with doc: ", filename);
    mdfile ? console.error(mdfile.stringify("data")) : console.error("gray-matter failed to load mdfile.")
    console.error(err);
  }
}

export function GreyMatterFileToTsZettleDoc(mdfile: matter.GrayMatterFile<string>, filename: string) {

  let mddoc = {
    type: mdfile.data.type ? "zettle-" + mdfile.data.type : "zettle-unknown",
    title: mdfile.data.title == null ? mdfile.data.title : filename,
    tags: mdfile.data.tags ? mdfile.data.tags : "",
    date: mdfile.data.date ? mdfile.data.date : "",
    content: mdfile.content ? mdfile.content : "",
    rank: 1
  }

  return mddoc

}