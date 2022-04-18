export interface IZettleDocTypesenseSchema {
  //id: string
  title?: string
  type: string
  tags?: string
  authors?: string
  note_content: string 
  source_content?: string
  date?: string // change to int64
  link: string,
  index_date: string // change to int64
  rank: number
}

//TODO: convert dates to https://en.wikipedia.org/wiki/Unix_time and store as int64
