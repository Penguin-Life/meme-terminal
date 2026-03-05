import { useRef, forwardRef, useImperativeHandle } from 'react'
import { Search, X } from 'lucide-react'

const SearchBar = forwardRef(function SearchBar(
  {
    value,
    onChange,
    onSubmit,
    placeholder = 'Search tokens...',
    loading = false,
    className = '',
  },
  ref
) {
  const inputRef = useRef(null)

  // Expose focus() to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) onSubmit(value)
    if (e.key === 'Escape') onChange('')
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div
      className={`relative flex items-center rounded-lg border transition-all ${className}`}
      style={{ background: '#12131a', borderColor: '#1e2030' }}
    >
      <Search size={16} className="absolute left-3 flex-shrink-0" style={{ color: '#6b7280' }} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent pl-9 pr-9 py-2.5 text-sm outline-none"
        style={{ color: '#e5e7eb' }}
      />
      {loading && (
        <div
          className="absolute right-3 w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: '#1e2030', borderTopColor: '#00ff88' }}
        />
      )}
      {!loading && value && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-0.5 rounded transition-colors hover:text-white"
          style={{ color: '#6b7280' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
})

export default SearchBar
