import fs from 'fs';

/* 
*   Generic recursive file iterator for search engine indexing.
*   Opens each file in `fileDir` and runs `indexerFunction` aginast the file
*   `indexerFunction` - are doc type specific Typesense.org search engine indexers
*   `fileExtFilter` - filter to only run indexerFunction on files with a matching extention.
*   `rootDir` - the root director for the repository of docs. used to calculate relative paths for files for `link` property in the index.
*/
export async function fileIterator(rootDir: string, fileDir:string, fileExtFilter: string, indexerFunction: (rootDir: string, fileDir:string, filename: string, typesenseClient: any) => void, typesenseClient: any) {
  // loopthrough directories recursively and index all *.md files
  fs.readdir(fileDir, { withFileTypes: true }, (err: any, files: fs.Dirent[]) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach(async (file: fs.Dirent) => {
      let mdfile = null;
      if (file.isFile()) {
        if (file.name.endsWith(fileExtFilter)) {
          console.log("file:" + file.name)
          indexerFunction(rootDir, fileDir, file.name, typesenseClient)
        }
      } else {
        console.log("dir:" + file.name)
        if (!file.name.startsWith(".")) {
          fileDir = fileDir + file.name + "/"
          fileIterator(rootDir, fileDir, fileExtFilter, indexerFunction, typesenseClient)
        }
      }

    });

  });
}