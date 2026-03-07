import en from '../../locales/en.json';

const t = en.assessment.deployment;

const OPTIONS = [
  { value: 'pre-deployment', label: t.options.pre },
  { value: 'post-deployment', label: t.options.post },
  { value: 'pilot', label: t.options.pilot },
];

export default function DeploymentStep({ value, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t.title}</h2>
      <p className="text-sm text-gray-700">{t.question}</p>
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              value === opt.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="deployment_status"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="text-blue-600"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
