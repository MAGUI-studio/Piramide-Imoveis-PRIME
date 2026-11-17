import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

export function withPublicationFields(original: DocumentActionComponent): DocumentActionComponent {
  const action: DocumentActionComponent = (props) => {
    const base = original(props)
    const {patch} = useDocumentOperation(props.id, props.type)
    if (!base?.onHandle) return base
    const publish = base.onHandle
    return {
      ...base,
      onHandle: () => {
        const draft = props.draft
        const slug = (draft?.slug as {current?: string} | undefined)?.current
        if (draft && slug && !draft.firstPublishedSlug) {
          const publishedSlug = (props.published?.slug as {current?: string} | undefined)?.current
          patch.execute([{setIfMissing: {
            firstPublishedSlug: publishedSlug || slug,
            firstPublishedAt: props.published?._createdAt || new Date().toISOString(),
          }}])
        }
        publish()
      },
    }
  }
  action.action = 'publish'
  return action
}
