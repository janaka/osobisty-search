import { SlateMarkdownFrontMatterSerialiserFactory, SlateMarkdownFrontMatterSerializer } from '../../src/dbms/SlateMarkdownFrontmatterSerializer.js';
import { BaseElement, Editor, Element, Node } from 'slate';
import fs  from 'fs';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { remarkToSlate, slateToRemark, SlateToRemarkOptions, RemarkToSlateOptions } from 'remark-slate-transformer';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkStringify from "remark-stringify";
import { unified } from 'unified';
import markdown from 'remark-parse';
import { remarkToSlateOverrides } from '../../src/libs/remarkslate-nodetypes.js';


describe('Unified troubleshooting', () => {

  
  beforeAll(() => {
    //db2 = new Dbms(dbconfig2)
  });

  afterAll(async () => {
    //db2.destroy();
  });

  function fileExists(fqfilename: string): boolean {
    
      //fs.accessSync(fqfilename, fs.constants.F_OK);
      
      return fs.existsSync(fqfilename);;
    
  }


  function deserialize(data: string): Node[] {
    // const result: object = JSON.parse(data);
    let result: Node[] = [];  //: Array<Element> = new Array<Element>();

    try {
      unified()
        .use(markdown)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkUnwrapImages)
        .use(remarkGfm)
        .use(remarkToSlate)
        // .use(remarkToSlate, {
        //   // If you use TypeScript, install `@types/mdast` for autocomplete.
        //   overrides: remarkToSlateOverrides
        // })
        .process(data, (error, vfile) => {
  
          if (error) throw new Error (`Error: SlateMarkdownFrontMatterSerializer.deserialize() error. Error message: ${error as Error}`)
  
          //let initialValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
  
          if (!vfile) throw new Error(`Error: SlateMarkdownFrontMatterSerializer.deserialize() error. vfile empty`)
  
          if (!vfile.result) throw new Error(`Error: SlateMarkdownFrontMatterSerializer.deserialize() error. remark-slate ain't doing it's thing. Empty vfile.result returned`)
  
          //console.log("remark-slate `result`:", vfile.result)
  
          result = vfile.result as Node[];
  
        })
        return result;
    } catch (error) {
      throw new Error(`SlateMarkdownFrontMatterSerializer.deserialize(): unified() had a fatal crash: ${error as Error}`)
    }
    
  }

  
  
  function sleep(ms:number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }




  test('MD de/serialize - simple text paragraph', (done) => {
    
    try {

      //const ser = new SlateMarkdownFrontMatterSerializer();

      const a = deserialize("Hello")
      console.log("deserialized `a`: ", JSON.stringify(a))
// let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
      
      done();
    } catch (error) {
      done(String(error));
    }
  });
 

 

  test('MD de/serialize - inlinecode', (done) => {
    
    try {
  
      //const ser = new SlateMarkdownFrontMatterSerializer();
  
      const a = deserialize("Hello `const code = () => {}`")
      console.log("deserialized `a`: ", JSON.stringify(a))
      // let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
  
      done();
    } catch (error) {
      done(String(error));
    }
  });

  test('MD de/serialize - codeblock', (done) => {
    
    try {
  
      //const ser = new SlateMarkdownFrontMatterSerializer();
      const f = fs.readFileSync("./tests/dbms/testdata/codeblock.md", "utf8")
      const a = deserialize(f)

      // const a = deserialize("```typescript\
      //   const code = () => {} \
      // ```")
      console.log("deserialized `a`: ", JSON.stringify(a))
      // let initialValue: Editor =  { children: [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"emphasis":true,"text":"yes"}]}]} //{ type: 'p', children: [{ text: 'initial value from backend' }] }; //[{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];
  
      done();
    } catch (error) {
      done(String(error));
    }
  });

 

});

