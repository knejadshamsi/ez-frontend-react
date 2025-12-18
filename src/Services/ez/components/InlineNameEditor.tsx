import { useState, type ReactElement } from 'react'
import { Button, Input, message } from 'antd'
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import styles from './InlineNameEditor.module.less'

interface InlineNameEditorProps {
  value: string
  onSave: (newName: string) => void
  maxLength?: number
  placeholder?: string
  autoGenerateName?: () => string
  className?: string
  disabled?: boolean
}

export const InlineNameEditor = ({
  value,
  onSave,
  maxLength = 50,
  placeholder = 'Enter name',
  autoGenerateName,
  className,
  disabled = false
}: InlineNameEditorProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = () => {
    const trimmed = editValue.trim()

    // Validation
    if (!trimmed) {
      if (autoGenerateName) {
        const autoName = autoGenerateName()
        onSave(autoName)
      } else {
        messageApi.error('Name cannot be empty')
        return
      }
    } else {
      onSave(trimmed)
    }

    setIsEditing(false)
    setEditValue('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {contextHolder}
      {isEditing ? (
        // EDIT MODE
        <>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            autoFocus
            className={styles.input}
          />
          <Button
            type="text"
            size="small"
            icon={<SaveOutlined />}
            onClick={handleSave}
            className={styles.button}
            title="Save"
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            className={styles.button}
            title="Cancel"
          />
        </>
      ) : (
        // DISPLAY MODE
        <>
          <div className={styles.nameText}>
            {value}
          </div>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={handleStartEdit}
            disabled={disabled}
            className={`${styles.button} ${styles.editButton}`}
            title="Edit name"
          />
        </>
      )}
    </div>
  )
}
