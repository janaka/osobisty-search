import remarkFrontmatter from 'remark-frontmatter';
import { remarkToSlate, slateToRemark, SlateToRemarkOptions, RemarkToSlateOptions } from 'remark-slate-transformer';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkStringify from "remark-stringify";
import { unified } from 'unified';
import markdown from 'remark-parse';
import { remarkToSlateOverrides, slateToRemarkOverrides, slateNodeTypes, plateNodeTypes, plateNodeTypesHeadingObjectKey } from '../libs/remarkslate-nodetypes.js';
import { IAbstractSerializerFactory } from './IAbstractSerializerFactory.js';
import { ISerializer } from './ISerializer.js';

import type * as slate from "slate";

type Node = Editor | Element | Text;
type Editor = slate.Editor;
type Element = slate.Element & { type: string };
type Text = slate.Text;
type Descendant = Node[]

/**
 * De/Serialize a Slate editor Abstract Syntax Tree (AST) of Markdown+FrontMatter to and from  a MD+FrontMatter text.
 */
export class SlateMarkdownFrontMatterSerializer implements ISerializer<Node[]> {
  readonly defaultFileExtension: string = ".md";

  serialize(data: Node[]): string {
    // use remark to serialize
    let serializedData: string = "";
    console.log("serialize() Slate data: ", JSON.stringify(data))

    //const data1  = [{"type":"h2","dep":2,"children":[{"text":"Hello, "},{"text":"yes"}]}];
    // const data2 = [{
    //   type: 'p',
    //   children: [
    //     { text: 'This text is underlined.' },
    //   ],
    // }];

    try {
      const processor = unified()
        .use(slateToRemark, {
          overrides: slateToRemarkOverrides 
        })
        .use(remarkStringify)

      const ast = processor.runSync({
        type: "root",
        children: data,
      })


      console.log("serialise node root: ", JSON.stringify(ast))

      serializedData = processor.stringify(ast) //JSON.stringify(data);
    } catch (error) {
      throw new Error("slateToRemark failed. " + error)
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