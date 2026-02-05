import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Textarea } from '@components/formsInput'
import { FileUpload } from '@components/formsInput'
import { FeaturedImageUpload } from '@components/formsInput'
import { Select } from '@components/select'
import { QuantityStepper } from '@components/formsInput'
import { Button } from '@components/buttons'
import type { SelectOption } from '@components/select'

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'vitamins', label: 'Vitamins' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'feed', label: 'Feed & Nutrition' },
  { value: 'animal-medicines', label: 'Animal Medicines' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

// Mock data - will be replaced with API data
const MOCK_PRODUCT_DATA = {
  'p-001': {
    productName: 'Amoxicillin',
    description: 'Euismod purus a vel gravida interdum consectetur diam fermentum ultrices. Augue bibendum diam in elit eu laoreet faucibus ultrices.',
    category: 'medication',
    status: 'published',
    sku: '1234321',
    quantity: 50,
    price: '50.00',
    vat: '0',
    discount: '50',
    weight: '0.2',
    height: '120',
    length: '320',
    width: '120',
    images: [],
  },
}

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState('')
  const [vat, setVat] = useState('')
  const [discount, setDiscount] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')

  useEffect(() => {
    if (id) {
      const product = MOCK_PRODUCT_DATA[id as keyof typeof MOCK_PRODUCT_DATA]
      if (product) {
        setProductName(product.productName)
        setDescription(product.description)
        setCategory(product.category)
        setStatus(product.status)
        setSku(product.sku)
        setQuantity(product.quantity)
        setPrice(product.price)
        setVat(product.vat)
        setDiscount(product.discount)
        setWeight(product.weight)
        setHeight(product.height)
        setLength(product.length)
        setWidth(product.width)
      }
    }
  }, [id])

  const handleCancel = () => {
    navigate(`/products/${id}`)
  }

  const handleSaveChanges = () => {
    console.log('Save Changes', {
      productName,
      description,
      category,
      status,
      sku,
      quantity,
      price,
      vat,
      discount,
      weight,
      height,
      length,
      width,
    })
    navigate(`/products/${id}`)
  }

  const statusBadgeClass: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-primary text-white',
    pending: 'bg-orange-100 text-orange-700',
    suspended: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Product"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Edit Product</h1>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-Manrope ${statusBadgeClass[status] || statusBadgeClass.draft}`}>
              {STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            Cancel
          </button>
          <Button onClick={handleSaveChanges} className="px-4 py-2">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Wider (8 cols on md+) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">General Information</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-4">
              <Input
                label="Product Name"
                placeholder="Type product name here..."
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Textarea
                label="Description"
                placeholder="Type product description here..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Product Images Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Product Images</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {/* Mock images - will be replaced with actual images */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={`https://picsum.photos/seed/product${i}/240/240`}
                    alt={`Product ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <FileUpload
              multiple
              accept="image/*"
              maxSize={10}
              placeholder="Drag and drop files here, or click to browse"
              supportedFormats="Supported: JPG, PNG, JPEG (Max 10MB each)"
            />
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Pricing</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 font-ManropeBold">
                  Pricing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    placeholder="Base Price"
                    type="number"
                    className="pl-8"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <Input
                label="VAT Amount (%)"
                placeholder="VAT Amount (%)"
                type="number"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
              />
              <Input
                label="Discount Percentage (%)"
                placeholder="Discount Percentage (%)"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Shipping</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Weight (kg)"
                placeholder="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <Input
                label="Height (cm)"
                placeholder="Height (cm)"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Input
                label="Length (cm)"
                placeholder="Length (cm)"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
              <Input
                label="Width (cm)"
                placeholder="Width (cm)"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Narrower (4 cols on md+) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Category Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Category</h3>
            <div className="border-b border-gray-200 mb-4" />
            <Select
              label="Product Category"
              value={category}
              onValueChange={setCategory}
              options={CATEGORY_OPTIONS}
              placeholder="Select a Category"
              rounded="lg"
            />
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Status</h3>
            <div className="border-b border-gray-200 mb-4" />
            <Select
              label="Product Status"
              value={status}
              onValueChange={setStatus}
              options={STATUS_OPTIONS}
              placeholder="Select Status"
              rounded="lg"
            />
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Inventory</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-4">
              <Input
                label="SKU"
                placeholder="Type product SKU"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <QuantityStepper
                label="Quantity Available (Stock)"
                value={quantity}
                onChange={setQuantity}
                min={0}
              />
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-lg font-ManropeBold text-gray-800 mb-2">Featured Image</h3>
            <div className="border-b border-gray-200 mb-4" />
            <FeaturedImageUpload
              accept="image/*"
              maxSize={10}
              placeholder="Drag and drop files here, or click to browse"
              supportedFormats="Supported: JPG, PNG, JPEG (Max 10MB each)"
              currentImageUrl="https://picsum.photos/seed/featured/240/240"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProduct
