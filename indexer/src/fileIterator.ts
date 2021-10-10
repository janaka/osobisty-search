import fs from 'fs';

/* 
*   Generic recursive file iterator.
*   Opens each file in `dir` and runs `indexerFunction` aginast the file
*   indexerFunctions are doc type specific
*   Only runs indexerFunction on files that match the `fileExtFilter`
*/
export async function fileIterator(dir: string, fileExtFilter: string, indexerFunction: (path: string, filename: string, typesenseClient: any) => void, typesenseClient: any) {
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
          indexerFunction(dir, file.name, typesenseClient)
        }
      } else {
        console.log("dir:" + file.name)
        if (!file.name.startsWith(".")) {
          fileIterator(dir + file.name + "/", fileExtFilter, indexerFunction, typesenseClient)
        }
      }

    });

  });
}