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
} from '@udecode/plate';
import { css } from 'styled-components';
import { autoformatRules } from './autoformat/autoformatRules';
import { createMyPlugins } from './plateTypes';

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
    createLinkPlugin(),
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
    // createResetNodePlugin(),
    // createSoftBreakPlugin(),
    // createExitBreakPlugin(),
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
  basicNodes: createPlugins([...basicElements, ...basicMarks], {
    components: createPlateUI(),
  },),
  allNodes: createPlugins([...basicElements, ...basicMarks, ...complex], {
    components: createPlateUI(
      {[ELEMENT_H1]: withProps(StyledElement, {
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
