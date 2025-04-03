/**
 * Validation Configuration
 * This file contains validation schemas and rules used throughout the application.
 */

import { z } from 'zod';

// Parameter validation schema
export const parameterSchema = z.object({
  key: z.string().min(1, 'Parameter key is required'),
  value: z.string().min(1, 'Parameter value is required'),
  isSecret: z.boolean().default(false),
});

// Expected result validation schema
export const expectedResultSchema = z.object({
  description: z.string().min(1, 'Expected result description is required'),
});

// Step validation schema
export const stepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  actionType: z.string().min(1, 'Action type is required'),
  expectedResults: z.array(expectedResultSchema),
  parameters: z.array(parameterSchema),
});

// Agent configuration validation schema
export const agentConfigSchema = z.object({
  // These model fields are optional and can be empty strings
  codeWriterModel: z.string().optional(),
  htmlAssistantModel: z.string().optional(),
  progressCheckerModel: z.string().optional(),
  
  // These fields are still required
  startPageUrl: z.string().url('Please enter a valid URL'),
  projectName: z.string()
    .min(1, 'Project name is required')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Project name must contain only alphanumeric characters, spaces, hyphens, and underscores'),
  scenarioName: z.string()
    .min(1, 'Scenario name is required')
    .regex(/^[a-zA-Z0-9_\- ]+$/, 'Scenario name must contain only alphanumeric characters, spaces, hyphens, and underscores'),
});

// Complete test scenario validation schema
export const testScenarioSchema = z.object({
  agentConfig: agentConfigSchema,
  steps: z.array(stepSchema).min(1, 'At least one step is required'),
});
