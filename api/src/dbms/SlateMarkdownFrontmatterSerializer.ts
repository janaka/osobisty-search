import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { remarkToSlate, slateToRemark, SlateToRemarkOptions, RemarkToSlateOptions } from 'remark-slate-transformer';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkStringify from "remark-stringify";
import { unified } from 'unified';
import markdown from 'remark-parse';
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
    console.log("serialize(data) data param value. Slate format `children` node: ", JSON.stringify(data))

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

        console.log("serialise() root node AST: ", JSON.stringify(ast))

        serializedData = processor.stringify(ast) //JSON.stringify(data);

        console.log("serialize() return data after running processor: ", serializedData)
        
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

        if (error) throw (error)

        //let initialValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];

        if (!vfile) throw ("vfile empty")

        if (!vfile.result) throw ("remark-slate ain't doing it's thing")

        //console.log("remark-slate `result`:", vfile.result)

        result = vfile.result as Node[];

      })
    return result;
  }
}

export class SlateMarkdownFrontMatterSerialiserFactory implements IAbstractSerializerFactory {
  GetInstance(): ISerializer<Array<Node>> {
    return new SlateMarkdownFrontMatterSerializer()
  }
}