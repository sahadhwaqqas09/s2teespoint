import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCategories, saveLocalCategory, deleteLocalCategory } from '../../lib/data'
import toast from 'react-hot-toast'
import { Plus, Trash2, FolderOpen, Upload, X, Tag, Edit3, Check } from 'lucide-react'

const PRESET_TYPES = ['Round Neck', 'Hoodies', 'Oversized', 'Polo / Collar', 'Full Sleeve', 'Sweatshirt', 'V-Neck']

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    types: ['Round Neck', 'Hoodies', 'Oversized'],
  })
  const [customTypeInput, setCustomTypeInput] = useState('')
  const [editingCategoryTypes, setEditingCategoryTypes] = useState(null)
  const [editTypesList, setEditTypesList] = useState([])
  const [editCustomInput, setEditCustomInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data || [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `cat-${Date.now()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (error) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, image_url: reader.result }))
          toast.success('Category photo loaded (preview)')
        }
        reader.readAsDataURL(file)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        setFormData((prev) => ({ ...prev, image_url: publicUrl }))
        toast.success('Category photo uploaded to Supabase Storage!')
      }
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image_url: reader.result }))
      }
      reader.readAsDataURL(file)
      toast.success('Category photo loaded')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setSubmitting(true)
    const slug = formData.name.trim().toLowerCase().replace(/ /g, '_')
    const finalTypes = formData.types && formData.types.length > 0 ? formData.types : ['Round Neck', 'Hoodies', 'Oversized']

    const newCategory = {
      id: 'cat-' + Date.now(),
      name: formData.name.trim(),
      slug,
      image_url: formData.image_url.trim() || null,
      types: finalTypes,
      created_at: new Date().toISOString(),
    }

    try {
      let res = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            slug: newCategory.slug,
            image_url: newCategory.image_url,
            types: newCategory.types,
          },
        ])
        .select()
        .single()

      if (res.error) {
        res = await supabase
          .from('categories')
          .insert([
            {
              name: newCategory.name,
              slug: newCategory.slug,
              image_url: newCategory.image_url,
            },
          ])
          .select()
          .single()
      }

      if (res.error) {
        saveLocalCategory(newCategory)
        setCategories((prev) => [newCategory, ...prev])
        toast.success(`Category "${newCategory.name}" added with ${finalTypes.length} T-shirt types!`)
      } else {
        const saved = { ...(res.data || newCategory), types: finalTypes }
        saveLocalCategory(saved)
        toast.success(`Category "${newCategory.name}" added with ${finalTypes.length} T-shirt types!`)
        await fetchCategories()
      }
    } catch {
      saveLocalCategory(newCategory)
      setCategories((prev) => [newCategory, ...prev])
      toast.success(`Category "${newCategory.name}" added!`)
    }

    setFormData({ name: '', image_url: '', types: ['Round Neck', 'Hoodies', 'Oversized'] })
    setCustomTypeInput('')
    setSubmitting(false)
  }

  const handleSaveEditedTypes = async () => {
    if (!editingCategoryTypes) return
    const updated = {
      ...editingCategoryTypes,
      types: editTypesList.length > 0 ? editTypesList : ['Round Neck', 'Hoodies', 'Oversized'],
    }

    try {
      await supabase
        .from('categories')
        .update({ types: updated.types })
        .eq('id', updated.id)
    } catch (_) {}

    saveLocalCategory(updated)
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    toast.success(`T-Shirt types updated for "${updated.name}"!`)
    setEditingCategoryTypes(null)
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    deleteLocalCategory(id)
    try {
      await supabase.from('categories').delete().eq('id', id)
    } catch {
      // ignore
    }

    toast.success(`"${name}" deleted`)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3EC', color: '#261710', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#261710', marginBottom: '0.25rem', fontFamily: 'Cinzel, serif' }}>
            Manage Categories
          </h1>
          <p style={{ color: '#6F584A', fontSize: '0.9rem' }}>
            Add and manage product categories for your store.
          </p>
        </div>

        {/* Add Category Form */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #DECFC0',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(38, 23, 16, 0.04)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#261710', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Cinzel, serif' }}>
            <Plus size={18} color="#784E38" />
            Add New Category
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              {/* Category Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#5C4537', fontWeight: '600' }}>
                  Category Name <span style={{ color: '#784E38' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. T-Shirts"
                  required
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px solid #D5C2AE',
                    padding: '0.6rem 0.85rem',
                    color: '#261710',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#784E38')}
                  onBlur={(e) => (e.target.style.borderColor = '#D5C2AE')}
                />
              </div>

              {/* Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#5C4537', fontWeight: '600' }}>
                  Image URL <span style={{ color: '#8A7465' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Paste an image URL or leave blank"
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px solid #D5C2AE',
                    padding: '0.6rem 0.85rem',
                    color: '#261710',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#784E38')}
                  onBlur={(e) => (e.target.style.borderColor = '#D5C2AE')}
                />
              </div>
            </div>

            {/* Photo upload option */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#5C4537', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                Category Image (Upload or URL)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px dashed #784E38',
                    color: '#784E38',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: '#8A7465' }}>or use image link above</span>
              </div>
              {formData.image_url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1px solid #D5C2AE' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#20522B' }}>Image ready</span>
                </div>
              )}
            </div>

            {/* T-Shirt Types selector */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#FAF6F0', border: '1px solid #DECFC0', padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#261710', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={15} color="#784E38" />
                  T-Shirt Types for this Category (e.g. Hoodies, Round Neck, Oversized)
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6F584A', margin: 0 }}>
                  These will appear as a category menu on the shop where customers choose their preferred style.
                </p>
              </div>

              {/* Active Types Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {formData.types.map((type) => (
                  <span
                    key={type}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D5C2AE',
                      color: '#261710',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, types: prev.types.filter((t) => t !== type) }))}
                      style={{ background: 'none', border: 'none', color: '#8A7465', cursor: 'pointer', padding: 0, display: 'flex' }}
                      title="Remove type"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                {formData.types.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#8A7465', fontStyle: 'italic' }}>
                    No types selected. Click presets below or add a custom type.
                  </span>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6F584A', marginRight: '0.25rem', fontWeight: '600' }}>Quick Add:</span>
                {PRESET_TYPES.map((preset) => {
                  const alreadyAdded = formData.types.includes(preset)
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (alreadyAdded) {
                          setFormData((prev) => ({ ...prev, types: prev.types.filter((t) => t !== preset) }))
                        } else {
                          setFormData((prev) => ({ ...prev, types: [...prev.types, preset] }))
                        }
                      }}
                      style={{
                        backgroundColor: alreadyAdded ? '#3D261C' : '#FFFFFF',
                        color: alreadyAdded ? '#F7F3EC' : '#5C4537',
                        border: `1px solid ${alreadyAdded ? '#3D261C' : '#D5C2AE'}`,
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: alreadyAdded ? '700' : '500',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {alreadyAdded ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  )
                })}
              </div>

              {/* Custom Type Input */}
              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
                <input
                  type="text"
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (customTypeInput.trim() && !formData.types.includes(customTypeInput.trim())) {
                        setFormData((prev) => ({ ...prev, types: [...prev.types, customTypeInput.trim()] }))
                        setCustomTypeInput('')
                      }
                    }
                  }}
                  placeholder="Type custom style & press Enter..."
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D5C2AE',
                    padding: '0.4rem 0.7rem',
                    color: '#261710',
                    fontSize: '0.8rem',
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customTypeInput.trim() && !formData.types.includes(customTypeInput.trim())) {
                      setFormData((prev) => ({ ...prev, types: [...prev.types, customTypeInput.trim()] }))
                      setCustomTypeInput('')
                    }
                  }}
                  style={{
                    backgroundColor: '#3D261C',
                    border: '1px solid #3D261C',
                    padding: '0.4rem 0.75rem',
                    color: '#F7F3EC',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#8A7465' : '#3D261C',
                color: '#F7F3EC',
                border: 'none',
                padding: '0.65rem 1.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#543729' }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#3D261C' }}
            >
              <Plus size={16} />
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #DECFC0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(38, 23, 16, 0.04)',
          }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #DECFC0', background: '#FAF6F0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#261710', margin: 0, fontFamily: 'Cinzel, serif' }}>
              All Categories{' '}
              <span style={{ color: '#784E38', fontWeight: '600', fontSize: '0.85rem' }}>
                ({categories.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem', color: '#8A7465' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid #DECFC0',
                  borderTopColor: '#784E38',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Loading categories...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: '#8A7465' }}>
              <FolderOpen size={48} color="#DECFC0" />
              <p style={{ fontSize: '0.95rem', margin: 0, color: '#6F584A' }}>
                No categories yet. Add your first one above.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF6F0' }}>
                    {['Image', 'Name', 'T-Shirt Types (Menu)', 'Slug', 'Date Added', 'Actions'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#784E38',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid #DECFC0',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => {
                    const categoryTypes = (category.types && category.types.length > 0)
                      ? category.types
                      : ['Round Neck', 'Hoodies', 'Oversized']

                    return (
                      <tr
                        key={category.id}
                        style={{
                          borderBottom: index < categories.length - 1 ? '1px solid #E8DED1' : 'none',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF6F0')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Image */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                              style={{
                                width: '44px',
                                height: '44px',
                                objectFit: 'cover',
                                border: '1px solid #DECFC0',
                                display: 'block',
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              border: '1px solid #DECFC0',
                              backgroundColor: '#FAF6F0',
                              display: category.image_url ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FolderOpen size={18} color="#784E38" />
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#261710', fontSize: '0.9rem' }}>
                          {category.name}
                        </td>

                        {/* T-Shirt Types (Menu) */}
                        <td style={{ padding: '0.85rem 1.25rem', minWidth: '220px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                            {categoryTypes.map((t) => (
                              <span
                                key={t}
                                style={{
                                  fontSize: '0.72rem',
                                  backgroundColor: '#FAF6F0',
                                  border: '1px solid #D5C2AE',
                                  color: '#3D261C',
                                  padding: '0.15rem 0.45rem',
                                  fontWeight: '600',
                                }}
                              >
                                {t}
                              </span>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryTypes(category)
                                setEditTypesList([...categoryTypes])
                              }}
                              title="Edit T-Shirt Types for this category"
                              style={{
                                background: 'transparent',
                                border: '1px dashed #784E38',
                                color: '#784E38',
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                fontWeight: '600',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF6F0' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                              <Edit3 size={10} />
                              Edit Types
                            </button>
                          </div>
                        </td>

                        {/* Slug */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <code
                            style={{
                              backgroundColor: '#FAF6F0',
                              border: '1px solid #DECFC0',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.78rem',
                              color: '#784E38',
                              fontFamily: 'monospace',
                              fontWeight: '600',
                            }}
                          >
                            {category.slug}
                          </code>
                        </td>

                        {/* Date Added */}
                        <td style={{ padding: '0.85rem 1.25rem', color: '#8A7465', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(category.created_at)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            title="Delete category"
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(192, 57, 43, 0.4)',
                              padding: '0.45rem 0.7rem',
                              color: '#c0392b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FDF0ED'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Edit Types Modal ── */}
        {editingCategoryTypes && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(38, 23, 16, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DECFC0',
                padding: '1.5rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 10px 40px rgba(38, 23, 16, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#261710', fontWeight: '700', margin: 0, fontFamily: 'Cinzel, serif' }}>
                  Edit T-Shirt Types for &ldquo;{editingCategoryTypes.name}&rdquo;
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCategoryTypes(null)}
                  style={{ background: 'none', border: 'none', color: '#8A7465', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#6F584A', marginBottom: '1rem', lineHeight: '1.5' }}>
                Add or remove types (Hoodies, Round Neck, Oversized, etc.). These appear as the style selection menu inside this category on the shop.
              </p>

              {/* Active List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {editTypesList.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#FAF6F0',
                      border: '1px solid #D5C2AE',
                      color: '#261710',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => setEditTypesList((prev) => prev.filter((item) => item !== t))}
                      style={{ background: 'none', border: 'none', color: '#8A7465', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Preset buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {PRESET_TYPES.map((preset) => {
                  const has = editTypesList.includes(preset)
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (has) {
                          setEditTypesList((prev) => prev.filter((p) => p !== preset))
                        } else {
                          setEditTypesList((prev) => [...prev, preset])
                        }
                      }}
                      style={{
                        backgroundColor: has ? '#3D261C' : '#FAF6F0',
                        color: has ? '#F7F3EC' : '#5C4537',
                        border: `1px solid ${has ? '#3D261C' : '#D5C2AE'}`,
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: has ? '700' : '500',
                      }}
                    >
                      {has ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  )
                })}
              </div>

              {/* Custom input */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={editCustomInput}
                  onChange={(e) => setEditCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (editCustomInput.trim() && !editTypesList.includes(editCustomInput.trim())) {
                        setEditTypesList((prev) => [...prev, editCustomInput.trim()])
                        setEditCustomInput('')
                      }
                    }
                  }}
                  placeholder="Custom type..."
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px solid #D5C2AE',
                    padding: '0.4rem 0.6rem',
                    color: '#261710',
                    fontSize: '0.8rem',
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (editCustomInput.trim() && !editTypesList.includes(editCustomInput.trim())) {
                      setEditTypesList((prev) => [...prev, editCustomInput.trim()])
                      setEditCustomInput('')
                    }
                  }}
                  style={{
                    backgroundColor: '#3D261C',
                    border: '1px solid #3D261C',
                    padding: '0.4rem 0.75rem',
                    color: '#F7F3EC',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + Add
                </button>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategoryTypes(null)}
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px solid #D5C2AE',
                    padding: '0.5rem 1rem',
                    color: '#5C4537',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedTypes}
                  style={{
                    backgroundColor: '#3D261C',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    color: '#F7F3EC',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Check size={15} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
