import React, { useState, useEffect } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { previewSegment } from '../../api/segment.api';
import Spinner from '../ui/Spinner';
import { useQuery } from '@tanstack/react-query';
import { getCustomerMetadata } from '../../api/customer.api';

const FIELDS = [
  { value: 'totalSpend', label: 'Total Spend (₹)', type: 'numeric' },
  { value: 'orderCount', label: 'Order Count', type: 'numeric' },
  { value: 'avgOrderValue', label: 'Average Order Value (₹)', type: 'numeric' },
  { value: 'daysSinceLastOrder', label: 'Days Since Last Order', type: 'numeric' },
  { value: 'city', label: 'City', type: 'string' },
  { value: 'gender', label: 'Gender', type: 'string' },
  { value: 'tags', label: 'Tags', type: 'array' }
];

const OPERATORS_BY_TYPE = {
  numeric: [
    { value: 'gte', label: '≥ (Greater than or equal)' },
    { value: 'lte', label: '≤ (Less than or equal)' },
    { value: 'gt', label: '> (Greater than)' },
    { value: 'lt', label: '< (Less than)' },
    { value: 'eq', label: '= (Equal to)' }
  ],
  string: [
    { value: 'eq', label: 'is exactly' },
    { value: 'neq', label: 'is not' },
    { value: 'in', label: 'is one of (comma-separated)' }
  ],
  array: [
    { value: 'contains', label: 'contains tag' }
  ]
};

export default function RuleBuilder({ rules, onChange }) {
  const [matchCount, setMatchCount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Customer Metadata (tags, cities, customFieldKeys)
  const { data: metadataData } = useQuery({
    queryKey: ['customer-metadata'],
    queryFn: getCustomerMetadata
  });

  const customFieldKeys = metadataData?.data?.customFieldKeys || [];

  const standardFields = [
    { value: 'totalSpend', label: 'Total Spend (₹)', type: 'numeric' },
    { value: 'orderCount', label: 'Order Count', type: 'numeric' },
    { value: 'avgOrderValue', label: 'Average Order Value (₹)', type: 'numeric' },
    { value: 'daysSinceLastOrder', label: 'Days Since Last Order', type: 'numeric' },
    { value: 'city', label: 'City', type: 'string' },
    { value: 'gender', label: 'Gender', type: 'string' },
    { value: 'tags', label: 'Tags', type: 'array' }
  ];

  const dynamicFields = [
    ...standardFields,
    ...customFieldKeys.map(key => ({
      value: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      type: 'string'
    }))
  ];

  // Auto-fill default operators when field changes
  const handleFieldChange = (index, newField) => {
    const fieldObj = dynamicFields.find(f => f.value === newField);
    const availableOps = OPERATORS_BY_TYPE[fieldObj.type] || [];
    const defaultOp = availableOps[0]?.value || 'eq';
    
    const updatedConditions = [...rules.conditions];
    updatedConditions[index] = {
      field: newField,
      operator: defaultOp,
      value: fieldObj.type === 'numeric' ? 0 : ''
    };

    onChange({
      ...rules,
      conditions: updatedConditions
    });
  };

  const handleConditionChange = (index, key, val) => {
    const updatedConditions = [...rules.conditions];
    let typedVal = val;
    
    // cast values if numeric
    const fieldObj = dynamicFields.find(f => f.value === updatedConditions[index].field);
    if (key === 'value') {
      if (fieldObj.type === 'numeric') {
        typedVal = val === '' ? 0 : parseFloat(val);
      } else if (updatedConditions[index].operator === 'in') {
        typedVal = val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    updatedConditions[index] = {
      ...updatedConditions[index],
      [key]: typedVal
    };

    onChange({
      ...rules,
      conditions: updatedConditions
    });
  };

  const addCondition = () => {
    const defaultField = dynamicFields[0].value;
    const defaultOp = OPERATORS_BY_TYPE.numeric[0].value;

    onChange({
      ...rules,
      conditions: [
        ...rules.conditions,
        { field: defaultField, operator: defaultOp, value: 0 }
      ]
    });
  };

  const deleteCondition = (index) => {
    const updatedConditions = rules.conditions.filter((_, idx) => idx !== index);
    onChange({
      ...rules,
      conditions: updatedConditions
    });
  };

  const toggleLogic = () => {
    onChange({
      ...rules,
      logic: rules.logic === 'AND' ? 'OR' : 'AND'
    });
  };

  // Debounced Segment Preview
  useEffect(() => {
    if (rules.conditions.length === 0) {
      setMatchCount(0);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await previewSegment(rules);
        if (res.success) {
          setMatchCount(res.data.audienceCount);
        }
      } catch (err) {
        console.warn('Preview resolve failed:', err.message);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [rules]);

  return (
    <div className="space-y-4">
      {/* Logic operator bar */}
      <div className="flex items-center justify-between bg-surface-elevated/45 p-3 rounded-xl border border-border/60">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-secondary font-medium">Match logic:</span>
          <div className="inline-flex bg-surface rounded-lg p-0.5 border border-border">
            <button
              onClick={toggleLogic}
              disabled={rules.logic === 'AND'}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                rules.logic === 'AND'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              AND
            </button>
            <button
              onClick={toggleLogic}
              disabled={rules.logic === 'OR'}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                rules.logic === 'OR'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              OR
            </button>
          </div>
        </div>

        {/* Matches live indicator */}
        <div className="flex items-center space-x-2 text-xs">
          {loading ? (
            <Spinner size="xs" color="text-primary-light" />
          ) : (
            <div className="text-text-secondary">
              Matches:{' '}
              <span className="text-primary-light font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                {matchCount ?? 0} customers
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions list */}
      <div className="space-y-3">
        {rules.conditions.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-border rounded-xl text-text-muted text-xs">
            No query conditions added. Click button below to build.
          </div>
        ) : (
          rules.conditions.map((cond, index) => {
            const fieldObj = dynamicFields.find(f => f.value === cond.field) || dynamicFields[0];
            const ops = OPERATORS_BY_TYPE[fieldObj.type] || [];
            
            // Format commas for display in 'in' operator edit box
            const displayVal = cond.operator === 'in' && Array.isArray(cond.value)
              ? cond.value.join(', ')
              : cond.value;

            return (
              <div key={index} className="flex items-center space-x-2 bg-surface-elevated/20 p-3.5 border border-border/40 rounded-xl">
                {/* Field dropdown */}
                <select
                  value={cond.field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  className="bg-surface border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary flex-1 min-w-[130px]"
                >
                  {dynamicFields.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                {/* Operator dropdown */}
                <select
                  value={cond.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                  className="bg-surface border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary w-[140px]"
                >
                  {ops.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* Value input */}
                {fieldObj.type === 'numeric' ? (
                  <input
                    type="number"
                    value={cond.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-surface border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary w-[110px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={displayVal}
                    placeholder={cond.operator === 'in' ? 'Mumbai, Delhi, Pune' : 'Value'}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    className="bg-surface border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary flex-1"
                  />
                )}

                {/* Delete button */}
                <button
                  onClick={() => deleteCondition(index)}
                  className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={addCondition}
        className="inline-flex items-center space-x-1.5 text-xs text-primary-light hover:text-primary transition-colors py-1 px-2 hover:bg-primary/5 rounded-lg font-medium"
      >
        <Plus className="h-4 w-4" />
        <span>Add Filter Rule</span>
      </button>
    </div>
  );
}
