import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, title = 'Hata', onRetry }) => {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Tekrar Dene
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;