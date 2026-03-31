import React from 'react'
import Container from '../ui/Container.jsx'
import styles from './PageShell.module.css'

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <Container className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      <div className={styles.content}>{children}</div>
    </Container>
  )
}

