import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getBanners, addBanner, deleteBanner, updateBannersList } from '../../lib/banners'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, ArrowUp, ArrowDown, Eye, EyeOff, Image as ImageIcon, ExternalLink } from 'lucide-react'

const initialForm = {
  image_url: '',
  title: '',
  subtitle: '',
  button_text: 'Explore Collection',
  link: '/catalogue',
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const data = await getBanners()
      setBanners(data || [])
    } catch {
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `banner-${Date.now()}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (error) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setForm((prev) => ({ ...prev, image_url: reader.result }))
          toast.success('Slide image loaded (preview ready)')
        }
        reader.readAsDataURL(file)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        setForm((prev) => ({ ...prev, image_url: publicUrl }))
        toast.success('Image uploaded to storage successfully!')
      }
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image_url: reader.result }))
      }
      reader.readAsDataURL(file)
      toast.success('Slide image loaded')
    } finally {
      setUploading(false)
    }
  }

  const handleAddSlide = async (e) => {
    e.preventDefault()
    if (!form.image_url.trim()) {
      toast.error('Please provide an image for the slide (upload or URL)')
      return
    }

    setSaving(true)
    try {
      const updated = await addBanner({
        image_url: form.image_url.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        button_text: form.button_text.trim() || 'Explore Collection',
        link: form.link.trim() || '/catalogue',
      })
      setBanners(updated)
      setForm(initialForm)
      toast.success('New banner slide added to homepage!')
    } catch {
      toast.error('Failed to save slide')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this slide${title ? ` "${title}"` : ''}?`
    )
    if (!confirmed) return

    const updated = await deleteBanner(id)
    setBanners(updated)
    toast.success('Slide removed')
  }

  const handleToggleActive = async (id) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    setBanners(updated)
    await updateBannersList(updated)
    toast.success('Slide visibility updated')
  }

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= banners.length) return

    const updated = [...banners]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    setBanners(updated)
    await updateBannersList(updated)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#261710]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DECFC0] pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#261710] flex items-center gap-2.5">
            <ImageIcon size={26} className="text-[#784E38]" />
            Hero Slide Banners
          </h1>
          <p className="text-xs sm:text-sm text-[#6F584A] mt-1">
            Add, reorder, or customize the full-width image slides shown on the homepage hero banner.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFFFFF] border border-[#D5C2AE] text-[#3D261C] hover:bg-[#FAF6F0] transition-colors self-start sm:self-auto"
        >
          <ExternalLink size={13} />
          View Live Homepage
        </a>
      </div>

      {/* ── ADD NEW SLIDE FORM ── */}
      <div className="bg-[#FFFFFF] border border-[#DECFC0] p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#261710] font-serif mb-4 flex items-center gap-2">
          <Plus size={18} className="text-[#784E38]" />
          Add New Hero Slide
        </h2>

        <form onSubmit={handleAddSlide} className="space-y-4">
          {/* Image Upload / URL */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#5C4537] mb-1.5 font-bold">
              Slide Image <span className="text-[#784E38]">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-2">
              <label className="bg-[#FAF6F0] hover:bg-[#EFE7DC] border border-dashed border-[#784E38] text-[#784E38] px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-2 transition-colors">
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-[#8A7465]">or paste an image link below:</span>
            </div>

            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/slide-banner.jpg"
              className="w-full bg-[#FAF6F0] border border-[#D5C2AE] px-3.5 py-2 text-xs sm:text-sm text-[#261710] focus:border-[#784E38] outline-none"
              required
            />
          </div>

          {/* Live Preview */}
          {form.image_url && (
            <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-[#241711] border border-[#DECFC0]">
              <img
                src={form.image_url}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                <p className="text-xs font-bold text-[#F7F3EC] uppercase tracking-wider">Preview</p>
                <p className="text-sm sm:text-lg font-serif font-bold text-white truncate">
                  {form.title || 'Slide Title Appears Here'}
                </p>
                <p className="text-xs text-[#EFE7DC] truncate">
                  {form.subtitle || 'Slide subtitle description'}
                </p>
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#5C4537] mb-1 font-semibold">
                Slide Headline (optional)
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Modest Islamic Apparel"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] px-3 py-2 text-xs sm:text-sm text-[#261710] focus:border-[#784E38] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#5C4537] mb-1 font-semibold">
                Button Text
              </label>
              <input
                type="text"
                name="button_text"
                value={form.button_text}
                onChange={handleChange}
                placeholder="e.g. Explore Collection"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] px-3 py-2 text-xs sm:text-sm text-[#261710] focus:border-[#784E38] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#5C4537] mb-1 font-semibold">
                Subtitle / Description (optional)
              </label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="e.g. Crafted with pure intention and modest care"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] px-3 py-2 text-xs sm:text-sm text-[#261710] focus:border-[#784E38] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#5C4537] mb-1 font-semibold">
                Button Link / Target
              </label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="e.g. /catalogue or #contact"
                className="w-full bg-[#FAF6F0] border border-[#D5C2AE] px-3 py-2 text-xs sm:text-sm text-[#261710] focus:border-[#784E38] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#3D261C] hover:bg-[#543729] text-[#F7F3EC] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>{saving ? 'Adding Slide...' : 'Add Slide to Homepage'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── CURRENT SLIDES LIST ── */}
      <div className="bg-[#FFFFFF] border border-[#DECFC0] p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#261710] font-serif mb-1 flex items-center gap-2">
          <ImageIcon size={18} className="text-[#784E38]" />
          Current Banner Slides ({banners.length})
        </h2>
        <p className="text-xs text-[#6F584A] mb-4">
          Drag or click arrows to reorder slides. The top slide will appear first when visitors load the homepage.
        </p>

        {loading ? (
          <div className="py-12 text-center text-[#8A7465]">Loading slides...</div>
        ) : banners.length === 0 ? (
          <div className="py-10 text-center text-[#8A7465] bg-[#FAF6F0] border border-[#DECFC0]">
            No slides configured yet. Add your first slide above!
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`p-3.5 sm:p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all ${
                  slide.active !== false
                    ? 'bg-[#FAF6F0] border-[#DECFC0]'
                    : 'bg-[#F2ECE4] border-[#DECFC0] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-bold text-[#784E38] shrink-0">
                    #{idx + 1}
                  </span>

                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Slide thumbnail'}
                    className="w-20 h-14 sm:w-28 sm:h-16 object-cover border border-[#DECFC0] shrink-0 bg-[#241711]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#261710] truncate font-serif">
                      {slide.title || 'Untitled Banner Slide'}
                    </p>
                    {slide.subtitle && (
                      <p className="text-xs text-[#6F584A] truncate mt-0.5">{slide.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#784E38]">
                      <span>Action: <strong>{slide.button_text || 'Button'}</strong></span>
                      <span>&bull;</span>
                      <span className="truncate">Link: {slide.link || '/catalogue'}</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    title="Move slide up (earlier)"
                    className="p-1.5 text-[#5C4537] hover:text-[#261710] disabled:opacity-30 disabled:cursor-not-allowed bg-[#FFFFFF] border border-[#D5C2AE]"
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    type="button"
                    disabled={idx === banners.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    title="Move slide down (later)"
                    className="p-1.5 text-[#5C4537] hover:text-[#261710] disabled:opacity-30 disabled:cursor-not-allowed bg-[#FFFFFF] border border-[#D5C2AE]"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide.id)}
                    title={slide.active !== false ? 'Hide from homepage' : 'Show on homepage'}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border ${
                      slide.active !== false
                        ? 'bg-[#EAF2EB] border-[#BCD4BF] text-[#20522B]'
                        : 'bg-[#FDF0ED] border-[#F3C4BE] text-[#8C2E24]'
                    }`}
                  >
                    {slide.active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{slide.active !== false ? 'Active' : 'Hidden'}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(slide.id, slide.title)}
                    title="Delete slide"
                    className="p-1.5 text-[#c0392b] hover:bg-red-50 border border-red-200"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
