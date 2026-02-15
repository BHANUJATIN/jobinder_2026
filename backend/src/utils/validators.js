const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(255),
  companyName: z.string().max(255).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const folderSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const tableSchema = z.object({
  folderId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  scheduleFrequency: z.enum(['daily', 'weekly', 'monthly']),
  scheduleTime: z.string().optional(),
  scheduleDayOfWeek: z.number().min(0).max(6).optional(),
  scheduleDayOfMonth: z.number().min(1).max(31).optional(),
});

const searchConfigSchema = z.object({
  jobKeywords: z.string().min(1),
  jobLocation: z.string().min(1),
  aiFilterInstructions: z.string().max(2000).optional(),
  includeLinkedin: z.boolean().default(true),
  includeIndeed: z.boolean().default(true),
});

const jobStatusSchema = z.object({
  status: z.enum(['new', 'viewed', 'applied', 'archived', 'rejected']),
});

module.exports = {
  registerSchema,
  loginSchema,
  folderSchema,
  tableSchema,
  searchConfigSchema,
  jobStatusSchema,
};
