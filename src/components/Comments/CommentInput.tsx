import React, { KeyboardEvent } from 'react'
import { Input, Button } from 'antd'

interface CommentInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  loading?: boolean
}

const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "写下你的评论...",
  loading = false
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input.TextArea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoSize={{ minRows: 1, maxRows: 4 }}
        className="flex-1"
        style={{ fontFamily: 'HanTang, sans-serif' }}
      />
      <Button 
        type="primary"
        onClick={onSubmit}
        loading={loading}
      >
        发送
      </Button>
    </div>
  )
}

export default React.memo(CommentInput) 