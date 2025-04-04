import React from 'react';
import { useFormContext } from 'react-hook-form';
import { modelOptions } from '../data/models';
import Select from './ui/Select';
import Card from './ui/Card';

const AgentConfigForm: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Agent Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="codeWriterModel"
          label="Code Writer Model (Optional)"
          options={modelOptions}
          error={errors.agentConfig?.codeWriterModel?.message as string}
          helperText="Optional: Select a model or leave empty"
          {...register('agentConfig.codeWriterModel')}
        />
        
        <Select
          id="htmlAssistantModel"
          label="HTML Assistant Model (Optional)"
          options={modelOptions}
          error={errors.agentConfig?.htmlAssistantModel?.message as string}
          helperText="Optional: Select a model or leave empty"
          {...register('agentConfig.htmlAssistantModel')}
        />
        
        <Select
          id="progressCheckerModel"
          label="Progress Checker Model (Optional)"
          options={modelOptions}
          error={errors.agentConfig?.progressCheckerModel?.message as string}
          helperText="Optional: Select a model or leave empty"
          {...register('agentConfig.progressCheckerModel')}
        />
      </div>
    </Card>
  );
};

export default AgentConfigForm;
