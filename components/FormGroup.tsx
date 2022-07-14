import { ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import FormInput, { type FormInputProps } from './FormInput'
import { type FormErrors } from '../services/validation/validateForm'


interface FormGroupProps {
  title: ReactNode
  inputs: (FormInputProps|undefined)[]
  errors: FormErrors
  values?: Record<string, string|undefined>
  loading?: Record<string, boolean|undefined>
  disabled: boolean
  onChange:  FormInputProps['onChange']
}

const FormGroup = ({ title, inputs, errors, values, loading, disabled, onChange }: FormGroupProps) => {
  const filtred = inputs.filter(props => !!props) as FormInputProps[]
  return (
    <Grid item xs={12} sm={6}>
      <Grid container spacing={2}>
        <Typography variant='subtitle1' component={Grid} item>{title}</Typography>
        {
          filtred.map(props =>
            <Grid item xs={12} key={props.name}>
              <FormInput
                required
                fullWidth
                label={props.label}
                id={props.id || (props.label ? props.label.toString().toLowerCase().split(' ').join('-') : undefined)}
                error={props.error || !!(errors || {})[(props.name || '') as keyof FormErrors]}
                defaultValue={props.defaultValue || (values || {})[(props.name || '')]}
                loading={props.loading || (loading || {})[(props.name || '')]}
                helperText={props.helperText || (errors || {})[(props.name || '') as keyof FormErrors]}
                onChange={onChange}
                disabled={disabled}
                {...props}
              />
            </Grid>
          )
        }
      </Grid>
    </Grid>
  )
}

export default FormGroup
export { type FormGroupProps }
