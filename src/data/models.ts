import { ModelType, ActionType } from '../types';

export const modelOptions: ModelType[] = [
  { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
  { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
  { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
  { name: 'GPT-4o', value: 'gpt-4o' },
  { name: 'GPT-4', value: 'gpt-4' },
  { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
];

export const actionTypes: ActionType[] = [
  { name: 'Navigate', value: 'navigate' },
  { name: 'Click', value: 'click' },
  { name: 'Type', value: 'type' },
  { name: 'Wait', value: 'wait' },
  { name: 'Assert', value: 'assert' },
  { name: 'Custom', value: 'custom' },
];
