import en from '../../locales/en.json';

export function FloatInput({ id, label, value, onChange, min, max, threshold, direction, passAt, reviewAt, error, tooltip }) {
  const thresholdText = en.threshold_label;
  const dirLabel = direction === 'higher_better'
    ? `Pass >= ${passAt}, Review >= ${reviewAt}`
    : `Pass <= ${passAt}, Review <= ${reviewAt}`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {tooltip && (
          <span className="ml-1 text-xs text-gray-400 cursor-help" title={tooltip}>(?)</span>
        )}
      </label>
      <input
        id={id}
        type="number"
        step="any"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        className={`block w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {passAt !== undefined && (
        <p className="text-xs text-gray-400">
          {dirLabel} <span className="italic">- {thresholdText}</span>
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function IntegerInput({ id, label, value, onChange, min, error, warning, tooltip }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {tooltip && (
          <span className="ml-1 text-xs text-gray-400 cursor-help" title={tooltip}>(?)</span>
        )}
      </label>
      <input
        id={id}
        type="number"
        step="1"
        min={min}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
        className={`block w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {warning && <p className="text-xs text-yellow-600">{warning}</p>}
    </div>
  );
}

export function EnumSelect({ id, label, value, onChange, options, error }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`block w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="">- Select -</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function BooleanToggle({ id, label, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name={id}
            checked={value === true}
            onChange={() => onChange(true)}
            className="text-blue-600"
          />
          {en.assessment.enum_labels.yes}
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name={id}
            checked={value === false}
            onChange={() => onChange(false)}
            className="text-blue-600"
          />
          {en.assessment.enum_labels.no}
        </label>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function DateInput({ id, label, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`block w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function MultiSelect({ id, label, options, value, onChange }) {
  const selected = value || [];
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="rounded text-blue-600"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function TextArea({ id, label, value, onChange, onBlur, placeholder, minLength, error }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={3}
        className={`block w-full rounded border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function SectionWrapper({ title, subtitle, sectionNumber, children }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{sectionNumber ? `Section ${sectionNumber}: ${title}` : title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
