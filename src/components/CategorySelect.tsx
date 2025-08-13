"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/icons'
import { categoryService } from '@/services/category.service'
import type { Category } from '@/types/api/category.types'

interface CategorySelectProps {
  value?: number | null
  onChange: (categoryID: number) => void
  placeholder?: string
}

export default function CategorySelect({ value, onChange, placeholder = '选择分类' }: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true)
    try {
      const res = await categoryService.getCategoryList({ page: p, pageSize: 50 })
      setCategories(prev => append ? [...prev, ...res.categories] : res.categories)
      setTotal(res.pageInfo.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && categories.length === 0) {
      load(1, false)
    }
  }, [open, categories.length, load])

  const hasMore = categories.length < total
  const selected = useMemo(() => categories.find(c => c.categoryID === value) || null, [categories, value])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icons.folder className="w-4 h-4" />
          {selected ? selected.name : placeholder}
          <Icons.chevronDown className="w-4 h-4 ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-0">
        <div className="px-3 py-2 text-xs text-gray-500">选择一个分类</div>
        <ScrollArea className="h-64">
          {categories.map(cat => (
            <DropdownMenuItem key={cat.categoryID} onClick={() => { onChange(cat.categoryID); setOpen(false) }}>
              <div className="flex items-center gap-2">
                <Icons.folder className="w-4 h-4 text-purple-600" />
                <div className="flex-1">
                  <div className="text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-500">#{cat.categoryID}</div>
                </div>
                {value === cat.categoryID && <Icons.check className="w-4 h-4 text-green-600" />}
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
          {!loading && categories.length === 0 && (
            <div className="p-3 text-center text-sm text-gray-500">暂无分类</div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}