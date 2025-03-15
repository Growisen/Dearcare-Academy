const FilterSelect = ({ value, onChange, options, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[], className?: string }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 ${className}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
)

export default FilterSelect
