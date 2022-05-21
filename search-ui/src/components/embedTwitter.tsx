import useFetch from "../hooks/useFetchHook"

interface TwitterEmbed {
  url: string
  author_name: string
  author_url: string
  html: string
  width: number
  height: number
  type: string
  cache_age: number
  provider_name: string
  provider_url: string
  version: string
}

// twitter embed API https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/overview
// https://usehooks-typescript.com/react-hook/use-fetch

export function EmbedTweet(props: any) {

  const url = "https://publish.twitter.com/oembed?url=" + encodeURIComponent(props.tweetUrl)

  const { data, error } = useFetch<TwitterEmbed[]>(url, {
    mode: 'no-cors', referrerPolicy: 'same-origin', keepalive: true, headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Access-Control-Allow-Origin': '*'
    }
  })

  if (error) return <p>There is an error. {console.error(error)}</p>
  if (!data) return <p>Loading...</p>
  return (
    <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: data[0].html }}>
    </div>
  )

}