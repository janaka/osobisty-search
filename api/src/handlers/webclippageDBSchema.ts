export interface WebClipPageDbSchema {
  id: string,
  page_url: string,
  clippings: Array<WebClipDbSchema>
}

export interface WebClipDbSchema {
  id: string,
  source_content: string, // plain text
  notes_content: string,
  source_content_html: string,
}