import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'
import { cn } from '../../utils/cn.js'

export default function Button({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}) {
  const isDisabled = Boolean(disabled || loading)
  const classes = cn(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    className,
  )

  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link className={classes} to={to} aria-disabled={isDisabled ? 'true' : undefined} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={isDisabled} type={type} {...props}>
      {content}
    </button>
  )
}
