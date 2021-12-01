/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Model1 {
  /**
   * Unique ID for the page generated using the clip text
   * @example 08234939
   */
  id?: string;
  source_content?: string;
  source_content_html?: string;
  notes_content?: string;
}

export type Clippings = Model1[];

export interface WebClippingData {
  /**
   * Unique ID for the page generated using the page URL
   * @example 29384748
   */
  id?: string;
  page_url?: string;
  clippings?: Clippings;
}

export interface WebClippingsResponse {
  /** @example success | not found | error */
  message?: "success" | "not found" | "error";
  webClippingData?: WebClippingData;
}

export interface Webclipping {
  /** If clip_id is present, corresponding clip is updated. */
  clip_id?: string;

  /**
   * Clipped text
   * @example Some text clipped from a website.
   */
  source_content: string;

  /**
   * Notes related to the clipped text in `source_content`
   * @example Some nottes about the clipped text
   */
  notes_content?: string;

  /** The clipped `source_content` including any innerHTML base64 encoded. Makes highlighting easier on next page viist */
  matched_html?: string;

  /**
   * URi of the page the text was clipped from
   * @example https://www.google.com
   */
  page_url: string;
}

export interface Model2 {
  /**
   * Unique ID for the page generated using the clip text
   * @example 08234939
   */
  clipId?: string;

  /**
   * Unique ID for the page generated using the page URL
   * @example 29384748
   */
  clipPageId?: string;
}

export interface WebClippingResponse {
  /**
   * @pattern ^created$
   * @example created
   */
  message?: string;
  webClippingData?: Model2;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:3002";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Osobisty API
 * @version 0.4.1
 * @baseUrl http://localhost:3002
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  webclippings = {
    /**
     * No description
     *
     * @tags webclippings
     * @name GetWebclippings
     * @summary Get webclippings for a given web page
     * @request GET:/webclippings
     */
    getWebclippings: (query?: { page_url?: string }, params: RequestParams = {}) =>
      this.request<WebClippingsResponse, any>({
        path: `/webclippings`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags webclippings
     * @name PostWebclippings
     * @summary Create a new webclpping. If the web clip already exists then all fields are updated with the the payload. If the clip_id is present it is used to find the clip. Otherwise the id is computed using the clip content in the `source_content` field.
     * @request POST:/webclippings
     */
    postWebclippings: (body: Webclipping, params: RequestParams = {}) =>
      this.request<WebClippingResponse, any>({
        path: `/webclippings`,
        method: "POST",
        body: body,
        ...params,
      }),

    /**
     * No description
     *
     * @tags webclippings
     * @name PutWebclippings
     * @summary Create a new webclpping. If the web clip already exists then all fields are updated with the the payload. If the clip_id is present it is used to find the clip. Otherwise the id is computed using the clip content in the `source_content` field.
     * @request PUT:/webclippings
     */
    putWebclippings: (body: Webclipping, params: RequestParams = {}) =>
      this.request<WebClippingResponse, any>({
        path: `/webclippings`,
        method: "PUT",
        body: body,
        ...params,
      }),
  };
}
