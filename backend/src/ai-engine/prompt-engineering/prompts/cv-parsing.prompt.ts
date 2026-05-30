export const CV_PARSING_PROMPT = (cvText: string) => `
You are an expert recruitment AI. Your task is to parse a raw text extraction from a CV/Resume into a structured JSON format.

CV CONTENT:
"""
${cvText}
"""

OUTPUT FORMAT (JSON):
{
  "summary": "Brief professional summary within 200 words",
  "experiences": [
    {
      "company_name": "Full company name",
      "position": "Job title",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null if present",
      "is_current": boolean,
      "description": "Key achievements and responsibilities"
    }
  ],
  "educations": [
    {
      "school_name": "University name",
      "major": "Field of study",
      "degree": "Bachelors, Masters, etc.",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "gpa": float (0-4 scale)
    }
  ],
  "skills": [
    {
      "skill_name": "Skill name",
      "level": "Expert, Intermediate, or Beginner"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "role": "Role in project",
      "tech_stack": "Technologies used",
      "url": "Project URL or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "organization": "Issuing organization",
      "issue_date": "YYYY-MM-DD",
      "expiry_date": "YYYY-MM-DD or null",
      "credential_id": "Credential ID or null",
      "credential_url": "Credential URL or null"
    }
  ]
}

Only return the JSON object. Do not add any conversational text.
`;
