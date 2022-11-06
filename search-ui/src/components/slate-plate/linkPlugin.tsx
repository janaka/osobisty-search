import { LinkPlugin, PlateFloatingLink } from '@udecode/plate';
import { MyEditor, MyPlatePlugin, MyValue } from './plateTypes';

export const linkPlugin: Partial<MyPlatePlugin> = {
  renderAfterEditable: PlateFloatingLink,
};
