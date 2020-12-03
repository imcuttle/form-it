import { Col } from 'antd'
import { createFieldComponent } from '@form-it/react-factory'
import * as React from 'react'

const { FormItReactField: FormItAntdField } = createFieldComponent<React.ComponentProps<typeof Col>>(Col)

export default FormItAntdField
