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
      // 1. Try inserting with types column
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

      // 2. If table doesn't have 'types' column, fallback without it
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

    saveLocalCategory(updated)
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))

    try {
      await supabase.from('categories').update({ types: updated.types }).eq('id', updated.id)
    } catch (_) {}

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#f5f5f5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#D4AF37', marginBottom: '0.25rem' }}>
            Manage Categories
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            Add and manage product categories for your store.
          </p>
        </div>

        {/* Add Category Form */}
        <div
          style={{
            backgroundColor: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#D4AF37', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
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
                <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '500' }}>
                  Category Name <span style={{ color: '#D4AF37' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. T-Shirts"
                  required
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.85rem',
                    color: '#f5f5f5',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D4AF37')}
                  onBlur={(e) => (e.target.style.borderColor = '#333')}
                />
              </div>

              {/* Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: '500' }}>
                  Image URL <span style={{ color: '#555' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Paste an image URL or leave blank"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    padding: '0.6rem 0.85rem',
                    color: '#f5f5f5',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D4AF37')}
                  onBlur={(e) => (e.target.style.borderColor = '#333')}
                />
              </div>
            </div>

            {/* T-Shirt Types in this Category */}
            <div
              style={{
                marginTop: '1.25rem',
                borderTop: '1px solid #222',
                paddingTop: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={15} />
                  T-Shirt Types for this Category (e.g. Hoodies, Round Neck, Oversized)
                </label>
                <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>
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
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#D4AF37',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    <span>{type}</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, types: prev.types.filter((t) => t !== type) }))}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, display: 'flex' }}
                      title="Remove type"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                {formData.types.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                    No types selected. Click presets below or add a custom type.
                  </span>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#777', marginRight: '0.25rem' }}>Quick Add:</span>
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
                        backgroundColor: alreadyAdded ? '#D4AF37' : '#1a1a1a',
                        color: alreadyAdded ? '#111' : '#ccc',
                        border: `1px solid ${alreadyAdded ? '#D4AF37' : '#333'}`,
                        borderRadius: '6px',
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: alreadyAdded ? '700' : '400',
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
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.7rem',
                    color: '#f5f5f5',
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
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    color: '#D4AF37',
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
                backgroundColor: submitting ? '#9a7d20' : '#D4AF37',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.65rem 1.5rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#c9a227' }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#D4AF37' }}
            >
              <Plus size={16} />
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div
          style={{
            backgroundColor: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e1e1e' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#D4AF37', margin: 0 }}>
              All Categories{' '}
              <span style={{ color: '#555', fontWeight: '400', fontSize: '0.85rem' }}>
                ({categories.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', gap: '0.75rem', color: '#888' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid #2a2a2a',
                  borderTopColor: '#D4AF37',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Loading categories...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: '#555' }}>
              <FolderOpen size={48} color="#333" />
              <p style={{ fontSize: '0.95rem', margin: 0 }}>
                No categories yet. Add your first one above.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#161616' }}>
                    {['Image', 'Name', 'T-Shirt Types (Menu)', 'Slug', 'Date Added', 'Actions'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '0.75rem 1.25rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#888',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid #1e1e1e',
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
                          borderBottom: index < categories.length - 1 ? '1px solid #1a1a1a' : 'none',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161616')}
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
                                borderRadius: '0.4rem',
                                border: '1px solid #2a2a2a',
                                display: 'block',
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '0.4rem',
                              border: '1px solid #2a2a2a',
                              backgroundColor: '#1a1a1a',
                              display: category.image_url ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <FolderOpen size={18} color="#444" />
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#f0f0f0', fontSize: '0.9rem' }}>
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
                                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                  border: '1px solid rgba(212, 175, 55, 0.3)',
                                  color: '#D4AF37',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  fontWeight: '500',
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
                                border: '1px dashed #555',
                                color: '#aaa',
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.color = '#D4AF37' }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#aaa' }}
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
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #2a2a2a',
                              borderRadius: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.78rem',
                              color: '#D4AF37',
                              fontFamily: 'monospace',
                            }}
                          >
                            {category.slug}
                          </code>
                        </td>

                        {/* Date Added */}
                        <td style={{ padding: '0.85rem 1.25rem', color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {formatDate(category.created_at)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            title="Delete category"
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #3a1a1a',
                              borderRadius: '0.4rem',
                              padding: '0.45rem 0.7rem',
                              color: '#e05a5a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2a0e0e'
                              e.currentTarget.style.borderColor = '#e05a5a'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.borderColor = '#3a1a1a'
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
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#121212',
                border: '1px solid #D4AF37',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', fontWeight: '700', margin: 0 }}>
                  Edit T-Shirt Types for &ldquo;{editingCategoryTypes.name}&rdquo;
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCategoryTypes(null)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' }}>
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
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#D4AF37',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => setEditTypesList((prev) => prev.filter((item) => item !== t))}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, display: 'flex' }}
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
                        backgroundColor: has ? '#D4AF37' : '#1c1c1c',
                        color: has ? '#111' : '#ccc',
                        border: `1px solid ${has ? '#D4AF37' : '#333'}`,
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: has ? '700' : '400',
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
                    backgroundColor: '#1c1c1c',
                    border: '1px solid #333',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.6rem',
                    color: '#fff',
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
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    color: '#D4AF37',
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
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '0.4rem',
                    padding: '0.5rem 1rem',
                    color: '#aaa',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedTypes}
                  style={{
                    backgroundColor: '#D4AF37',
                    border: 'none',
                    borderRadius: '0.4rem',
                    padding: '0.5rem 1.25rem',
                    color: '#111',
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
