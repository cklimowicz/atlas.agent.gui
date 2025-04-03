import React from 'react';
import { useFormContext } from 'react-hook-form';
import { modelOptions } from '../data/models';
import Input from './ui/Input';
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
          label="Code Writer Model"
          options={modelOptions}
          error={errors.agentConfig?.codeWriterModel?.message as string}
          {...register('agentConfig.codeWriterModel')}
          required
        />
        
        <Select
          id="htmlAssistantModel"
          label="HTML Assistant Model"
          options={modelOptions}
          error={errors.agentConfig?.htmlAssistantModel?.message as string}
          {...register('agentConfig.htmlAssistantModel')}
          required
        />
        
        <Select
          id="progressCheckerModel"
          label="Progress Checker Model"
          options={modelOptions}
          error={errors.agentConfig?.progressCheckerModel?.message as string}
          {...register('agentConfig.progressCheckerModel')}
          required
        />
        
        <Input
          id="startPageUrl"
          label="Start Page URL"
          type="url"
          placeholder="https://example.com"
          error={errors.agentConfig?.startPageUrl?.message as string}
          {...register('agentConfig.startPageUrl')}
          required
        />
        
        <Input
          id="projectName"
          label="Project Name"
          placeholder="My Project"
          error={errors.agentConfig?.projectName?.message as string}
          {...register('agentConfig.projectName')}
          required
        />
        
        <Input
          id="scenarioName"
          label="Scenario Name"
          placeholder="Login Test"
          error={errors.agentConfig?.scenarioName?.message as string}
          {...register('agentConfig.scenarioName')}
          required
        />
      </div>
    </Card>
  );
};

export default AgentConfigForm;
