import { Col } from 'antd'
import { createFieldComponent } from '@form-it/react-factory'
import * as React from 'react'

const { FormItReactField } = createFieldComponent<React.ComponentProps<typeof Col>>(Col)

export default FormItReactField
