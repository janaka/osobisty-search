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
} from '@udecode/plate';
import { css } from 'styled-components';
import { autoformatRules } from './autoformat/autoformatRules';

//import { CONFIG } from './config';

export const clearBlockFormat: AutoformatBlockRule['preFormat'] = (editor) =>
  unwrapList(editor);


const basicElements = createPlugins(
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

const basicMarks = createPlugins(
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

const complex = createPlugins(
  [
    createResetNodePlugin(),
    createSoftBreakPlugin(),
    createExitBreakPlugin(),
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
      {[ELEMENT_H3]: withProps(StyledElement, {
        as: 'h3',
        styles: {
          root: css`
            margin: 1em 0 1px;
            font-size: 1em;
            font-weight: 700;
            line-height: 1.3;
            color: #666666;
            `,
        },
      }),}
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
