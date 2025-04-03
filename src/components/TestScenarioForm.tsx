import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Save, Upload, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import Tabs from './ui/Tabs';
import Button from './ui/Button';
import Modal from './ui/Modal';
import AgentConfigForm from './AgentConfigForm';
import StepsManagement from './StepsManagement';
import { TestScenario } from '../types';
import { API_ENDPOINTS, API_CONFIG, STORAGE_CONFIG, testScenarioSchema, checkCertificates, CERT_STATUS } from '../config';
import { createSecureRequest } from '../config/https-agent';
import Badge from './ui/Badge';

// Function to transform form data to API payload format
const transformFormDataToApiPayload = (data: TestScenario) => {
  const { agentConfig, steps } = data;
  
  return {
    // Map from agentConfig to root level fields
    start_page: agentConfig.startPageUrl,
    // Only include model fields if they have values
    ...(agentConfig.codeWriterModel ? { code_writer_model: agentConfig.codeWriterModel } : {}),
    ...(agentConfig.htmlAssistantModel ? { html_assistant_model: agentConfig.htmlAssistantModel } : {}),
    ...(agentConfig.progressCheckerModel ? { progress_checker_model: agentConfig.progressCheckerModel } : {}),
    
    // Map other required fields
    name: agentConfig.scenarioName,
    project_name: agentConfig.projectName,
    
    // Transform steps array
    case_steps: steps.map(step => ({
      action: step.actionType,
      number: step.stepNumber,
      expected_results: step.expectedResults.map(result => result.description),
      parameters: step.parameters.map(param => ({
        key: param.key,
        value: param.value,
        is_secret: param.isSecret
      }))
    }))
  };
};

// Component to display the JSON preview
const JsonPreview: React.FC = () => {
  const { control } = useFormContext();
  const formValues = useWatch({ control });
  const [apiPayload, setApiPayload] = useState<any>(null);
  
  useEffect(() => {
    if (!formValues) return;
    
    try {
      // Create a deep copy of the form data
      const data = JSON.parse(JSON.stringify(formValues));
      
      // Transform the data to match API expectations
      if (data.agentConfig && data.steps) {
        const transformedData = transformFormDataToApiPayload(data);
        setApiPayload(transformedData);
      }
    } catch (error) {
      console.error('Error transforming form data:', error);
    }
  }, [formValues]);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">API Payload Preview</h2>
      <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {apiPayload ? JSON.stringify(apiPayload, null, 2) : 'No data available'}
        </pre>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        This is a preview of the data that will be sent to the API. Empty model fields are omitted.
      </p>
    </div>
  );
};

// Wrapper component to ensure JsonPreview has access to form context
const JsonPreviewWrapper: React.FC = () => {
  const formContext = useFormContext();
  
  if (!formContext) {
    return <div>Form context not available</div>;
  }
  
  return <JsonPreview />;
};

const TestScenarioForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [configName, setConfigName] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [certStatus, setCertStatus] = useState<'loaded' | 'missing' | 'unknown'>('unknown');

  // Check certificate status
  useEffect(() => {
    const checkCertificateStatus = async () => {
      try {
        const certsAvailable = await checkCertificates();
        setCertStatus(certsAvailable ? 'loaded' : 'missing');
      } catch (error) {
        console.warn('Certificate check failed:', error);
        setCertStatus('missing');
      }
    };
    
    checkCertificateStatus();
    
    // Also check localStorage for status updates from https-agent.ts
    const handleStorageChange = () => {
      const status = window.localStorage.getItem('cert_status');
      if (status === 'loaded') {
        setCertStatus('loaded');
        CERT_STATUS.updateStatus(true);
      } else if (status === 'missing') {
        setCertStatus('missing');
        CERT_STATUS.updateStatus(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    setApiError(null);
    
    try {
      // Transform the data to match API expectations using the shared function
      const apiPayload = transformFormDataToApiPayload(data);
      
      console.log('Submitting data to API:', apiPayload);
      
      // Use our secure request function with certificates
      const response = await createSecureRequest(API_ENDPOINTS.SUBMIT_TEST_SCENARIO, {
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiPayload),
        // Add these options to help with debugging
        credentials: 'include',
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `API request failed with status ${response.status}`
        );
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      toast.success('Test scenario submitted successfully!');
    } catch (error) {
      console.error('Error submitting test scenario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      toast.error(`Failed to submit test scenario: ${errorMessage}`);
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
    localStorage.setItem(`${STORAGE_CONFIG.TEST_SCENARIO_PREFIX}${configName}`, JSON.stringify(formData));
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
      if (key && key.startsWith(STORAGE_CONFIG.TEST_SCENARIO_PREFIX)) {
        configs.push({
          key,
          name: key.replace(STORAGE_CONFIG.TEST_SCENARIO_PREFIX, ''),
        });
      }
    }
    return configs;
  };

  const savedConfigs = getSavedConfigs();

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            handleSubmit(() => setShowConfirmModal(true))(e);
          }
        }} 
        className="space-y-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Test Scenario Configuration</h1>
          
          {/* Certificate status indicator */}
          <div className="flex items-center">
            {certStatus === 'loaded' ? (
              <Badge variant="success" className="flex items-center">
                <ShieldCheck size={16} className="mr-1" /> 
                Certificates Loaded
              </Badge>
            ) : certStatus === 'missing' ? (
              <Badge variant="warning" className="flex items-center">
                <ShieldAlert size={16} className="mr-1" /> 
                Certificates Missing
              </Badge>
            ) : null}
          </div>
        </div>
        
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
            {
              id: 'json-preview',
              label: 'API Payload Preview',
              content: <JsonPreviewWrapper />,
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

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">API Error:</p>
              <p className="text-sm">{apiError}</p>
              <p className="text-sm mt-2">
                <strong>Note:</strong> If you're seeing a network error, this might be due to HTTPS certificate issues with localhost. 
                Try accessing the API directly at <a href="https://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="underline">https://localhost:8000/docs</a> 
                and accept any certificate warnings in your browser first.
              </p>
              {certStatus === 'missing' && (
                <p className="text-sm mt-2">
                  <strong>Certificate files missing:</strong> Place cert.pem and key.pem in the cert directory to enable secure connections.
                </p>
              )}
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
