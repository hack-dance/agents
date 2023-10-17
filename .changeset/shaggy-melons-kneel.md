---
"@hackdance/agents": minor
---

Updated the schema agent to use the description value from .describe or { description: ""} in zod vs "message" + added the raw schema checks right into the description - eventually we should map to the right properties in the json schema format, but this at least ensures we are passing through the rules
