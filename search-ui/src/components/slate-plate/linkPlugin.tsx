import { LinkPlugin, PlateFloatingLink, TEditableProps, Value } from '@udecode/plate';
import { EditableProps } from 'slate-react/dist/components/editable';
import { MyEditor, MyPlatePlugin, MyValue } from './plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: (editableProps: TEditableProps<MyValue>) => {
    return PlateFloatingLink (editableProps as TEditableProps<Value>)
  },
};
