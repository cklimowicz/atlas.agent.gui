import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import StepItem from './StepItem';
import Button from './ui/Button';
import Card from './ui/Card';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { Step } from '../types';

interface StepField extends Step {
  key: string;
}

const StepsManagement: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
    keyName: 'key'
  });
  
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Funkcja bezpiecznego uzyskiwania błędów
  const getErrorMessage = (path: string): string => {
    // Bezpieczne pobieranie zagnieżdżonych wartości błędów
    const pathParts = path.split('.');
    let current: any = errors;
    
    for (const part of pathParts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return '';
      }
    }
    
    return current.message || '';
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    move(sourceIndex, destinationIndex);
  };

  const handleAddStep = () => {
    const newId = uuidv4();
    append({
      id: newId,
      stepNumber: fields.length + 1,
      actionType: '',
      expectedResults: [],
      parameters: []
    });
    // Nowy krok domyślnie rozwinięty
    setExpandedSteps(prev => ({...prev, [newId]: true}));
  };
  
  const handleClearAllSteps = () => {
    // Usunięcie wszystkich kroków
    fields.forEach((_, index) => remove(0));
    setExpandedSteps({});
    setShowClearConfirmModal(false);
  };
  
  const toggleAllSteps = () => {
    const newExpandState = !allExpanded;
    const newExpandedSteps: Record<string, boolean> = {};
    
    fields.forEach(field => {
      const stepField = field as StepField;
      newExpandedSteps[stepField.id] = newExpandState;
    });
    
    setExpandedSteps(newExpandedSteps);
    setAllExpanded(newExpandState);
  };
  
  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newState = {...prev, [stepId]: !prev[stepId]};
      
      // Sprawdź, czy wszystkie kroki są rozwinięte lub zwinięte
      const allSame = Object.values(newState).every(v => v === true) || 
                      Object.values(newState).every(v => v === false);
      
      if (allSame) {
        setAllExpanded(Object.values(newState)[0]);
      }
      
      return newState;
    });
  };

  return (
    <div>
      {/* Dodanie pól konfiguracyjnych w jednej linii */}
      <Card className="mb-4">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-6">
            <Input
              id="startPageUrl"
              label="Start Page URL"
              type="url"
              placeholder="https://example.com"
              error={getErrorMessage('agentConfig.startPageUrl')}
              {...register('agentConfig.startPageUrl')}
              required
            />
          </div>
          <div className="col-span-3">
            <Input
              id="projectName"
              label="Project Name"
              placeholder="My Project"
              error={getErrorMessage('agentConfig.projectName')}
              {...register('agentConfig.projectName')}
              required
            />
          </div>
          <div className="col-span-3">
            <Input
              id="scenarioName"
              label="Test Case"
              placeholder="Login Test"
              error={getErrorMessage('agentConfig.scenarioName')}
              {...register('agentConfig.scenarioName')}
              required
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Case Steps</h2>
        <div className="flex gap-2">
          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowClearConfirmModal(true)}
            >
              <Trash2 size={16} className="mr-1" /> Clear All
            </Button>
          )}
          {fields.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
              onClick={toggleAllSteps}
            >
              {allExpanded ? 
                <><ChevronUp size={16} className="mr-1" /> Collapse All</> : 
                <><ChevronDown size={16} className="mr-1" /> Expand All</>
              }
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={handleAddStep}
          >
            <Plus size={18} className="mr-1" /> Add Step
          </Button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {fields.length === 0 ? (
                <Card className="p-6 text-center text-gray-500">
                  No steps defined. Click "Add Step" to create your first test step.
                </Card>
              ) : (
                fields.map((field, index) => {
                  const stepField = field as StepField;
                  return (
                    <StepItem
                      key={field.key}
                      index={index}
                      stepId={stepField.id}
                      onRemove={() => remove(index)}
                      isExpanded={expandedSteps[stepField.id] !== false}
                      onToggleExpand={() => toggleStep(stepField.id)}
                    />
                  );
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Modal potwierdzenia usunięcia wszystkich kroków */}
      <Modal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        title="Clear All Steps"
      >
        <p>Are you sure you want to remove all steps? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowClearConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleClearAllSteps}
          >
            Clear All Steps
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StepsManagement;
