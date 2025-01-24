'use client'

import { useEffect } from 'react'
import { Button } from '@mui/material'
import type { FC } from 'react'

interface ErrorComponentProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

const ErrorComponent: FC<ErrorComponentProps> = ({ error, reset }) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <pre className="text-sm text-gray-500 mb-4">
        {error.message}
      </pre>
      <Button
        variant="contained"
        onClick={reset}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  )
}

export default ErrorComponent
