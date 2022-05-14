// @refresh reset
import React, { useState, useMemo, useEffect } from 'react'
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';
import * as Y from 'yjs';
// Import the Slate editor factory.
import { createEditor, BaseEditor, Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
// Import the Slate components and React plugin.
import { ReactEditor, withReact } from 'slate-react';
import {
  createPlugins,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  createDeserializeMdPlugin,
  Plate,
  PlateEditor,
  withPlate,
  usePlateEditorState,
  PlateProvider} from '@udecode/plate'
import { createMDPreviewPlugin } from './createMDPreviewPlugin'
import { PLUGINS } from './plugins';
import { EditableProps } from 'slate-react/dist/components/editable';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';



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
    createMDPreviewPlugin(),
  ]);

  //use remark-slate to de/serialise MD https://github.com/hanford/remark-slate

  
  let initialValue: any = [];
  useMemo(
    async () => {

      await unified()
        .use(markdown)
        .use(slate)
        .process(docEditContent, (_, nodes) => {
          initialValue = nodes.result
        });

      console.log("remark-slate `result`:", initialValue)
      //console.log("remark-slate `value`:", value)

    }, [docId]
  );

  const [value, setValue] = useState<Descendant[]>(initialValue);
  


  const editor = useMemo(() => {
    const yDoc = new Y.Doc();
    const sharedRoot = yDoc.get(docId, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);

    console.log("remark-slate `value`:", value)
    // Load the initial value into the yjs document      
    sharedRoot.applyDelta(slateNodesToInsertDelta(value));
    //sharedType1.insert(0, docEditContent);
    //sharedType1.insert(0, "docId=" + docId);
    console.log("reset `editor` for docId=" + docId)
    console.log("`sharedRoot` init value:", sharedRoot)

    // the order below is important
    return withReact(
      withYjs(
        withPlate(
          createEditor(),
          { id: docId, plugins:plugins, disableCorePlugins: false }
        ),
        sharedRoot,
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
      //value={value}
      value={initialValue} //{[{ children: [{ text: '' }] }]}
      plugins={plugins}
      onChange={(newValue) => {
        setValue(newValue)
        console.log("`sharedRoot` onChange():", editor.sharedRoot.toJSON())
      }}

    />

  );
};

export default EditView;