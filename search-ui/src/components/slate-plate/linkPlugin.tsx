import { LinkPlugin, PlateFloatingLink } from '@udecode/plate';
import { MyPlatePlugin } from './plateTypes';

export const linkPlugin: Partial<MyPlatePlugin<LinkPlugin>> = {
  renderAfterEditable: PlateFloatingLink,
};
