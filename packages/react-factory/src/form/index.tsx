import * as React from 'react'
import c from 'classnames'
import { FormItReactProps, Form, FormItReactRefType } from '@form-it/react-core'

// import './style.scss'
import { CommonFormItReadLayoutFieldProps } from '..'
import presetPlugins from '../plugins'

export { FormIt } from '@form-it/react-core'

export type FormItReactLayoutProps<ExtraProps = any> = {
  className?: string
} & FormItReactProps &
  ExtraProps &
  CommonFormItReadLayoutFieldProps

export type FormItReactLayoutRefType = FormItReactRefType

export default function createFormComponent<PropsType = unknown>(FormUIComponent: React.ComponentType) {
  const FormItReactLayout = React.forwardRef<FormItReactLayoutRefType, FormItReactLayoutProps<PropsType>>(
    function FormItReactLayout(
      {
        className,
        children,
        value,
        defaultValue,
        onSubmit,
        onSetup,
        plugins,
        onFieldDidChange,
        onFieldWillChange,
        // FieldProps
        syncUrl,
        readOnly,
        commonFieldProps,
        labelWidth = 120,
        labelPosition,
        formIt,
        // Row Props
        ...props
      },
      ref
    ) {
      const computedPlugins = React.useMemo(
        () => (plugins ? presetPlugins.concat(plugins).filter(Boolean) : presetPlugins),
        [plugins]
      )

      const computedFieldProps = React.useMemo(
        () => ({
          ...commonFieldProps,
          labelWidth,
          syncUrl,
          readOnly,
          labelPosition
        }),
        [commonFieldProps, labelWidth, labelPosition, readOnly, syncUrl]
      )

      return (
        // @ts-ignore
        <FormUIComponent className={c(className, 'form-it-react-form')} {...props}>
          <Form
            {...{
              ref,
              commonFieldProps: computedFieldProps,
              value,
              defaultValue,
              onSubmit,
              onSetup,
              onFieldDidChange,
              onFieldWillChange,
              formIt,
              plugins: computedPlugins
            }}
          >
            {children}
          </Form>
        </FormUIComponent>
      )
    }
  )

  return React.memo(FormItReactLayout)
}
