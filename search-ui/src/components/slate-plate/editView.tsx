// @refresh reset
import React, { useState, useMemo, useEffect } from 'react'
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor, withYHistory } from '@slate-yjs/core';
import * as Y from 'yjs';
// Import the Slate editor factory.
import { createEditor, BaseEditor, Descendant, Editor } from 'slate';
import { HistoryEditor } from 'slate-history';
// Import the Slate components and React plugin.
import { ReactEditor, Slate, Editable, withReact } from 'slate-react';
import {
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createPlugins,
  createBasicElementsPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  createDeserializeMdPlugin,
  Plate,
  PlateEditor,
  withPlate,
  ELEMENT_PARAGRAPH
} from '@udecode/plate'
import { PLUGINS } from './plugins';
import { EditableProps } from 'slate-react/dist/components/editable';



// You must define CustomTypes, annotate useState, and annotate the editor's initial state when using TypeScript 
// or Slate will display typing errors.
// https://docs.slatejs.org/concepts/12-typescript

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & PlateEditor & YjsEditor

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
}

export type HeadingElement = {
  type: 'heading'
  level: number
  children: CustomText[]
}

export type CustomElement = ParagraphElement | HeadingElement

export type PlainText = { text: string; }
export type FormattedText = { text: string; bold?: true }

export type CustomText = PlainText | FormattedText


declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}



/**
 * @param {string} [name]
 * @return {YXmlText}
 *
 * @public
 */
function getXmlText(ydoc: Y.Doc, name: string = ''): Y.XmlText {
  // @ts-ignore
  return ydoc.get(name, Y.XmlText);
}

const EditView = (props: any) => {

  const docId = props.id;
  const docEditContent = props.editContent;
  // Create a yjs document and get the shared type
  console.log("docId=" + docId);

  const editableProps: EditableProps = {
    autoFocus: false,
    spellCheck: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
      height: '100px'
    },
  };


  const plugins = createPlugins([
    ...PLUGINS.basicNodes,
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createDeserializeMdPlugin(),
  ]);

  const initialValue: Descendant[] = [{
    type: 'paragraph',
    children: [{ text: 'Let starts this doc with a para!' }],
  },]

  //TODO: use remark-slate to de/serialise MD https://github.com/hanford/remark-slate

  const [value, setValue] = useState<Descendant[]>([]);

  useMemo(
    () => {
      setValue(initialValue);
    }, [docId]
  );

  const editor = useMemo(() => {
    const yDoc = new Y.Doc();
    const sharedType = yDoc.get(docId, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);
    // Load the initial value into the yjs document      
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue));
    //sharedType1.insert(0, docEditContent);
    //sharedType1.insert(0, "docId=" + docId);
    console.log("reset `editor` for docId=" + docId)
    return withReact(
      withYjs(
        withPlate(
          createEditor(),
          { id: docId, plugins: plugins, disableCorePlugins: false }
        ),
        sharedType,
        { autoConnect: false }
      )
    );

    // withPlate(
    //   withReact(
    //   withYjs(createEditor(), sharedType, { autoConnect: false })),
    //   { id: docId, plugins: plugins, disableCorePlugins: false });


    // withReact(
    //   withPlate(
    //     withYjs(createEditor(), sharedType, { autoConnect: false }),
    //     { id: docId, plugins: plugins, disableCorePlugins: false })
    // );


    // withYjs(
    //   withReact(
    //     withPlate(createEditor(), { id: docId, plugins: plugins, disableCorePlugins: false })
    //   ), 
    //   sharedType, 
    //   { autoConnect: false }
    // );


    // withReact(
    //   withYHistory(
    //     withYjs(
    //       withPlate(createEditor(), { id: docId, plugins: plugins, disableCorePlugins: false }),
    //       sharedType, { autoConnect: false }
    //     )
    //   )
    // );
  }, [docId])

  // Setup the binding

  //const editor: CustomEditor = useMemo(() => withYjs(withReact(withPlate(createEditor(), { id: docId, plugins: plugins, disableCorePlugins: false })), sharedType), []);
  //const editor: Editor = useMemo(() => withYjs(withReact(createEditor()), sharedType), []);



  //https://signaling.simplewebrtc.com:443/

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    // <Slate
    //   editor={editor}
    //   value={value}
    //   onChange={setValue}
    // >
    //   <Editable />
    // </Slate>

    <Plate
      id={docId}
      editor={editor}
      editableProps={editableProps}
      value={value}
      //initialValue={initialValue}
      //plugins={plugins}
      onChange={setValue}

    />
  );
};

export default EditView;