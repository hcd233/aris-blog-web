import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Icons } from '@/components/icons'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  itemName?: string
  onConfirm: () => void
  loading?: boolean
  variant?: 'red' | 'purple' | 'orange'
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  loading = false,
  variant = 'red'
}: DeleteConfirmDialogProps) {
  const variants = {
    red: {
      gradient: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
      border: 'border-red-100 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-500',
      titleColor: 'text-red-600 dark:text-red-400',
      descColor: 'text-red-600 dark:text-red-400',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    purple: {
      gradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      border: 'border-purple-100 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-500',
      titleColor: 'text-purple-600 dark:text-purple-400',
      descColor: 'text-purple-600 dark:text-purple-400',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    },
    orange: {
      gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      border: 'border-orange-100 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/40',
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-600 dark:text-orange-400',
      descColor: 'text-orange-600 dark:text-orange-400',
      buttonColor: 'bg-orange-500 hover:bg-orange-600'
    }
  }

  const currentVariant = variants[variant]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-0 shadow-xl">
        <div className={`bg-gradient-to-br ${currentVariant.gradient} p-6 rounded-t-lg border-b ${currentVariant.border}`}>
          <DialogHeader>
            <div className={`w-12 h-12 ${currentVariant.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icons.alertCircle className={`w-6 h-6 ${currentVariant.iconColor}`} />
            </div>
            <DialogTitle className={`text-center text-xl font-bold ${currentVariant.titleColor}`}>
              {title}
            </DialogTitle>
            <DialogDescription className={`text-center ${currentVariant.descColor}`}>
              {itemName && (
                <>
                  你确定要删除 <span className="font-semibold text-foreground">"{itemName}"</span> 吗？
                  <br />
                </>
              )}
              {description || '此操作不可撤销，删除后数据将永久消失'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="px-6 pb-6 space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg pt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            取消
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`${currentVariant.buttonColor} text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            {loading ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Icons.trash className="w-4 h-4 mr-2" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 