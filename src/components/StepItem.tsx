import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Grip, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useFormContext, useFieldArray, FieldErrors } from 'react-hook-form';
import Button from './ui/Button';
import Input from './ui/Input';
import Checkbox from './ui/Checkbox';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { TestScenario } from '../types';
import TextArea from './ui/TextArea';

interface StepItemProps {
  index: number;
  stepId: string;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const StepItem: React.FC<StepItemProps> = ({ index, stepId, onRemove, isExpanded, onToggleExpand }) => {
  const { register, control, formState: { errors }, watch, getValues } = useFormContext<TestScenario>();
  
  // Field arrays for expected results and parameters
  const { fields: expectedResultsFields, append: appendExpectedResult, remove: removeExpectedResult } = 
    useFieldArray({
      control,
      name: `steps.${index}.expectedResults` as const
    });
  
  const { fields: parametersFields, append: appendParameter, remove: removeParameter } = 
    useFieldArray({
      control,
      name: `steps.${index}.parameters` as const
    });

  const actionType = watch(`steps.${index}.actionType`);
  
  // Helper to safely get parameter isSecret value
  const isSecretParameter = (paramIndex: number): boolean => {
    return !!getValues(`steps.${index}.parameters.${paramIndex}.isSecret`);
  };
  
  // Truncate text for header display
  const truncateText = (text: string, maxLength: number = 150): string => {
    if (!text) return 'New Step';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Draggable draggableId={stepId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-2"
        >
          <Card className={`border border-gray-200 ${isExpanded ? 'py-4 px-4' : 'py-2 px-3'}`}>
            <div className={`flex items-center justify-between ${isExpanded ? 'mb-4' : 'mb-0'}`}>
              <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                <div
                  {...provided.dragHandleProps}
                  className="mr-2 cursor-grab flex-shrink-0"
                >
                  <Grip size={isExpanded ? 20 : 16} className="text-gray-400" />
                </div>
                <Badge variant="info" className="mr-2 flex-shrink-0">Step {index + 1}</Badge>
                <h3 className={`${isExpanded ? 'text-lg' : 'text-base'} font-medium truncate flex-1 pr-4`}>
                  {truncateText(actionType)}
                </h3>
              </div>
              <div className="flex items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="p-1 mr-1 text-gray-500 hover:text-gray-700"
                  aria-label={isExpanded ? 'Collapse step' : 'Expand step'}
                >
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label="Remove step"
                >
                  <Trash2 size={isExpanded ? 20 : 18} />
                </button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="space-y-4">
                {/* Action Description */}
                <div className="flex flex-col">
                  <label className="mb-1 font-medium">Action</label>
                  <TextArea
                    id={`steps.${index}.actionType`}
                    placeholder="Describe what this step should do"
                    rows={1}
                    autoExpand={true}
                    error={errors.steps?.[index]?.actionType?.message}
                    {...register(`steps.${index}.actionType`, { required: true })}
                  />
                </div>

                {/* Expected Results Section */}
                {expectedResultsFields.length > 0 && (
                  <div className="space-y-2">
                    {expectedResultsFields.map((field, resultIndex) => (
                      <div key={field.id} className="flex flex-col">
                        {resultIndex === 0 && <label className="mb-1 font-medium">Result</label>}
                        <div className="flex items-start">
                          <TextArea
                            id={`steps.${index}.expectedResults.${resultIndex}.description`}
                            placeholder="Enter expected result"
                            className="flex-1"
                            rows={1}
                            autoExpand={true}
                            error={errors.steps?.[index]?.expectedResults?.[resultIndex]?.description?.message}
                            {...register(`steps.${index}.expectedResults.${resultIndex}.description`)}
                          />
                          <button
                            type="button"
                            onClick={() => removeExpectedResult(resultIndex)}
                            className="p-2 ml-2 text-red-500 hover:text-red-700"
                            aria-label="Remove expected result"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Parameters Section */}
                {parametersFields.length > 0 && (
                  <div className="space-y-3">
                    {parametersFields.map((field, paramIndex) => (
                      <div key={field.id} className="rounded-md border border-gray-200 p-4">
                        {paramIndex === 0 && <label className="block mb-2 font-medium">Parameter</label>}
                        <div className="flex flex-col sm:flex-row items-start gap-2">
                          <div className="flex-1">
                            <Input
                              id={`steps.${index}.parameters.${paramIndex}.key`}
                              placeholder="Parameter name"
                              className="w-full"
                              error={errors.steps?.[index]?.parameters?.[paramIndex]?.key?.message}
                              {...register(`steps.${index}.parameters.${paramIndex}.key`)}
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              id={`steps.${index}.parameters.${paramIndex}.value`}
                              placeholder="Parameter value"
                              className="w-full"
                              type={isSecretParameter(paramIndex) ? 'password' : 'text'}
                              error={errors.steps?.[index]?.parameters?.[paramIndex]?.value?.message}
                              {...register(`steps.${index}.parameters.${paramIndex}.value`)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`steps.${index}.parameters.${paramIndex}.isSecret`}
                              label="Secret"
                              {...register(`steps.${index}.parameters.${paramIndex}.isSecret`)}
                            />
                            <button
                              type="button"
                              onClick={() => removeParameter(paramIndex)}
                              className="p-2 text-red-500 hover:text-red-700"
                              aria-label="Remove parameter"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendExpectedResult({ description: '' })}
                  >
                    <Plus size={16} className="mr-1" /> Add Result
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendParameter({ key: '', value: '', isSecret: false })}
                  >
                    <Plus size={16} className="mr-1" /> Add Parameter
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default StepItem;
