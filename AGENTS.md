<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


---

## AIDD Agent Directives (Auto-appended)

The following directives were added by the AIDD CLI to ensure proper agent behavior.

### Directory Structure

Agents should examine the `ai/*` directory listings to understand the available commands, rules, and workflows.

### Index Files

Each folder in the `ai/` directory contains an `index.md` file that describes the purpose and contents of that folder. Agents can read these index files to learn the function of files in each folder.

**Important:** The `ai/**/index.md` files are auto-generated from frontmatter. Do not create or edit these files manually—they will be overwritten by the pre-commit hook.

### Progressive Discovery

Agents should only consume the root index until they need subfolder contents. For example:
- If the project is Python, there is no need to read JavaScript-specific folders
- Only drill into subfolders when the task requires that specific domain knowledge

### Vision Document Requirement

**Before creating or running any task, agents must first read the vision document (`vision.md`) in the project root.**

### Conflict Resolution

If any conflicts are detected between a requested task and the vision document, agents must ask the user to clarify how to resolve the conflict before proceeding.

### Custom Skills and Configuration

Project-specific customization lives in `aidd-custom/`. Before starting work,
read `aidd-custom/index.md` to discover available project-specific skills,
and read `aidd-custom/config.yml` to load configuration into context.

import aidd-custom/AGENTS.md // settings from this import should override the root AGENTS.md settings
