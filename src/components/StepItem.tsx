import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Grip, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { actionTypes } from '../data/models';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Checkbox from './ui/Checkbox';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface StepItemProps {
  index: number;
  stepId: string;
  onRemove: () => void;
}

const StepItem: React.FC<StepItemProps> = ({ index, stepId, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { register, control, formState: { errors } } = useFormContext();
  
  // Field arrays for expected results and parameters
  const { fields: expectedResultsFields, append: appendExpectedResult, remove: removeExpectedResult } = 
    useFieldArray({
      control,
      name: `steps.${index}.expectedResults`
    });
  
  const { fields: parametersFields, append: appendParameter, remove: removeParameter } = 
    useFieldArray({
      control,
      name: `steps.${index}.parameters`
    });

  return (
    <Draggable draggableId={stepId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-4"
        >
          <Card className="border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                  {...provided.dragHandleProps}
                  className="mr-2 cursor-grab"
                >
                  <Grip size={20} className="text-gray-400" />
                </div>
                <Badge variant="info" className="mr-2">Step {index + 1}</Badge>
                <h3 className="text-lg font-medium">
                  {/* Display action type if selected */}
                  {actionTypes.find(action => 
                    action.value === register(`steps.${index}.actionType`).value
                  )?.name || 'New Step'}
                </h3>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 mr-2 text-gray-500 hover:text-gray-700"
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
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="space-y-4">
                <Select
                  id={`steps.${index}.actionType`}
                  label="Action Type"
                  options={actionTypes}
                  error={errors.steps?.[index]?.actionType?.message as string}
                  {...register(`steps.${index}.actionType`)}
                  required
                />
                
                {/* Expected Results Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Expected Results</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendExpectedResult({ description: '' })}
                    >
                      <Plus size={16} className="mr-1" /> Add Result
                    </Button>
                  </div>
                  
                  {expectedResultsFields.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No expected results defined</p>
                  ) : (
                    <div className="space-y-2">
                      {expectedResultsFields.map((field, resultIndex) => (
                        <div key={field.id} className="flex items-start">
                          <Input
                            id={`steps.${index}.expectedResults.${resultIndex}.description`}
                            placeholder="Enter expected result"
                            className="flex-1"
                            error={errors.steps?.[index]?.expectedResults?.[resultIndex]?.description?.message as string}
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
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Parameters Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Parameters</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendParameter({ key: '', value: '', isSecret: false })}
                    >
                      <Plus size={16} className="mr-1" /> Add Parameter
                    </Button>
                  </div>
                  
                  {parametersFields.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No parameters defined</p>
                  ) : (
                    <div className="space-y-3">
                      {parametersFields.map((field, paramIndex) => (
                        <div key={field.id} className="flex flex-col sm:flex-row items-start gap-2 p-3 border border-gray-200 rounded-md">
                          <Input
                            id={`steps.${index}.parameters.${paramIndex}.key`}
                            placeholder="Parameter name"
                            className="flex-1"
                            error={errors.steps?.[index]?.parameters?.[paramIndex]?.key?.message as string}
                            {...register(`steps.${index}.parameters.${paramIndex}.key`)}
                          />
                          <Input
                            id={`steps.${index}.parameters.${paramIndex}.value`}
                            placeholder="Parameter value"
                            className="flex-1"
                            type={register(`steps.${index}.parameters.${paramIndex}.isSecret`).value ? 'password' : 'text'}
                            error={errors.steps?.[index]?.parameters?.[paramIndex]?.value?.message as string}
                            {...register(`steps.${index}.parameters.${paramIndex}.value`)}
                          />
                          <div className="flex items-center">
                            <Checkbox
                              id={`steps.${index}.parameters.${paramIndex}.isSecret`}
                              label="Secret"
                              {...register(`steps.${index}.parameters.${paramIndex}.isSecret`)}
                            />
                            <button
                              type="button"
                              onClick={() => removeParameter(paramIndex)}
                              className="p-2 ml-2 text-red-500 hover:text-red-700"
                              aria-label="Remove parameter"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
