import {unified} from 'unified';
import {remark} from 'remark'
import remarkParse from 'remark-parse';
import remarkSlate from '../../../remark-slate/dist/index.js';
import remarkStringify from 'remark-stringify'
import { remarkToSlate } from "remark-slate-transformer";
import remarkHtml from 'remark-html';

  unified()
    .use(remarkParse)
    .use(remarkToSlate)
    .process('[my link](https://github.com)', (err, file) => {
      if (err) throw err;
      if (!file) throw "file is undefined"
      console.log(file);
    });

  // 

  // const processor = unified().use(markdown).use(remarkToSlate);
  
  // const text = "# hello world";
  
  // const value = processor.processSync(text).result;
  // console.log(value);