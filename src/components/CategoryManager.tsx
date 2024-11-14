import React, { useEffect, useState, useCallback } from 'react'
import { Button, Input, List, message, Modal } from 'antd'
import { getRootCategory, createCategory, updateCategory, deleteCategory } from '@/services/tagCategoryService'
import { FolderOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAppSelector } from '@/hooks/store'

interface Category {
  id: number
  name: string
  parentID?: number
}

interface CategoryManagerProps {
  userName?: string
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ userName }) => {
  const { userInfo } = useAppSelector((state) => state.user)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  const isCreatorOrAdmin = userInfo?.permission === 'creator' || userInfo?.permission === 'admin'

  const loadCategories = useCallback(async () => {
    if (!userName || !isCreatorOrAdmin) return
    
    setLoading(true)
    try {
      const response = await getRootCategory(userName)
      setCategories(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      message.error('获取分类列表失败')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [userName, isCreatorOrAdmin])

  useEffect(() => {
    if (userName && isCreatorOrAdmin) {
      loadCategories()
    }
  }, [userName, isCreatorOrAdmin, loadCategories])

  const handleCreateOrUpdateCategory = async (category: Partial<Category>) => {
    if (!userName || !isCreatorOrAdmin) return
    
    try {
      if (currentCategory) {
        await updateCategory(userName, String(currentCategory.id), {
          name: category.name || '',
          parentID: category.parentID || 0
        })
        message.success('分类更新成功')
      } else {
        await createCategory(userName, {
          name: category.name || '',
          parentID: category.parentID
        })
        message.success('分类创建成功')
      }
      loadCategories()
      setIsModalVisible(false)
      setCurrentCategory(null)
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!userName || !isCreatorOrAdmin) return
    
    try {
      await deleteCategory(userName, String(categoryId))
      message.success('分类删除成功')
      loadCategories()
    } catch (error) {
      message.error('删除失败')
    }
  }

  if (!userName) {
    return <div>请先登录</div>
  }

  if (!isCreatorOrAdmin) {
    return (
      <List
        className="category-list"
        dataSource={[]}
        locale={{ emptyText: '暂无分类' }}
        renderItem={() => null}
      />
    )
  }

  return (
    <div>
      <List
        className="category-list"
        loading={loading}
        dataSource={categories}
        locale={{ emptyText: '暂无分类' }}
        renderItem={(category: Category) => (
          <List.Item
            key={category.id}
            className="hover:bg-gray-50 rounded cursor-pointer px-2 border-0"
            actions={[
              <Button 
                key="edit"
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => { 
                  e.stopPropagation()
                  setCurrentCategory(category)
                  setIsModalVisible(true) 
                }}
              />,
              <Button 
                key="delete"
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category.id)
                }}
              />
            ]}
          >
            <div className="flex items-center">
              <FolderOutlined className="mr-2 text-gray-400" />
              <span className="text-sm">{category.name}</span>
            </div>
          </List.Item>
        )}
      />
      <Modal
        title={currentCategory ? '编辑分类' : '新建分类'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setCurrentCategory(null)
        }}
        onOk={() => handleCreateOrUpdateCategory(currentCategory || {})}
      >
        <Input
          className="mb-4"
          placeholder="分类名称"
          value={currentCategory?.name || ''}
          onChange={e => setCurrentCategory(prev => ({
            ...prev,
            name: e.target.value,
            id: prev?.id || 0
          }))}
        />
        <Input
          placeholder="父分类ID（可选）"
          type="number"
          value={currentCategory?.parentID || ''}
          onChange={e => setCurrentCategory(prev => ({
            ...prev,
            parentID: Number(e.target.value),
            id: prev?.id || 0,
            name: prev?.name || ''
          }))}
        />
      </Modal>
    </div>
  )
}

export default CategoryManager 