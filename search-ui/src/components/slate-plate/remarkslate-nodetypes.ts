import { InputNodeTypes } from "remark-slate";

// Override the default remark-slate node type names to match Plate defaults

export const plateNodeTypes: InputNodeTypes = {
  paragraph: 'paragraph',
  block_quote: 'blockquote',
  code_block: 'code_block',
  link: 'link',
  ul_list: 'ul_list',
  ol_list: 'ol_list',
  listItem: 'list_item',
  heading: {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  },
  emphasis_mark: 'italic',
  strong_mark: 'bold',
  delete_mark: 'strikeThrough',
  inline_code_mark: 'code',
  thematic_break: 'thematic_break',
  image: 'img',
};