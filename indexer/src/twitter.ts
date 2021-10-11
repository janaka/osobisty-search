import {fileIterator} from './fileIterator.js'
import fs from 'fs';

export async function fullIndexTwitterBookmarks(typesenseClient:any) {
  //indexTwitterBookmarks("/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/twitter-bookmarks.json")
  fileIterator("/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/","/Users/janakaabeywardhana/code-projects/zettelkasten/fleeting/", ".json", indexTwitterBookmarks, typesenseClient);
}

async function indexTwitterBookmarks(twitterBookmarksJsonFile: string, filename: string, typesenseClient:any) {
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
            await typesenseClient.collections(schemaName).documents().create(twitterBookmark);
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
