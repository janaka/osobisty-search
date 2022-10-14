//import { InputNodeTypes } from "remark-slate";
import { OverridedMdastBuilders } from "remark-slate-transformer/lib/transformers/mdast-to-slate";
import { OverridedSlateBuilders } from "remark-slate-transformer/lib/transformers/slate-to-mdast";
import slate from 'slate';
import type {
  Parent,
  Literal,
  Root,
  Paragraph,
  Heading,
  ThematicBreak,
  Blockquote,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  HTML,
  Code,
  YAML,
  Definition,
  FootnoteDefinition,
  Text,
  Emphasis,
  Strong,
  Delete,
  InlineCode,
  Break,
  Link,
  Image,
  LinkReference,
  ImageReference,
  Footnote,
  FootnoteReference,
  Resource,
  Association,
  Reference,
  Alternative,
}  from 'mdast';

// Override the default remark-slate node type names to match Plate defaults
// <remark-slate type>:<plate type>;

const ELEMENT_BLOCKQUOTE = 'blockquote';
const ELEMENT_CODE_BLOCK = 'code_block';
const ELEMENT_CODE_LINE = 'code_line';
const ELEMENT_EXCALIDRAW = 'excalidraw';
const ELEMENT_H1 = 'h1';
const ELEMENT_H2 = 'h2';
const ELEMENT_H3 = 'h3';
const ELEMENT_H4 = 'h4';
const ELEMENT_H5 = 'h5';
const ELEMENT_H6 = 'h6';
const ELEMENT_IMAGE = 'img';
const ELEMENT_LI = 'li';
const ELEMENT_LIC = 'lic'; // listitem checkbox
const ELEMENT_LINK = 'a';
const ELEMENT_MEDIA_EMBED = 'media_embed';
const ELEMENT_MENTION = 'mention';
const ELEMENT_MENTION_INPUT = 'mention_input';
const ELEMENT_OL = 'ol';
const ELEMENT_PARAGRAPH = 'p';
const ELEMENT_TABLE = 'table';
const ELEMENT_TD = 'td';
const ELEMENT_TH = 'th';
const ELEMENT_TODO_LI = 'action_item';
const ELEMENT_TR = 'tr';
const ELEMENT_UL = 'ul';
const MARK_BOLD = 'bold';
const MARK_CODE = 'code';
const MARK_ITALIC = 'italic';
const MARK_STRIKETHROUGH = 'strikethrough';

export type plateNodeTypesHeadingObjectKey = keyof typeof plateNodeTypes.heading;

export const plateNodeTypes = {
  paragraph: ELEMENT_PARAGRAPH,
  block_quote: ELEMENT_BLOCKQUOTE,
  code_block: ELEMENT_CODE_BLOCK,
  link: ELEMENT_LINK,
  ul_list: ELEMENT_UL,
  ol_list: ELEMENT_OL,
  listItem: ELEMENT_LI,
  actionListItem: ELEMENT_TODO_LI, // this is not HTML rendered as a <UL> or <OL>
  heading: {
    1: ELEMENT_H1,
    2: ELEMENT_H2,
    3: ELEMENT_H3,
    4: ELEMENT_H4,
    5: ELEMENT_H5,
    6: ELEMENT_H6,
  },
  emphasis_mark: MARK_ITALIC,
  strong_mark: MARK_BOLD,
  delete_mark: MARK_STRIKETHROUGH, //'strikeThrough',
  inline_code_mark: MARK_CODE, //'code',
  thematic_break: 'thematic_break',
  image: ELEMENT_IMAGE,
};

//TODO: create a type based on the ast types imported
//ref: https://github.com/syntax-tree/mdast
export const slateNodeTypes = {
  paragraph: 'paragraph',
  block_quote: 'blockquote',
  code_block: 'code',
  link: 'link',
  list: 'list',
  ul_list: ELEMENT_UL,
  ol_list: ELEMENT_OL,
  listItem: 'listItem',
  heading: 'heading',
  emphasis_mark: MARK_ITALIC,
  strong_mark: MARK_BOLD,
  delete_mark: 'delete', //'strikeThrough',
  inline_code_mark: MARK_CODE, //'code',
  thematic_break: 'thematic_break',
  image: 'image',
};

/**
 * Map from remark to Plate node names when deserializing MD
 */
export const remarkToSlateOverrides: OverridedMdastBuilders = {
  
  paragraph: (node: any, next:any) => ({
    type: plateNodeTypes.paragraph,
    depth: node.depth,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  link: (node: any, next:any) => ({
    type: plateNodeTypes.link,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  // This overrides `type: "heading"` builder of MDAST to SlatePlate 
  heading: (node: any, next:any) => ({
    type: plateNodeTypes.heading[node.depth as plateNodeTypesHeadingObjectKey],
    depth: node.depth,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  list: (node: any, next:any) => ({
    type: node.ordered ? plateNodeTypes.ol_list : plateNodeTypes.ul_list,
    children: next(node.children),
  }),
  listItem: (node: any, next:any) => ({
    type: node.checked ? plateNodeTypes.actionListItem : plateNodeTypes.listItem,
    children: next(node.children),
  }),
}

/**
 * we need to map between Plate to Slate when serializing to MD. 
 * 
 * The following is mapping from Plate to Slate becuase the remark only understands Slate
 */
export const slateToRemarkOverrides: OverridedSlateBuilders = {
  
  p: (node: any, next:any) => ({
    type: slateNodeTypes.paragraph,
    depth: node.depth,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  a: (node: any, next:any) => ({
    type: slateNodeTypes.link,
    url: node.url,
    title: node.title,//node.children>0 && node.children[0].type=='text' ? node.children[0].value : node.url,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  // This overrides `type: "heading"` builder to go from Plate to Slate for remark
  h1: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    level: 1,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  h2: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    depth: 2,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  h3: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    depth: 3,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  h4: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    depth: 4,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  h5: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    depth: 5,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  h6: (node: any, next:any) => ({
    type: slateNodeTypes.heading,
    depth: 6,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  ul: (node: any, next:any) => ({
    type: slateNodeTypes.list,
    ordered: false,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  ol: (node: any, next:any) => ({
    type: slateNodeTypes.list,
    ordered: true,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  li: (node: any, next:any) => ({
    type: slateNodeTypes.listItem,
    checked: node.checked ? node.checked : false,
    depth: 1,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  lic: (node: any, next:any) => ({
    type: slateNodeTypes.listItem,
    checked: node.checked ? node.checked : false,
    depth: 1,
    // You have to call next if the node have children
    children: next(node.children),
  }),
  action_item: (node: any, next:any) => ({
    type: slateNodeTypes.listItem,
    checked: node.checked ? node.checked : false,
    depth: 1,
    // You have to call next if the node have children
    children: next(node.children),
  }),
}
