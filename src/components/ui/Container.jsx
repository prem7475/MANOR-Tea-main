import React from 'react'
import styles from './Container.module.css'
import { cn } from '../../utils/cn.js'

export default function Container({ as = 'div', className, children, ...props }) {
  return React.createElement(as, { className: cn(styles.container, className), ...props }, children)
}
