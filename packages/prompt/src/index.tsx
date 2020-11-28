import * as React from 'react'
import { useFormIt } from '@form-it/react-core'
import Prompt, { MessageType } from '@rcp/c.prompt'

type PromptType = React.ComponentProps<typeof Prompt>

export const FormItPromptUserChanged: React.FC<
  { message?: string | MessageType; when?: (type: 'unload' | 'locationUpdate', data?: any) => boolean } & Pick<
    PromptType,
    'triggerOnBeforeUnload' | 'children' | 'onAfterOpenCustomPrompt'
  >
> = React.memo(({ triggerOnBeforeUnload, when, onAfterOpenCustomPrompt, children, message }) => {
  const formIt = useFormIt()
  const shouldPromptRef = React.useRef<boolean>(false)

  React.useEffect(() => {
    const onFieldDidChange = (didChange: any) => {
      if (didChange.changeType === 'user') {
        shouldPromptRef.current = true
      }
    }

    // 提交后重置
    const onSubmit = () => {
      shouldPromptRef.current = false
    }

    formIt?.on('fieldDidChange', onFieldDidChange)
    formIt?.on('submit', onSubmit)

    return () => {
      formIt?.off('fieldDidChange', onFieldDidChange)
      formIt?.off('submit', onSubmit)
    }
  }, [formIt, shouldPromptRef])

  const onBeforeOpenCustomPrompt = React.useCallback(
    (isOk) => {
      shouldPromptRef.current = !isOk
    },
    [shouldPromptRef]
  )

  const _when = React.useCallback(
    (type, data) => {
      if (shouldPromptRef.current && when) {
        return when(type, data)
      }
      return shouldPromptRef.current
    },
    [when, shouldPromptRef]
  )

  return (
    <Prompt
      triggerOnBeforeUnload={triggerOnBeforeUnload}
      onAfterOpenCustomPrompt={onAfterOpenCustomPrompt}
      message={message}
      when={_when}
      onBeforeOpenCustomPrompt={onBeforeOpenCustomPrompt}
    >
      {children || null}
    </Prompt>
  )
})
