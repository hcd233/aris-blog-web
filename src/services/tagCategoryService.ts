import request from '@/utils/request'

export const getTags = () => {
  return request.get('/v1/tags')
}

export const searchTags = (query: string) => {
  return request.get('/v1/tag', { params: { query } })
}

export const createTag = (data: { name: string; slug: string; description: string }) => {
  return request.post('/v1/tag', data)
}

export const getTag = (tagSlug: string) => {
  return request.get(`/v1/tag/${tagSlug}`)
}

export const updateTag = (tagSlug: string, data: { name: string; slug: string; description: string }) => {
  return request.put(`/v1/tag/${tagSlug}`, data)
}

export const deleteTag = (tagSlug: string) => {
  return request.delete(`/v1/tag/${tagSlug}`)
}

export const getRootCategory = (userName: string) => {
  return request.get(`/v1/user/${userName}/rootCategory`)
}

export const createCategory = (userName: string, data: { parentID?: number; name: string }) => {
  return request.post(`/v1/user/${userName}/category`, data)
}

export const getCategory = (userName: string, categoryID: string) => {
  return request.get(`/v1/user/${userName}/category/${categoryID}`)
}

export const updateCategory = (userName: string, categoryID: string, data: { name: string; parentID: number }) => {
  return request.put(`/v1/user/${userName}/category/${categoryID}`, data)
}

export const deleteCategory = (userName: string, categoryID: string) => {
  return request.delete(`/v1/user/${userName}/category/${categoryID}`)
}

export const listSubCategories = (userName: string, categoryID: string) => {
  return request.get(`/v1/user/${userName}/category/${categoryID}/subCategories`)
}

export const listSubArticles = (userName: string, categoryID: string) => {
  return request.get(`/v1/user/${userName}/category/${categoryID}/subArticles`)
} 