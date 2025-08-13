"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'
import { tagService } from '@/services/tag.service'
import type { Tag } from '@/types/api/tag.types'

interface TagMultiSelectProps {
  value?: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagMultiSelect({ value = [], onChange, placeholder = '选择标签' }: TagMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true)
    try {
      const res = await tagService.getTagList({ page: p, pageSize: 50 })
      setTags(prev => append ? [...prev, ...res.tags] : res.tags)
      setTotal(res.pageInfo.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && tags.length === 0) {
      load(1, false)
    }
  }, [open, tags.length, load])

  const hasMore = tags.length < total
  const selectedSet = useMemo(() => new Set(value), [value])

  const toggle = (slug: string) => {
    const next = new Set(value)
    if (next.has(slug)) next.delete(slug)
    else next.add(slug)
    onChange(Array.from(next))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(slug => (
          <Badge key={slug} variant="secondary" className="text-xs">
            #{slug}
            <button className="ml-1 opacity-70 hover:opacity-100" onClick={() => toggle(slug)}>
              <Icons.x className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <div className="text-xs text-gray-500">未选择标签</div>}
      </div>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Icons.tag className="w-4 h-4" />
            {placeholder}
            <Icons.chevronDown className="w-4 h-4 ml-1 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 p-0">
          <div className="px-3 py-2 text-xs text-gray-500">选择多个标签</div>
          <ScrollArea className="h-72">
            {tags.map(tag => (
              <DropdownMenuItem key={tag.tagID} onClick={() => toggle(tag.slug)}>
                <div className="flex items-center gap-2">
                  <Icons.tag className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <div className="text-sm">{tag.name}</div>
                    <div className="text-xs text-gray-500">#{tag.slug}</div>
                  </div>
                  {selectedSet.has(tag.slug) && <Icons.check className="w-4 h-4 text-green-600" />}
                </div>
              </DropdownMenuItem>
            ))}
            {hasMore && (
              <div className="p-2">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => load(page + 1, true)} disabled={loading}>
                  {loading ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 加载中</>) : '加载更多'}
                </Button>
              </div>
            )}
            {!loading && tags.length === 0 && (
              <div className="p-3 text-center text-sm text-gray-500">暂无标签</div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}