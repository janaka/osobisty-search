import { createPluginFactory } from '@udecode/plate';
import { decoratePreview } from './decoratePreview';

export const createMDPreviewPlugin = createPluginFactory({
  decorate: decoratePreview,
  key: ''
});