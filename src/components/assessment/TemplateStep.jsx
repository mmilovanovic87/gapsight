import { useState } from 'react';
import { TEMPLATE_GROUPS } from '../../data/templates';

const BADGE_COLORS = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function TemplateStep({ templates, onSelect, onSkip }) {
  const [selected, setSelected] = useState(null);

  const templatesById = Object.fromEntries(templates.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Choose a starting point</h2>
      <p className="text-sm text-gray-700">
        Pick a template to pre-fill the assessment with realistic values, or start from scratch.
      </p>

      <div className="space-y-6">
        {TEMPLATE_GROUPS.map((group) => {
          const groupTemplates = group.templateIds
            .map((id) => templatesById[id])
            .filter(Boolean);
          if (groupTemplates.length === 0) return null;

          return (
            <div key={group.id}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {group.label}
              </h3>
              <div className="space-y-2">
                {groupTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelected(tpl.id)}
                    className={`w-full text-left p-4 border rounded-lg cursor-pointer transition-colors ${
                      selected === tpl.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none">{tpl.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{tpl.label}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              BADGE_COLORS[tpl.badgeColor] || BADGE_COLORS.blue
                            }`}
                          >
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{tpl.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => {
            const tpl = templates.find((t) => t.id === selected);
            if (tpl) onSelect(tpl);
          }}
          disabled={!selected}
          className={`w-full px-6 py-2.5 text-sm rounded font-medium ${
            selected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Use this template
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Start from scratch
        </button>
      </div>
    </div>
  );
}
