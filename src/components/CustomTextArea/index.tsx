import * as React from 'react';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';
import { Theme } from '@mui/material/styles';

interface CustomTextareaProps {
  maxRows?: number;
  minRows?: number;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  width?: string | number;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  name?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
}

interface StyledTextareaProps {
  theme?: Theme;
  error?: boolean;
}

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledTextarea = styled(TextareaAutosize)<StyledTextareaProps>(
  ({ theme, error }) => `
    box-sizing: border-box;
    width: 320px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme?.palette?.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme?.palette?.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${error ? '#d32f2f' : theme?.palette?.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${theme?.palette?.mode === 'dark' ? grey[900] : grey[50]};

    &:hover {
      border-color: ${error ? '#d32f2f' : blue[400]};
    }

    &:focus {
      border-color: ${error ? '#d32f2f' : blue[400]};
      box-shadow: 0 0 0 3px ${error ? 'rgba(211, 47, 47, 0.2)' : theme?.palette?.mode === 'dark' ? blue[600] : blue[200]};
    }

    &:focus-visible {
      outline: 0;
    }
  `,
);

export const CustomTextarea = ({
  maxRows = 4,
  minRows,
  placeholder = "Type something...",
  defaultValue = "",
  value,
  onChange,
  onBlur,
  width = "100%",
  className = "",
  disabled = false,
  ariaLabel = "textarea",
  name,
  label,
  error = false,
  helperText,
}: CustomTextareaProps) => {
  return (
    <FormControl sx={{ mt: `1rem` }} error={error} fullWidth>
      {label && (
        <FormLabel 
          htmlFor={name}
          error={error}
          sx={{ mb: 1, color: 'black' }}
        >
          {label}
        </FormLabel>
      )}
      <StyledTextarea
        maxRows={maxRows}
        minRows={minRows}
        aria-label={ariaLabel}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        id={name}
        name={name}
        error={error}
        sx={{
          width: width,
          height: 'auto',
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        className={className}
      />
      {helperText && (
        <FormHelperText error={error}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

