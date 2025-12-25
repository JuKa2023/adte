import { computed, type Ref } from 'vue'
import type { PostcardRecord, PostcardElement } from '../backend'
import { resolveElementImageUrl } from '../backend'

/**
 * Composable to resolve element image references to actual URLs
 * Use this when displaying saved postcards where element images are stored as file references
 */
export function useResolvedElements(postcard: Ref<PostcardRecord> | PostcardRecord) {
  return computed<PostcardElement[]>(() => {
    const record = 'value' in postcard ? postcard.value : postcard
    return (record.elements || []).map((element) => {
      if (element.type === 'image' && element.content.startsWith('element_image:')) {
        return {
          ...element,
          content: resolveElementImageUrl(record, element.content),
        }
      }
      return element
    })
  })
}
