import {serializeJson} from '../lib/serializeJson'

export function JsonLd({data}: {data: object}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: serializeJson(data)}} />
}
