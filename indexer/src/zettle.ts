import { fileIterator } from './fileIterator.js'
import matter, { GrayMatterFile } from 'gray-matter';


export async function fullIndexZettkeDocuments(typesenseClient: any) {

  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/", "/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", indexZettleDoc, typesenseClient);
}

// Index a single Zettle document
async function indexZettleDoc(zettleRootDir: string, fileDir:string, filename: string, typesenseClient: any) {
  let mdfile: matter.GrayMatterFile<string> = matter("");
  const schemaName = "zettleDocuments";

  try {
    mdfile = matter.read(fileDir + filename);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags)

    const relDir = "/" + fileDir.replace(zettleRootDir, "")
    let mddoc = GreyMatterFileToTsZettleDoc(mdfile, relDir, filename)

    await typesenseClient.collections(schemaName).documents().create(mddoc);

  } catch (err: any) {
    console.error("issue with doc: ", filename);
    mdfile ? console.error(mdfile.stringify("data")) : console.error("gray-matter failed to load mdfile.")
    console.error(err);
  }
}

function GreyMatterFileToTsZettleDoc(mdfile: matter.GrayMatterFile<string>, relDir:string, filename: string) {

  let mddoc = {
    type: mdfile.data.type ? "zettle-" + mdfile.data.type : "zettle-unknown",
    title: mdfile.data.title != null || undefined ? mdfile.data.title : makeFilenameSearchFriendly(filename),
    tags: mdfile.data.tags ? mdfile.data.tags : "",
    date: mdfile.data.date ? mdfile.data.date : "",
    link: relDir + filename, 
    content: mdfile.content ? mdfile.content : "",
    rank: 1
  }

  return mddoc
}

function makeFilenameSearchFriendly(filename: string) {

  filename = filename.replace(".md", "")

  filename = filename.replace("-", " ")
  filename = filename.replace("_", " ")
  console.log("makesearch friendly" + filename)
  return filename
}