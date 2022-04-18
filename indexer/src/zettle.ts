import { fileIterator } from './fileIterator.js';
import matter, { GrayMatterFile } from 'gray-matter';
import { dateTimeNowUtc } from './utils.js';
import { delay, randomIntFromInterval } from './utils.js';
import SimpleMarkdown from 'simple-markdown';
import { IZettleDocTypesenseSchema } from './IZettleDocTypesenseSchema.js';

export async function fullIndexZettkeDocuments(typesenseClient: any) {

  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/", "/Users/janakaabeywardhana/code-projects/zettelkasten/", ".md", indexZettleDoc, typesenseClient);
}

// Index a single Zettle document
async function indexZettleDoc(zettleRootDir: string, fileDir: string, filename: string, typesenseClient: any) {
  //TODO: replace `grey-matter` with /Users/janakaabeywardhana/code-projects/osobisty-search/api/src/libs/frontmatter.ts

  let mdfile: matter.GrayMatterFile<string> = matter("");
  const schemaName = "zettleDocuments";

  try {
    mdfile = matter.read(fileDir + filename);
    if (!mdfile) console.error("\x1b[31m", "gray-matter failed to load mdfile.");
    

    const relDir = "/" + fileDir.replace(zettleRootDir, "")
    let mddoc = GreyMatterFileToTsZettleDoc(mdfile, relDir, filename)
    await delay(randomIntFromInterval(2500, 5000));
    await typesenseClient.collections(schemaName).documents().create(mddoc);
    console.log("title:" + mdfile.data.title + " tags:" + mdfile.data.tags);
  } catch (err: any) {
    console.error("\x1b[33m", "issue with doc: `" + fileDir + filename + "`");

    console.error(err);
  }
}

function GreyMatterFileToTsZettleDoc(mdfile: matter.GrayMatterFile<string>, relDir: string, filename: string) {
  //TODO: validate `type` values to avoid typos getting in.

  let title: string = makeFilenameSearchFriendly(filename);

  if (mdfile.data.title == null || undefined) {
    let mdparse = SimpleMarkdown.defaultBlockParse;
    let syntaxTree = mdparse(mdfile.content);

    //predicate: (value: SimpleMarkdown.SingleASTNode, index: number, obj: SimpleMarkdown.SingleASTNode[]) => unknown, thisArg?: any): SimpleMarkdown.SingleASTNode | undefined
    syntaxTree.find((value: SimpleMarkdown.SingleASTNode, index: number, obj: SimpleMarkdown.SingleASTNode[]) => {

      if (value.type === "heading" && value.level === 1) {

        let content: string[] = value.content;
        const initVal: any = "";
        const concatContent: string = content.reduce((prevVal: string, currVal: any, currIndex: number, array: string[]) => prevVal + currVal.content, initVal);
        title = concatContent;
      }
    });
  } else {
    title = mdfile.data.title;
  }

  let mddoc: IZettleDocTypesenseSchema = {
    type: mdfile.data.type ? "zettle-" + mdfile.data.type : "zettle-unknown",
    title: title,
    tags: mdfile.data.tags ? mdfile.data.tags : "",
    authors: mdfile.data.authors ? mdfile.data.authors : "",
    date: mdfile.data.date ? mdfile.data.date : "",
    link: relDir + filename,
    note_content: mdfile.content ? mdfile.content : "",
    source_content: "", 
    index_date: dateTimeNowUtc(),
    rank: 1
  }

  return mddoc
}

function makeFilenameSearchFriendly(filename: string) {

  filename = filename.replace(".md", "")

  filename = filename.replaceAll("-", " ")
  filename = filename.replaceAll("_", " ")

  console.log("make filename search friendly, new filename: " + filename)
  return filename
}