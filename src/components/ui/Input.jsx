import React from 'react'
import styles from './Input.module.css'
import { cn } from '../../utils/cn.js'

export default function Input({
  label,
  hint,
  error,
  id,
  className,
  inputClassName,
  ...props
}) {
  const inputId = id || props.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <label className={cn(styles.field, className)} htmlFor={inputId}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        id={inputId}
        className={cn(styles.input, error && styles.inputError, inputClassName)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error && (
        <span id={`${inputId}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </label>
  )
}

