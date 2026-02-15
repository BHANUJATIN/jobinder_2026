const OpenAI = require('openai');
const env = require('../config/env');

const openai = new OpenAI({ apiKey: env.openai.apiKey });

async function filterJob(job, filterInstructions) {
  if (!filterInstructions) {
    return { passed: true, reason: null };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a job filter assistant. Evaluate if a job matches given criteria. Respond ONLY with valid JSON: {"passed": true/false, "reason": "brief explanation"}',
        },
        {
          role: 'user',
          content: `Job Details:
- Title: ${job.jobTitle}
- Company: ${job.companyName}
- Location: ${job.location}
- Salary: ${job.salaryRange || 'Not specified'}
- Type: ${job.jobType || 'Not specified'}
- Description: ${(job.jobDescription || '').substring(0, 1500)}

Filter Criteria:
${filterInstructions}

Does this job pass the filter?`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const text = response.choices[0].message.content.trim();
    const result = JSON.parse(text);
    return { passed: !!result.passed, reason: result.reason || null };
  } catch (err) {
    console.error('AI filter error:', err.message);
    // On error, let the job pass through
    return { passed: true, reason: 'AI filter error - auto-passed' };
  }
}

async function filterJobs(jobs, filterInstructions) {
  if (!filterInstructions) {
    return jobs.map((job) => ({ ...job, aiFilterPassed: true, aiFilterReason: null }));
  }

  const results = [];
  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < jobs.length; i += 5) {
    const batch = jobs.slice(i, i + 5);
    const filtered = await Promise.all(
      batch.map(async (job) => {
        const result = await filterJob(job, filterInstructions);
        return { ...job, aiFilterPassed: result.passed, aiFilterReason: result.reason };
      })
    );
    results.push(...filtered);
  }

  return results;
}

module.exports = { filterJob, filterJobs };
