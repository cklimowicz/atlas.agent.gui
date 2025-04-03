import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, Upload, AlertTriangle } from 'lucide-react';
import Tabs from './ui/Tabs';
import Button from './ui/Button';
import Modal from './ui/Modal';
import AgentConfigForm from './AgentConfigForm';
import StepsManagement from './StepsManagement';
import { TestScenario } from '../types';

// Validation schema
const parameterSchema = z.object({
  key: z.string().min(1, 'Parameter key is required'),
  value: z.string().min(1, 'Parameter value is required'),
  isSecret: z.boolean().default(false),
});

const expectedResultSchema = z.object({
  description: z.string().min(1, 'Expected result description is required'),
});

const stepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  actionType: z.string().min(1, 'Action type is required'),
  expectedResults: z.array(expectedResultSchema),
  parameters: z.array(parameterSchema),
});

const agentConfigSchema = z.object({
  codeWriterModel: z.string().min(1, 'Code Writer Model is required'),
  htmlAssistantModel: z.string().min(1, 'HTML Assistant Model is required'),
  progressCheckerModel: z.string().min(1, 'Progress Checker Model is required'),
  startPageUrl: z.string().url('Please enter a valid URL'),
  projectName: z.string()
    .min(1, 'Project name is required')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Project name must contain only alphanumeric characters, spaces, hyphens, and underscores'),
  scenarioName: z.string()
    .min(1, 'Scenario name is required')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Scenario name must contain only alphanumeric characters, spaces, hyphens, and underscores'),
});

const testScenarioSchema = z.object({
  agentConfig: agentConfigSchema,
  steps: z.array(stepSchema).min(1, 'At least one step is required'),
});

const TestScenarioForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [configName, setConfigName] = useState('');

  const methods = useForm<TestScenario>({
    resolver: zodResolver(testScenarioSchema),
    defaultValues: {
      agentConfig: {
        codeWriterModel: '',
        htmlAssistantModel: '',
        progressCheckerModel: '',
        startPageUrl: '',
        projectName: '',
        scenarioName: '',
      },
      steps: [],
    },
    mode: 'onChange',
  });

  const { handleSubmit, formState: { errors, isValid } } = methods;

  const onSubmit = async (data: TestScenario) => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      console.log('Submitting data:', data);
      
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Test scenario submitted successfully!');
    } catch (error) {
      console.error('Error submitting test scenario:', error);
      toast.error('Failed to submit test scenario. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) {
      toast.error('Please enter a name for your configuration');
      return;
    }
    
    const formData = methods.getValues();
    localStorage.setItem(`test-scenario-${configName}`, JSON.stringify(formData));
    toast.success(`Configuration "${configName}" saved successfully!`);
    setShowSaveModal(false);
    setConfigName('');
  };

  const handleLoadConfig = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const configKey = event.target.value;
    if (!configKey) return;
    
    const savedConfig = localStorage.getItem(configKey);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig) as TestScenario;
        methods.reset(parsedConfig);
        toast.success('Configuration loaded successfully!');
      } catch (error) {
        console.error('Error parsing saved configuration:', error);
        toast.error('Failed to load configuration. The saved data may be corrupted.');
      }
    }
  };

  const getSavedConfigs = () => {
    const configs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('test-scenario-')) {
        configs.push({
          key,
          name: key.replace('test-scenario-', ''),
        });
      }
    }
    return configs;
  };

  const savedConfigs = getSavedConfigs();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(() => setShowConfirmModal(true))} className="space-y-6">
        <Tabs
          tabs={[
            {
              id: 'agent-config',
              label: 'Agent Configuration',
              content: <AgentConfigForm />,
            },
            {
              id: 'case-steps',
              label: 'Case Steps Management',
              content: <StepsManagement />,
            },
          ]}
          defaultTab="agent-config"
        />

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="mt-1 list-disc list-inside text-sm">
                {errors.agentConfig && (
                  <li>Agent Configuration: Please complete all required fields</li>
                )}
                {errors.steps && (
                  <li>Case Steps: {errors.steps.message || 'Please add at least one step'}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveModal(true)}
            >
              <Save size={18} className="mr-1" /> Save Draft
            </Button>
            
            <div className="relative">
              <select
                className="h-10 pl-4 pr-8 border border-gray-300 rounded-md bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleLoadConfig}
                defaultValue=""
              >
                <option value="" disabled>Load Configuration</option>
                {savedConfigs.map((config) => (
                  <option key={config.key} value={config.key}>
                    {config.name}
                  </option>
                ))}
              </select>
              <Upload size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit Test Scenario
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Submission"
        >
          <p>Are you sure you want to submit this test scenario?</p>
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => onSubmit(methods.getValues())}
              isLoading={isSubmitting}
            >
              Confirm
            </Button>
          </div>
        </Modal>

        {/* Save Configuration Modal */}
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Save Configuration"
        >
          <div className="space-y-4">
            <p>Enter a name for this configuration:</p>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Configuration name"
            />
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveConfig}
              disabled={!configName.trim()}
            >
              Save
            </Button>
          </div>
        </Modal>
      </form>
    </FormProvider>
  );
};

export default TestScenarioForm;
