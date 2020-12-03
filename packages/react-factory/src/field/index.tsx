import * as React from 'react'
import c from 'classnames'
import { debounce } from 'lodash'
import { Field, FieldItemInput, FormItFieldContext, FormItFieldProps, useFormItField } from '@form-it/react-core'

import './style.scss'
import { reaction } from 'mobx'
import { ReactNode, useEffect, useLayoutEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { RuleObj } from '../plugins/validation'
import { useLocationWithQuery, useExtendQueryHistory } from '../utils'

export { FieldItemInput, useFormItField, FormItFieldConsumer } from '@form-it/react-core'

export type FormItReactLayoutFieldProps<ExtraProps = any> = {
  className?: string
  rule?: RuleObj | RuleObj[] | FormItFieldProps['rule']
  required?: boolean
  message?: string
  label?: ReactNode
} & ExtraProps &
  CommonFormItReadLayoutFieldProps &
  Omit<FormItFieldProps, 'rule'> & {
    name?: string
    children?: ((ctx: FieldItemInput) => React.ReactNode) | React.ReactNode | any
  }

export type CommonFormItReadLayoutFieldProps = {
  readOnly?: boolean
  syncUrl?: boolean | string
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  labelSuffix?: ReactNode
}

interface FormItReactLayoutFieldRefType {}

export default function createFieldComponent(FieldUIComponent: React.ComponentType) {
  type PropsType = React.ComponentProps<typeof FieldUIComponent>

  const FieldContainerSyncUrl = function FieldContainerSyncUrl(props: any) {
    const { syncUrl, name } = props

    const fieldCtx = useFormItField()
    const history = useExtendQueryHistory()
    const loc = useLocationWithQuery()
    const { query } = loc || {}

    const urlName = loc && fieldCtx && (typeof syncUrl === 'string' ? syncUrl : syncUrl && name)
    useEffect(() => {
      if (urlName && fieldCtx && history) {
        const dispose = reaction(
          () => fieldCtx?.value,
          debounce((arg, _prev, _r) => {
            if (fieldCtx && typeof fieldCtx.value !== 'undefined') {
              history?.replaceExtend({ query: { [urlName]: arg } })
            }
          }, 200)
        )
        return dispose
      }
    }, [fieldCtx, history, urlName])

    useLayoutEffect(() => {
      // 第一次的时候填充
      if (urlName && query[urlName] && fieldCtx) {
        fieldCtx.onChange(query[urlName])
      }
    }, [])

    return <FieldContainer {...props} syncUrl={false} />
  }

  const FieldContainer = observer(function FieldContainer({
    name,
    syncUrl,
    className,
    error,
    labelSuffix = '：',
    labelPosition = 'right',
    required,
    label,
    labelWidth,
    children,
    ...props
  }: any) {
    return (
      <FieldUIComponent
        className={c(
          className,
          'form-it-react-field',
          error && 'form-it-react-field-error',
          labelPosition && `form-it-react-field__pos-${labelPosition}`,
          required && 'form-it-react-field-required'
        )}
        {...props}
      >
        {label && (
          <div className="form-it-react-field__label">
            <div className="form-it-react-field__label-text" style={{ width: labelWidth }}>
              {label}
            </div>
            {labelSuffix}
          </div>
        )}
        <div className="form-it-react-field__ctrl">
          <div className="form-it-react-field__ctrl-wrapper">{children}</div>
          <div className="form-it-react-field__ctrl-error">{error}</div>
        </div>
      </FieldUIComponent>
    )
  })

  const FormItReactLayoutField = React.forwardRef<
    FormItReactLayoutFieldRefType,
    FormItReactLayoutFieldProps<PropsType>
  >(function FormItReactLayoutField(
    {
      className,
      children,
      name,
      defaultValue,
      rule,
      required,
      message = '此项必填',
      syncUrl,
      label,
      // labelWidth,
      ...props
    },
    ref
  ) {
    React.useImperativeHandle(ref, () => ({}), [])

    const content = (
      <FormItFieldContext.Consumer>
        {(ctx) => (
          <Observer>
            {() => {
              const innerProps = {
                name,
                syncUrl,
                label,
                required,
                ...ctx?.fieldProps,
                className: c(
                  className,
                  ctx && ctx.fieldProps && ctx.fieldProps.className,
                  name && `form-it-react-field-name-${name}`
                ),
                ...props,
                error: ctx?.error,
                children: children && typeof children === 'function' ? children(ctx) : children
              }
              if (innerProps.syncUrl) {
                return <FieldContainerSyncUrl {...innerProps} />
              }
              return <FieldContainer {...innerProps} />
            }}
          </Observer>
        )}
      </FormItFieldContext.Consumer>
    )

    const rules = React.useMemo(() => {
      let newRules: any[] = []
      if (required) {
        newRules.push({ required: true })
      }
      if (rule) {
        newRules = newRules.concat(rule)
      }
      return newRules
    }, [rule, required])

    if (!name) {
      return content
    }

    return (
      <Field defaultValue={defaultValue} name={name} message={message} rule={rules}>
        {content}
      </Field>
    )
  })

  const FormItReactField = React.memo(FormItReactLayoutField)

  return {
    FormItReactField,
    FieldContainerSyncUrl,
    FieldContainer
  }
}
