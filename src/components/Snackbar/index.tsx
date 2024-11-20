import { Snackbar, Alert, AlertColor, SlideProps, Slide } from '@mui/material'

interface ConfigurableSnackbarProps {
  open: boolean
  message: string
  severity: AlertColor
  onClose: () => void
  position?: {
    vertical: 'top' 
    horizontal: 'center'
  }
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export const SnackbarMui = (props: ConfigurableSnackbarProps) => {
  
  return (
    <Snackbar open={props.open} autoHideDuration={6000} onClose={props.onClose} anchorOrigin={props.position} TransitionComponent={SlideTransition}>
      <Alert onClose={props.onClose} severity={props.severity} variant='filled' > 
        {props.message}
      </Alert>
    </Snackbar>
  )
}
