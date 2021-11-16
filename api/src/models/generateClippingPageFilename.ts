import { URL } from 'url';

/**
 * Generate the filename given the URL. This should generate the same results given the same URL.
 * @param {string} clippingPageId - unique ID for the page
 * @param {string} clippingPageUrl - 
 * @returns filename = domain + --- + hash of URL
 */
export function generateClippingPageFilename(clippingPageId: string, clippingPageUrl: string): string {
  //filename = domain + --- + hash of URL
  const url = new URL(clippingPageUrl)

  const filename = url.hostname + "---" + clippingPageId;
  return filename
}
