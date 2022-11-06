import { PlateProvider, Toolbar, LinkToolbarButton, Plate, TEditableProps, withTReact, PlateEditor, setPlatePlugins, TEditor, Value, WithPlateOptions, PlatePlugin, AnyObject, WithPlatePlugin } from "@udecode/plate";
import { PLUGINS } from "./components/slate-plate/plugins";
import { Link } from "react-router-dom";
import { createMyEditor, MyEditor, MyValue } from "./components/slate-plate/plateTypes";
import { ReactNode, useMemo } from "react";
import { withTYjs } from "./components/slate-plate/withTYjs";
import * as Y from 'yjs';

const editableProps: TEditableProps<MyValue> = {
  autoFocus: false,
  spellCheck: false,
  placeholder: "Type…",
  className: "plateEditor",
};

//let sharedRoot




export function Testeditor1(props: any) {

  const docName = "sfsdfsdf";

  const editor = useMemo(() => {


    // define top level type as yXmlText
    //const ydoc = new Y.Doc() //wsProvider.doc.get(docName, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);
    //const sharedRoot = ydoc.get('my xmltext type', Y.XmlText) as Y.XmlText


    return withPlate1<MyValue, MyEditor>(createMyEditor(), { id: "testeditor1", plugins: PLUGINS.allNodes })

    // the order below is important
    // return withTReact(
    //   withTYjs(
    //     withPlate<MyValue, MyEditor>(
    //       createMyEditor(),
    //       { id: docName, plugins: PLUGINS.allNodes }
    //     ),
    //     sharedRoot,
    //     { autoConnect: false }
    //   )
    // );
  }, [])



  return (

    <Plate<MyValue, MyEditor> id="testeditor1" editor={editor} editableProps={{ ...editableProps }} plugins={PLUGINS.allNodes} />

  );
};

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate1 = <V extends Value = Value, E extends TEditor<V> = TEditor<V>>
  (
    e: E,
    {
      id,
      plugins = [],
      disableCorePlugins,
    }: WithPlateOptions<V, E & PlateEditor<V>> = {}
  ): E & PlateEditor<V> => {
  let editor = (e as any) as E & PlateEditor<V>;

  editor.id = id as string;
  editor.prevSelection = null;
  editor.currentKeyboardEvent = null;

  if (!editor.key) {
    editor.key = Math.random();
  }

console.log("plugins: ", plugins)

  editor.plugins = plugins as WithPlatePlugin<{}, V>[]

  setPlatePlugins<V>(editor, {
    plugins: plugins as WithPlatePlugin<{}, V>[], //as any,
    disableCorePlugins,
  });

  // let afterEditable: ReactNode = null;
  // let beforeEditable: ReactNode = null;
  // plugins.forEach((plugin) => {
  //   const { renderBeforeEditable, renderAfterEditable } = plugin;

  //   if (renderAfterEditable) {
  //     afterEditable = (
  //       <>
  //         {afterEditable}
  //         {renderAfterEditable()}
  //       </>
  //     );
  //   }

  //   if (renderBeforeEditable) {
  //     beforeEditable = (
  //       <>
  //         {beforeEditable}
  //         {renderBeforeEditable()}
  //       </>
  //     );
  //   }
  // });

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {

      editor = plugin.withOverrides(editor, plugin) as any;
    }
  });

  return editor;
};


