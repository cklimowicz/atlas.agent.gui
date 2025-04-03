import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import StepItem from './StepItem';
import Button from './ui/Button';
import Card from './ui/Card';

const StepsManagement: React.FC = () => {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
    keyName: 'key'
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    move(sourceIndex, destinationIndex);
  };

  const handleAddStep = () => {
    append({
      id: uuidv4(),
      stepNumber: fields.length + 1,
      actionType: '',
      expectedResults: [],
      parameters: []
    });
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Case Steps</h2>
        <Button 
          type="button" 
          onClick={handleAddStep}
          variant="primary"
        >
          <Plus size={18} className="mr-1" /> Add Step
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No steps added yet</p>
          <Button 
            type="button" 
            onClick={handleAddStep}
            variant="outline"
          >
            <Plus size={18} className="mr-1" /> Add Your First Step
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {fields.map((field, index) => (
                  <StepItem
                    key={field.key}
                    index={index}
                    stepId={field.id}
                    onRemove={() => remove(index)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Card>
  );
};

export default StepsManagement;
