import React from 'react'

import styles from './AdminTable.module.css'
import EmptyState from '../../components/ui/EmptyState.jsx'

export default function AdminTable({
  columns,
  rows,
  getRowKey,
  emptyLabel = 'No items yet.',
  emptyText,
  emptyAction,
}) {
  if (!Array.isArray(columns) || columns.length === 0) return null
  const isEmpty = !rows.length

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }} className={c.align === 'right' ? styles.right : ''}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isEmpty ? (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? styles.right : ''}>
                    {typeof c.render === 'function' ? c.render(row) : row?.[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.emptyCell} colSpan={columns.length}>
                {typeof emptyLabel === 'string' ? (
                  <EmptyState title={emptyLabel} text={emptyText} action={emptyAction} className={styles.emptyCard} />
                ) : (
                  emptyLabel
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
