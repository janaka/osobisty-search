import {
  AutoformatBlockRule,
  createAutoformatPlugin,
  createBasicElementsPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createImagePlugin,
  createItalicPlugin,
  createLinkPlugin,
  createListPlugin,
  createParagraphPlugin,
  createPlateUI,
  createPlugins,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createTodoListPlugin,
  createUnderlinePlugin,
  ELEMENT_H1,
  ELEMENT_H3,
  StyledElement,
  unwrapList,
  withProps,
  ELEMENT_H2,
  KEYS_HEADING,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TD,
  ELEMENT_LI,
  ELEMENT_PARAGRAPH,
  ELEMENT_LINK,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  PlateFloatingLink,
} from '@udecode/plate';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { autoformatRules } from './autoformat/autoformatRules';
import { linkPlugin } from './linkPlugin';
import { createMyPlugins, MyTodoListElement } from './plateTypes';
import { resetBlockTypePlugin } from './resetBlockTypePlugin';
//import tw from 'twin.macro'

//import { CONFIG } from './config';

export const clearBlockFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);


const basicElements = createMyPlugins(
  [
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

const basicMarks = createMyPlugins(
  [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createStrikethroughPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createUnderlinePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

const complex = createMyPlugins(
  [
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin({
      options: {
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
            },
          },
        ],
      },
    }),
    createExitBreakPlugin(
      {
        options: {
          rules: [
            { hotkey: 'mod+enter' },
            { hotkey: 'mod+shift+enter', before: true },
            {
              hotkey: 'enter',
              query: {
                start: true,
                end: true,
                allow: KEYS_HEADING,
              }
            }
          ],

        },
      }
    ),
    createTodoListPlugin(),
    createAutoformatPlugin(
      {
        options: {
          rules: [
            ...autoformatRules,
          ],

        },
      }
    )
  ],
  {
    components: createPlateUI(),
  }
);


export const PLUGINS = {
  basicElements,
  basicMarks,
  complex,
  basicNodes: createMyPlugins([...basicElements, ...basicMarks], {
    components: createPlateUI(),
  },),
  // Note: 
  // styled-component css defaults are in createPlateUI.ts https://github.com/udecode/plate/blob/main/packages/ui/plate/src/utils/createPlateUI.ts
  // css` prefix is for css. tw` prefix is for TailwindCSS via twin.macro
  allNodes: createMyPlugins(
    [...basicElements, ...basicMarks, ...complex],
    {
      components: createPlateUI({
        [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
          // as: 'p',
          styles: {
            root: {
              margin: 0,
              padding: '4px 0',
            },
          },
          prefixClassNames: 'p',
        }),
        [ELEMENT_H1]: withProps(StyledElement, {
          as: 'h1',
          styles: {
            root: css`
            margin: 0.15em 0 0.5em;
            font-size: 2em;
            font-weight: 700;
            line-height: 1.3;
            color: #666666;
            `,
          },
        }),
        [ELEMENT_H2]: withProps(StyledElement, {
          as: 'h2',
          styles: {
            root: css`
            margin: 0.15em 0 0.5em;
            font-size: 1.5em;
            font-weight: 600;
            line-height: 1.3;
            `,
          },
        }),
        [ELEMENT_H3]: withProps(StyledElement, {
          as: 'h3',
          styles: {
            root: css`
            margin: 0.15em 0 0.5em;
            font-size: 1em;
            font-weight: 700;
            line-height: 1.3;
            color: #666666;
            `,
          },
        }),
        [ELEMENT_UL]: withProps(StyledElement, {
          as: 'ul',
          styles: {
            root: [
              tw``,
              css`
          list-style: revert;
          margin: 0;
          padding-inline-start: 20px;
        `,]
          },
        }),
        [ELEMENT_OL]: withProps(StyledElement, {
          as: 'ol',
          styles: {
            root: css`
          margin: 0;
          padding-inline-start: 20px;
        `,
          },
        }),
        // [ELEMENT_LI]: withProps(StyledElement, {
        //   as: 'li',
        //   styles: {
        //     root: [css`list-style:initial;`]
        //   },
        // }),
        [ELEMENT_LINK]: withProps(StyledElement, {
          as: 'a',
          styles: {
            root: [tw`text-blue-600 visited:text-purple-600`,css``]
          },
        }),

      }
      ),
    },),

  // image: createPlugins(
  //   [
  //     createBasicElementsPlugin(),
  //     ...basicMarks,
  //     createImagePlugin(),
  //     createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  //   ],
  //   {
  //     components: createPlateUI(),
  //   }
  // ),
};
