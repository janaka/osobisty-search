import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { remarkToSlate, slateToRemark, SlateToRemarkOptions, RemarkToSlateOptions } from 'remark-slate-transformer';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkStringify from "remark-stringify";
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkCodeBlocks from 'remark-code-blocks';
import { remarkToSlateOverrides, slateToRemarkOverrides, slateNodeTypes, plateNodeTypes, plateNodeTypesHeadingObjectKey } from '../libs/remarkslate-nodetypes.js';
import { IAbstractSerializerFactory } from './IAbstractSerializerFactory.js';
import { ISerializer } from './ISerializer.js';
import { Node } from 'slate'
import type * as slate from "slate";

// type Node = Editor | Element | Text;
// type Editor = slate.Editor;
// type Element = slate.Element & { type: string };
// type Text = slate.Text;
type Descendant = Node[]

/**
 * De/Serialize a Slate editor Abstract Syntax Tree (AST) of Markdown+FrontMatter to and from  a MD+FrontMatter text.
 */
export class SlateMarkdownFrontMatterSerializer implements ISerializer<Node[]> {
  readonly defaultFileExtension: string = ".md";

  serialize(data: Node[]): string {
    // use remark to serialize
    let serializedData: string = "";
    console.log("");
    console.log("");
    console.log("serialize(data) input value. PLATE format `children` node: ")
    console.log(JSON.stringify(data));
    console.log("");
    const data1 = [{ "type": "p", "children": [{ "text": "What is this?" }] }, { "type": "p", "children": [{ "text": "" }] }, { "type": "ul", "children": [{ "type": "li", "children": [{ "type": "lic", "children": [{ "text": " dfgdfgdfg" }] }] }] }, { "type": "p", "children": [{ "text": "" }] }, { "type": "p", "children": [{ "text": "s" }] }, { "type": "p", "children": [{ "text": "ssafdsf h jkhkjhkf" }] }, { "type": "p", "children": [{ "text": "sdfds aSDASDASD D " }] }, { "type": "p", "children": [{ "text": "d d zc n d" }] }];
    // const data2 = [{
    //   type: 'p',
    //   children: [
    //     { text: 'This text is underlined.' },
    //   ],
    // }];
    console.log("serialize AST node count: ", data.length)
    if (data.length > 0) {

      try {
        const processor = unified()
          .use(slateToRemark, {
            overrides: slateToRemarkOverrides // we need these becase Plate type names are different to Slate
          })
          .use(remarkGfm)
          .use(remarkStringify)

        const ast = processor.runSync({
          type: "root",
          children: data,
        })

        console.log("serialise() processor stringify input - SLATE root node AST: ")
        console.log(JSON.stringify(ast));
        console.log("");

        serializedData = processor.stringify(ast) //JSON.stringify(data);

        console.log("serialize() processor output: ")
        console.log(serializedData);
        console.log("");
      } catch (error) {
        console.error("slateToRemark failed. " + error)
        //throw new Error("slateToRemark failed. " + error)
      }
    }
    return serializedData;
  }

  deserialize(data: string): Node[] {
    // const result: object = JSON.parse(data);
    let result: Node[] = [];  //: Array<Element> = new Array<Element>();

    try {
      unified()
        .use(markdown)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkUnwrapImages)
        .use(remarkGfm)
        .use(remarkToSlate, {
          // If you use TypeScript, install `@types/mdast` for autocomplete.
          overrides: remarkToSlateOverrides
        })
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
}

export class SlateMarkdownFrontMatterSerialiserFactory implements IAbstractSerializerFactory {
  GetInstance(): ISerializer<Array<Node>> {
    return new SlateMarkdownFrontMatterSerializer()
  }
}