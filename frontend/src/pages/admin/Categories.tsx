import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { productService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Plus, FolderOpen } from 'lucide-react'
import type { Category } from '@/types'

export default function AdminCategories() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New category form
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Edit category
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete category
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/login')
      return
    }

    loadCategories()
  }, [isAuthenticated, user, navigate])

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await productService.getCategories()
      setCategories(data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      alert('Category name is required')
      return
    }

    setIsCreating(true)
    try {
      await productService.createCategory(newCategoryName.trim())
      alert('Category created successfully!')
      setNewCategoryName('')
      loadCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create category')
    } finally {
      setIsCreating(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) {
      alert('Category name is required')
      return
    }

    setIsUpdating(true)
    try {
      await productService.updateCategory(id, editName.trim())
      alert('Category updated successfully!')
      setEditingId(null)
      setEditName('')
      loadCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update category')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      await productService.deleteCategory(id)
      alert('Category deleted successfully!')
      loadCategories()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category. Make sure no products are using this category.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className="text-muted-foreground">
          Manage product categories
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add New Category Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCategory">Category Name</Label>
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Add Category'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading categories...</p>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No categories yet. Add your first category!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {editingId === category.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Category name"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(category.id)}
                            disabled={isUpdating}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {category.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(category.id, category.name)}
                              disabled={deletingId === category.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
