import React from 'react'
import styles from './Card.module.css'
import { cn } from '../../utils/cn.js'

export default function Card({ as = 'div', className, children, ...props }) {
  return React.createElement(as, { className: cn(styles.card, className), ...props }, children)
}
