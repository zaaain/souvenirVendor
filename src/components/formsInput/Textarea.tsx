import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 font-ManropeBold">
          {label}
        </label>
      )}
      <textarea
        className={`w-full font-Manrope h-24 md:h-32 px-4 py-2 bg-inputBg border rounded-2xl focus:outline-none focus:border-primary resize-none ${
          error ? 'border-red-500' : 'border-[#DDD]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 font-Manrope">{error}</p>
      )}
    </div>
  )
}

export default Textarea
