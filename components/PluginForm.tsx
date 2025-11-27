import React, { useState } from 'react';
import { PluginRequest, GeneratorStatus } from '../types';
import { Icons } from './Icon';

interface PluginFormProps {
  onSubmit: (request: PluginRequest) => void;
  status: GeneratorStatus;
}

const PluginForm: React.FC<PluginFormProps> = ({ onSubmit, status }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    
    onSubmit({
      name,
      description,
      features
    });
  };

  const isLoading = status === GeneratorStatus.GENERATING;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-wp-100 rounded-lg text-wp-700">
          <Icons.Wrench className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Plugin Specification</h2>
          <p className="text-sm text-slate-500">Describe what you need, and AI will build it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Plugin Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wp-500 focus:border-wp-500 outline-none transition-all"
            placeholder="e.g., 'Simple Testimonial Slider'"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wp-500 focus:border-wp-500 outline-none transition-all resize-none"
            placeholder="Describe the main functionality of the plugin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Specific Features (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-wp-500 focus:border-wp-500 outline-none transition-all"
              placeholder="e.g., 'Add a settings page', 'Create a shortcode'"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              disabled={!featureInput.trim() || isLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              <Icons.Plus className="w-5 h-5" />
            </button>
          </div>
          
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-wp-50 text-wp-700 border border-wp-100 rounded-full text-sm">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <Icons.Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium shadow-md transition-all flex items-center justify-center gap-2
              ${isLoading 
                ? 'bg-wp-400 cursor-not-allowed' 
                : 'bg-wp-600 hover:bg-wp-700 hover:shadow-lg active:transform active:scale-[0.99]'
              }`}
          >
            {isLoading ? (
              <>
                <Icons.Loader2 className="w-5 h-5 animate-spin" />
                <span>Thinking & Coding...</span>
              </>
            ) : (
              <>
                <Icons.Code className="w-5 h-5" />
                <span>Generate Plugin</span>
              </>
            )}
          </button>
          {isLoading && (
            <p className="text-center text-xs text-slate-500 mt-2 animate-pulse">
              Generating code with Gemini Pro. This may take up to 30 seconds.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PluginForm;
