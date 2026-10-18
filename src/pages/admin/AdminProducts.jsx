import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getCategories, getLocalProducts, saveLocalProduct, deleteLocalProduct } from '../../lib/data'
import toast from 'react-hot-toast'
import { Plus, Trash2, Package } from 'lucide-react'

const ALL_SIZES = [
  // Letter sizes
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL',
  // Number sizes (kids / custom)
  '2', '4', '6', '8', '10', '12', '14', '16', '18', '20',
]


const initialForm = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image_url: '',
  sizes: [],
  tshirt_type: '',
}

export default function AdminProducts() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [customTypeInput, setCustomTypeInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)

  /* ─── Fetch data ─────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  async function fetchCategories() {
    try {
      const data = await getCategories()
      setCategories(data || [])
    } catch {
      setCategories([])
    }
  }

  async function fetchProducts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setProducts(data)
      } else {
        setProducts(getLocalProducts())
      }
    } catch {
      setProducts(getLocalProducts())
    } finally {
      setLoading(false)
    }
  }

  /* ─── Form handlers ──────────────────────────────────────────────────── */
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSizeToggle(size) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (error) {
        console.warn('Supabase storage not connected yet, using local data URL:', error.message)
        const reader = new FileReader()
        reader.onloadend = () => {
          setForm((prev) => ({ ...prev, image_url: reader.result }))
          toast.success('Image loaded for preview')
        }
        reader.readAsDataURL(file)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        setForm((prev) => ({ ...prev, image_url: publicUrl }))
        toast.success('Image uploaded to Supabase Storage!')
      }
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image_url: reader.result }))
      }
      reader.readAsDataURL(file)
      toast.success('Image loaded for preview')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id) { toast.error('Please select a category'); return }
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSaving(true)
    const newProd = {
      id: 'prod-' + Date.now(),
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      image_url: form.image_url.trim() || null,
      sizes: form.sizes,
      tshirt_type: form.tshirt_type || null,
      created_at: new Date().toISOString(),
      categories: { name: categories.find((c) => c.id === form.category_id)?.name || 'Custom' },
    }

    try {
      const { data, error } = await supabase.from('products').insert([
        {
          category_id: form.category_id,
          name: newProd.name,
          description: newProd.description,
          price: newProd.price,
          image_url: newProd.image_url,
          sizes: newProd.sizes,
          tshirt_type: newProd.tshirt_type,
        },
      ]).select().single()

      if (error) {
        saveLocalProduct(newProd)
        setProducts((prev) => [newProd, ...prev])
        toast.success(`Product "${newProd.name}" added!`)
      } else {
        saveLocalProduct(data || newProd)
        toast.success(`Product "${newProd.name}" added to Supabase!`)
        await fetchProducts()
      }
    } catch {
      saveLocalProduct(newProd)
      setProducts((prev) => [newProd, ...prev])
      toast.success(`Product "${newProd.name}" added!`)
    }

    setForm(initialForm)
    setShowForm(false)
    setSaving(false)
  }

  /* ─── Delete handlers ────────────────────────────────────────────────── */
  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    deleteLocalProduct(deleteTarget.id)
    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id)
    } catch {
      // ignore
    }

    toast.success(`"${deleteTarget.name}" deleted`)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
  }

  /* ─── Helpers ────────────────────────────────────────────────────────── */
  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <Package size={26} color="#FFFFFF" />
          <h1 style={styles.title}>Manage Products</h1>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* ── Add Product Form ─────────────────────────────────────────────── */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>New Product</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Category */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Category *</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '6px' }}>
                  No categories exist yet. Please go to the <strong>Categories</strong> tab to create your categories first.
                </p>
              )}
            </div>

            {/* Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Classic Black Tee"
                style={styles.input}
                required
              />
            </div>

            {/* Description */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short product description (optional)"
                rows={3}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            {/* Price */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Price (Rs.) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 499"
                min="1"
                step="0.01"
                style={styles.input}
                required
              />
            </div>

            {/* Image (Upload or URL) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Product Photo</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label
                    style={{
                      backgroundColor: '#1E1E1E',
                      border: '1px dashed #FFFFFF',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ color: '#777', fontSize: '0.75rem' }}>or enter image link below</span>
                </div>
                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg (or use upload above)"
                  style={styles.input}
                />
                {form.image_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <img
                      src={form.image_url}
                      alt="Preview"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #333' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Photo selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Available Sizes</label>
              <p style={styles.sizeHint}>
                The sizes you select here will appear as options on the customer product page.
              </p>
              <div style={styles.sizeGrid}>
                {ALL_SIZES.map((size) => {
                  const checked = form.sizes.includes(size)
                  return (
                    <label key={size} style={styles.sizeLabel(checked)}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleSizeToggle(size)}
                        style={{ display: 'none' }}
                      />
                      {size}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* T-Shirt Type — always visible; preset chips from category + free-text fallback */}
            {(() => {
              const selectedCat = categories.find((c) => c.id === form.category_id)
              const catTypes = Array.isArray(selectedCat?.types) && selectedCat.types.length > 0
                ? selectedCat.types
                : ['Round Neck', 'Hoodies', 'Oversized', 'Polo / Collar', 'Full Sleeve', 'V-Neck', 'Sweatshirt']

              return (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    T-Shirt Type
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '10px' }}>
                    Pick the style for this product. Customers will use this to filter products inside the category.
                  </p>

                  {/* Preset chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {catTypes.map((type) => {
                      const isActive = form.tshirt_type === type
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              tshirt_type: isActive ? '' : type,
                            }))
                          }
                          style={{
                            padding: '6px 14px',
                            borderRadius: '4px',
                            border: `1px solid ${isActive ? '#FFFFFF' : '#333'}`,
                            backgroundColor: isActive ? '#FFFFFF' : '#1a1a1a',
                            color: isActive ? '#111' : '#aaa',
                            fontSize: '0.82rem',
                            fontWeight: isActive ? '700' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {type}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom type text input */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Or type a custom style (e.g. Crop Top)…"
                      value={!catTypes.includes(form.tshirt_type) ? form.tshirt_type : ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, tshirt_type: e.target.value }))
                      }
                      style={{
                        ...styles.input,
                        flex: 1,
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                      }}
                    />
                    {form.tshirt_type && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, tshirt_type: '' }))}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #333',
                          backgroundColor: '#1a1a1a',
                          color: '#aaa',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {form.tshirt_type && (
                    <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '6px' }}>
                      Type set to: <strong>{form.tshirt_type}</strong>
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Submit */}
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      {/* ── Products Table ───────────────────────────────────────────────── */}
      <div style={styles.tableCard}>
        <h2 style={styles.formTitle}>
          All Products{' '}
          {!loading && (
            <span style={styles.countBadge}>{products.length}</span>
          )}
        </h2>

        {loading ? (
          <div style={styles.emptyState}>
            <Package size={40} color="#FFFFFF" />
            <p>Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={40} color="#555" />
            <p style={{ color: '#888' }}>No products yet. Add your first product above.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Image', 'Name', 'Category', 'Type', 'Sizes', 'Price', 'Date', ''].map(
                    (col) => (
                      <th key={col} style={styles.th}>
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={styles.tr}>
                    {/* Image */}
                    <td style={styles.td}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={styles.productImg}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div style={styles.imgPlaceholder}>
                          <Package size={20} color="#555" />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td style={styles.td}>
                      <span style={styles.productName}>{product.name}</span>
                      {product.description && (
                        <span style={styles.productDesc}>
                          {product.description.length > 60
                            ? product.description.slice(0, 60) + '…'
                            : product.description}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>
                        {product.categories?.name || '—'}
                      </span>
                    </td>

                    {/* T-Shirt Type */}
                    <td style={styles.td}>
                      {product.tshirt_type ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: 'rgba(255, 255, 255,0.12)',
                            border: '1px solid rgba(255, 255, 255,0.3)',
                            color: '#FFFFFF',
                          }}
                        >
                          {product.tshirt_type}
                        </span>
                      ) : (
                        <span style={{ color: '#555', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>

                    {/* Sizes */}
                    <td style={styles.td}>
                      {product.sizes && product.sizes.length > 0 ? (
                        <div style={styles.sizesWrap}>
                          {product.sizes.map((s) => (
                            <span key={s} style={styles.sizeChip}>
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>

                    {/* Price */}
                    <td style={styles.td}>
                      <span style={styles.priceText}>Rs. {Number(product.price).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Date */}
                    <td style={styles.td}>
                      <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                        {formatDate(product.created_at)}
                      </span>
                    </td>

                    {/* Delete */}
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => setDeleteTarget(product)}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────── */}
      {deleteTarget && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={styles.dialogTitle}>Delete Product?</h3>
            <p style={styles.dialogBody}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#FFFFFF' }}>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </p>
            <div style={styles.dialogActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                style={styles.confirmDeleteBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#f0f0f0',
    padding: '2rem 1.5rem',
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '0.04em',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#FFFFFF',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.2rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  formCard: {
    backgroundColor: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.8rem',
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#FFFFFF',
    marginTop: 0,
    marginBottom: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.2rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.82rem',
    color: '#bbb',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#f0f0f0',
    padding: '0.65rem 0.9rem',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', sans-serif",
  },
  select: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#f0f0f0',
    padding: '0.65rem 0.9rem',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  sizeHint: {
    fontSize: '0.78rem',
    color: '#888',
    margin: '0 0 0.5rem 0',
    fontStyle: 'italic',
  },
  sizeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  sizeLabel: (checked) => ({
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: `2px solid ${checked ? '#FFFFFF' : '#333'}`,
    backgroundColor: checked ? '#FFFFFF' : 'transparent',
    color: checked ? '#0a0a0a' : '#aaa',
    transition: 'all 0.15s',
    userSelect: 'none',
  }),
  saveBtn: {
    gridColumn: '1 / -1',
    backgroundColor: '#FFFFFF',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  tableCard: {
    backgroundColor: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.8rem',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    color: '#0a0a0a',
    borderRadius: '12px',
    padding: '0.1rem 0.55rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    marginLeft: '0.4rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #2a2a2a',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #1e1e1e',
  },
  td: {
    padding: '0.85rem 1rem',
    verticalAlign: 'middle',
  },
  productImg: {
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #2a2a2a',
    display: 'block',
  },
  imgPlaceholder: {
    width: '52px',
    height: '52px',
    borderRadius: '8px',
    border: '1px solid #2a2a2a',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    display: 'block',
    fontWeight: 700,
    color: '#f0f0f0',
  },
  productDesc: {
    display: 'block',
    fontSize: '0.78rem',
    color: '#888',
    marginTop: '0.2rem',
  },
  categoryBadge: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '0.25rem 0.6rem',
    fontSize: '0.8rem',
    color: '#ccc',
    whiteSpace: 'nowrap',
  },
  sizesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
  },
  sizeChip: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #FFFFFF',
    borderRadius: '12px',
    padding: '0.18rem 0.55rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #c0392b',
    borderRadius: '8px',
    color: '#c0392b',
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '3rem 1rem',
    color: '#FFFFFF',
  },
  /* Delete Dialog */
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
  },
  dialogTitle: {
    margin: '0 0 0.8rem',
    color: '#c0392b',
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  dialogBody: {
    color: '#ccc',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  dialogActions: {
    display: 'flex',
    gap: '0.8rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #444',
    color: '#ccc',
    borderRadius: '8px',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  confirmDeleteBtn: {
    backgroundColor: '#c0392b',
    border: 'none',
    color: '#fff',
    borderRadius: '8px',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
}
