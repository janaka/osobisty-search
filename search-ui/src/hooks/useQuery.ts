import { useLocation } from "react-router-dom";


/**
 * A custom hook that builds on useLocation to parse
 * query string params
 * @returns `URLSearchParams` - class is a global reference for `require('url').URLSearchParams`. https://nodejs.org/api/url.html#class-urlsearchparams
 */
export function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}