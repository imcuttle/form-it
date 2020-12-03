import { Row } from 'antd'
import { createFormComponent } from '@form-it/react-factory'
import * as React from 'react'

const FormItAntdForm = createFormComponent<React.ComponentProps<typeof Row>>(Row)

export default FormItAntdForm
