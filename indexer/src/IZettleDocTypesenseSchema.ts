export interface IZettleDocTypesenseSchema {
  //id: string
  title?: string
  type: string
  tags?: string
  authors?: string
  note_content: string 
  source_content?: string
  date?: string // change to number or bigint
  link: string,
  index_date: string // change to number or bigint
  rank: number
}

//TODO: convert dates to https://en.wikipedia.org/wiki/Unix_time and store as int64. this will enable date range filters etc

