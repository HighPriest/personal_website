## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, paraglide, mcp

## Workflow Orchestration

### 1. Plan Mode Default
– Enter plan mode for ANY non-trivial task (3+ steps)
– If something goes sideways, STOP and re-plan immediately
– Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
– Use subagents liberally to keep main context window clean
– One task per subagent for focused execution
– For complex problems, throw more compute at it

### 3. Self-Improvement Loop
– After ANY correction: update tasks/MEMORY.md
– Write rules that prevent the same mistake
– Ruthlessly iterate until mistake rate drops

### 4. Verification Before Done
– Never mark a task complete without proving it works
– Ask yourself: “Would a staff engineer approve this?”
– Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
– Pause and ask “is there a more elegant way?”
– Skip this for simple fixes — don’t over-engineer

### 6. Autonomous Bug Fixing
– When given a bug report: just fix it
– Zero context switching required from the user

## Task Management
1. Plan First: Write plan to tasks/TODO.md
2. Verify Plan: Check in before starting
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to TODO.md
6. Capture Lessons: Update lessons.md after corrections

## Core Principles
– Simplicity First: Make every change as simple as possible
– No Laziness: Find root causes. No temporary fixes
– Minimal Impact: Only touch what’s necessary

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
