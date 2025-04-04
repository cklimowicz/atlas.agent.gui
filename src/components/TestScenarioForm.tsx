import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Save, Upload, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Copy, Download } from 'lucide-react';
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
      expected_results: step.expectedResults.length > 0 
        ? step.expectedResults.map(result => result.description)
        : null,
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
  
  const handleCopyJson = () => {
    if (apiPayload) {
      navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2))
        .then(() => {
          toast.success('JSON skopiowany do schowka');
        })
        .catch(err => {
          console.error('Nie udało się skopiować JSON:', err);
          toast.error('Nie udało się skopiować JSON');
        });
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Podgląd modelu do wysłania do API</h2>
        {apiPayload && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="flex items-center"
          >
            <Copy size={16} className="mr-1" /> Kopiuj JSON
          </Button>
        )}
      </div>
      <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap json-preview-code">
          {apiPayload ? JSON.stringify(apiPayload, null, 2) : 'Brak dostępnych danych'}
        </pre>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        To jest podgląd danych, które zostaną wysłane do API. Puste pola modeli są pomijane.
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

// Component to display the API response
const ApiResponsePreview: React.FC<{ 
  apiResponse: any; 
  apiError: string | null; 
  isLoading: boolean;
  certStatus: 'loaded' | 'missing' | 'unknown';
}> = ({ 
  apiResponse, 
  apiError,
  isLoading,
  certStatus
}) => {
  const formMethods = useFormContext();
  
  const handleCopyResponse = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(
        typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse, null, 2)
      )
        .then(() => {
          toast.success('Odpowiedź skopiowana do schowka');
        })
        .catch(err => {
          console.error('Nie udało się skopiować odpowiedzi:', err);
          toast.error('Nie udało się skopiować odpowiedzi');
        });
    }
  };

  // Funkcja do zapisywania kodu Python do pliku
  const handleSaveToFile = () => {
    if (!apiResponse) return;
    
    // Pobieramy aktualną nazwę projektu i testu z formularza
    const formData = formMethods.getValues();
    const projectName = formData.agentConfig?.projectName || 'project';
    const testName = formData.agentConfig?.scenarioName || 'test';
    
    // Usuwamy znaki specjalne i spacje z nazw, aby uzyskać bezpieczną nazwę pliku
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Pobieramy zawartość odpowiedzi
    const content = typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse, null, 2);
    
    // Tworzenie elementu <a> do pobrania pliku
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/x-python'});
    element.href = URL.createObjectURL(file);
    
    // Nazwa pliku składa się z nazwy projektu i nazwy testu z rozszerzeniem .py
    element.download = `${safeProjectName}_${safeTestName}.py`;
    
    // Dodanie elementu do DOM, wywołanie kliknięcia i usunięcie go
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`Plik ${element.download} został zapisany`);
  };

  // Sprawdzenie czy odpowiedź jest kodem Python
  const isPythonCode = apiResponse && 
    typeof apiResponse === 'string' &&
    (apiResponse.startsWith('def ') || 
     apiResponse.startsWith('import ') || 
     apiResponse.startsWith('class ') ||
     apiResponse.startsWith('# ') ||
     apiResponse.includes('def ') ||
     apiResponse.includes('class '));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Odpowiedź z API</h2>
        <div className="flex items-center space-x-2">
          {apiResponse && !apiError && (
            <>
              <Badge variant="success" className="flex items-center">
                <CheckCircle size={16} className="mr-1" /> 
                Sukces
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyResponse}
                className="flex items-center"
              >
                <Copy size={16} className="mr-1" /> Kopiuj
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveToFile}
                className="flex items-center"
              >
                <Download size={16} className="mr-1" /> Zapisz do pliku
              </Button>
            </>
          )}
          {apiError && (
            <Badge variant="danger" className="flex items-center">
              <XCircle size={16} className="mr-1" /> 
              Błąd
            </Badge>
          )}
          {isLoading && (
            <Badge variant="warning" className="flex items-center">
              Przetwarzanie...
            </Badge>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <span className="text-lg font-medium">Oczekiwanie na odpowiedź z API...</span>
          <p className="text-gray-500 mt-2 max-w-lg text-center">
            Generowanie kodu może potrwać do kilkunastu minut. 
            Proszę czekać aż proces się zakończy - otrzymasz albo kod Python, albo informację o błędzie.
          </p>
        </div>
      ) : apiError ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <h3 className="font-medium mb-1">Błąd API:</h3>
            <p className="text-sm">{apiError}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mt-4">
            <p className="text-sm">
              <strong>Uwaga:</strong> Jeśli widzisz błąd sieci, może to być spowodowane problemami z certyfikatem HTTPS na localhost. 
              Spróbuj otworzyć API bezpośrednio pod adresem <a href="https://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="underline">https://localhost:8000/docs</a> 
              i zaakceptuj ostrzeżenia certyfikatu w przeglądarce.
            </p>
            {certStatus === 'missing' && (
              <p className="text-sm mt-2">
                <strong>Brak plików certyfikatów:</strong> Umieść pliki cert.pem i key.pem w katalogu głównym projektu, aby umożliwić bezpieczne połączenia.
              </p>
            )}
          </div>
        </div>
      ) : apiResponse ? (
        <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
          {isPythonCode ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="success" className="flex items-center">
                  <CheckCircle size={14} className="mr-1" /> 
                  Kod Python
                </Badge>
              </div>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-800 text-gray-50 p-4 rounded">
                {apiResponse}
              </pre>
            </>
          ) : (
            <pre className="text-sm text-gray-800 whitespace-pre-wrap json-preview-code">
              {typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          Brak odpowiedzi z API. Wygeneruj kod, aby zobaczyć odpowiedź.
        </div>
      )}
    </div>
  );
};

const TestScenarioForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [configName, setConfigName] = useState('');
  const [jsonConfig, setJsonConfig] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [certStatus, setCertStatus] = useState<'loaded' | 'missing' | 'unknown'>('unknown');
  const [activeTab, setActiveTab] = useState('agent-config');

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
    setApiResponse(null);
    
    // Switch to API Response tab
    setActiveTab('api-response');
    
    try {
      // Transform the data to match API expectations using the shared function
      const apiPayload = transformFormDataToApiPayload(data);
      
      console.log('Submitting data to API:', apiPayload);
      
      // Use our secure request function with certificates
      const response = await createSecureRequest(API_ENDPOINTS.SUBMIT_TEST_SCENARIO, {
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Accept': 'application/json, text/x-python'
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
      
      // Sprawdzenie typu zawartości odpowiedzi
      const contentType = response.headers.get('content-type') || '';
      let result;
      
      if (contentType.includes('text/x-python')) {
        // Jeśli to kod Python, odczytaj jako tekst
        result = await response.text();
        console.log('Received Python code from API');
      } else {
        // W przeciwnym razie odczytaj jako JSON
        result = await response.json();
        console.log('API response:', result);
      }
      
      setApiResponse(result);
      toast.success('Scenariusz testowy został pomyślnie wysłany!');
    } catch (error) {
      console.error('Error submitting test scenario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      toast.error(`Nie udało się wysłać scenariusza testowego: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) {
      toast.error('Proszę wprowadzić nazwę dla konfiguracji');
      return;
    }
    
    const formData = methods.getValues();
    localStorage.setItem(`${STORAGE_CONFIG.TEST_SCENARIO_PREFIX}${configName}`, JSON.stringify(formData));
    toast.success(`Konfiguracja "${configName}" została pomyślnie zapisana!`);
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
        methods.reset(parsedConfig, {
          keepIsValid: false,
          keepErrors: false,
          keepDirty: false,
          keepTouched: false
        });
        
        // Ręcznie wyzwól walidację po zresetowaniu formularza
        setTimeout(() => {
          methods.trigger();
        }, 100);
        
        toast.success('Konfiguracja została pomyślnie wczytana!');
      } catch (error) {
        console.error('Error parsing saved configuration:', error);
        toast.error('Nie udało się wczytać konfiguracji. Zapisane dane mogą być uszkodzone.');
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

  const handleImportJson = () => {
    setJsonError(null);
    
    try {
      if (!jsonConfig.trim()) {
        setJsonError('Please enter JSON configuration');
        return;
      }
      
      // Parsowanie JSON
      const parsedJson = JSON.parse(jsonConfig);
      
      // Obsługa formatu API (konwersja z API do formatu formularza)
      let parsedConfig: TestScenario;
      
      // Sprawdzenie, czy to format API czy format formularza
      if (parsedJson.start_page || parsedJson.case_steps) {
        // To jest format API, konwertujemy do formatu formularza
        parsedConfig = {
          agentConfig: {
            startPageUrl: parsedJson.start_page || '',
            projectName: parsedJson.project_name || '',
            scenarioName: parsedJson.name || '',
            // Opcjonalne pola modeli
            codeWriterModel: parsedJson.code_writer_model || '',
            htmlAssistantModel: parsedJson.html_assistant_model || '',
            progressCheckerModel: parsedJson.progress_checker_model || '',
          },
          steps: Array.isArray(parsedJson.case_steps) 
            ? parsedJson.case_steps.map((step: any, index: number) => ({
                id: String(index),
                stepNumber: step.number || index + 1,
                actionType: step.action || '',
                expectedResults: Array.isArray(step.expected_results)
                  ? step.expected_results.map((result: string) => ({ description: result }))
                  : [],
                parameters: Array.isArray(step.parameters)
                  ? step.parameters.map((param: any) => ({
                      key: param.key || '',
                      value: param.value || '',
                      isSecret: param.is_secret || false
                    }))
                  : []
              }))
            : []
        };
      } else {
        // To jest już format formularza
        parsedConfig = parsedJson as TestScenario;
      }
      
      // Validate the imported data has the required structure
      if (!parsedConfig.agentConfig || !Array.isArray(parsedConfig.steps)) {
        setJsonError('Invalid JSON structure. Missing required fields.');
        return;
      }
      
      // Upewnij się, że opcjonalne pola modeli mają co najmniej puste stringi
      if (parsedConfig.agentConfig) {
        parsedConfig.agentConfig.codeWriterModel = parsedConfig.agentConfig.codeWriterModel || '';
        parsedConfig.agentConfig.htmlAssistantModel = parsedConfig.agentConfig.htmlAssistantModel || '';
        parsedConfig.agentConfig.progressCheckerModel = parsedConfig.agentConfig.progressCheckerModel || '';
      }
      
      // Reset the form with the new values and trigger validation
      methods.reset(parsedConfig, {
        keepIsValid: false,
        keepErrors: false,
        keepDirty: false,
        keepTouched: false,
        keepSubmitCount: false
      });
      
      // Ręcznie wyzwól walidację po zresetowaniu formularza
      setTimeout(() => {
        methods.trigger();
      }, 100);
      
      // Close the modal and show success message
      setShowImportModal(false);
      setJsonConfig('');
      toast.success('Konfiguracja została pomyślnie zaimportowana!');
    } catch (error) {
      console.error('Error parsing JSON:', error);
      setJsonError('Nieprawidłowy format JSON. Sprawdź swoje dane wejściowe.');
    }
  };

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
        <Tabs
          tabs={[
            {
              id: 'agent-config',
              label: 'Konfiguracja Agenta',
              content: <AgentConfigForm />,
            },
            {
              id: 'case-steps',
              label: 'Kroki Testowe',
              content: <StepsManagement />,
            },
            {
              id: 'json-preview',
              label: 'Podgląd JSON',
              content: <JsonPreviewWrapper />,
            },
            {
              id: 'api-response',
              label: 'Odpowiedź API',
              content: <ApiResponsePreview 
                apiResponse={apiResponse} 
                apiError={apiError} 
                isLoading={isSubmitting}
                certStatus={certStatus}
              />,
            },
          ]}
          defaultTab={activeTab}
        />

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Proszę poprawić następujące błędy:</p>
              <ul className="mt-1 list-disc list-inside text-sm">
                {errors.agentConfig && (
                  <li>Konfiguracja Agenta: Proszę uzupełnić wszystkie wymagane pola</li>
                )}
                {errors.steps && (
                  <li>Kroki Testowe: {errors.steps.message || 'Proszę dodać co najmniej jeden krok'}</li>
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
              <Save size={18} className="mr-1" /> Zapisz Wersję
            </Button>
            
            <div className="relative">
              <select
                className="h-10 pl-4 pr-8 border border-gray-300 rounded-md bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleLoadConfig}
                defaultValue=""
              >
                <option value="" disabled>Wczytaj Wersję</option>
                {savedConfigs.map((config) => (
                  <option key={config.key} value={config.key}>
                    {config.name}
                  </option>
                ))}
              </select>
              <Upload size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              <Upload size={18} className="mr-1" /> Import JSON
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            Generuj Kod
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Potwierdź Generowanie"
        >
          <p>Czy na pewno chcesz wygenerować kod?</p>
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={() => onSubmit(methods.getValues())}
              isLoading={isSubmitting}
            >
              Potwierdź
            </Button>
          </div>
        </Modal>

        {/* Save Configuration Modal */}
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Zapisz Konfigurację"
        >
          <div className="space-y-4">
            <p>Wprowadź nazwę dla tej konfiguracji:</p>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nazwa konfiguracji"
            />
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveModal(false)}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleSaveConfig}
              disabled={!configName.trim()}
            >
              Zapisz
            </Button>
          </div>
        </Modal>

        {/* Import JSON Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setJsonConfig('');
            setJsonError(null);
          }}
          title="Import JSON"
          className="w-full max-w-3xl"
        >
          <div className="space-y-4">
            <p>Wklej konfigurację JSON poniżej:</p>
            <textarea
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder='{"agentConfig": {...}, "steps": [...]}'
            />
            {jsonError && (
              <div className="text-red-500 text-sm">{jsonError}</div>
            )}
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImportModal(false);
                setJsonConfig('');
                setJsonError(null);
              }}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleImportJson}
            >
              Importuj
            </Button>
          </div>
        </Modal>
      </form>
    </FormProvider>
  );
};

export default TestScenarioForm;
