# AGENTS.md: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality within the Roo Advanced Autonomous AI Development Framework.

## 1. Project Overview & Purpose

*   **Primary Goal:** A revolutionary autonomous AI development framework orchestrating 15+ specialized AI agents to deliver enterprise-grade software across multiple technology stacks with 99% autonomy and minimal human intervention.
*   **Business Domain:** Software Development Automation, AI Orchestration, DevOps Intelligence, Enterprise Software Development.
*   **Target Applications:** The framework is technology-agnostic and agents can develop:
    *   **Web APIs & Backend Services** (Node.js/Express, Django, Java/Spring Boot)
    *   **Frontend Applications** (React/TypeScript SPAs, component-based UIs)
    *   **Mobile Applications** (React Native, cross-platform solutions)
    *   **Full-Stack Web Applications** (React + Node.js, Django + React combinations)
    *   **Enterprise Systems** (Java/Spring Boot microservices, financial systems)
    *   **MVP/Startup Applications** (rapid prototypes, CRM/SaaS platforms)
*   **Key Features:** 
    *   Autonomous orchestration of specialized AI agents (architects, implementers, QA coordinators)
    *   Intelligent conflict resolution through evidence-based decision making
    *   Technology-agnostic pattern matching for optimal stack selection
    *   Built-in quality gates and automated quality assurance across all project types
    *   Security-by-design with dedicated security architecture specialists

## 2. Core Technologies & Stack

### **Framework Infrastructure:**
*   **Languages:** Python 3.8+, JavaScript ES2023, Shell/Bash, YAML, JSON.
*   **Frameworks & Runtimes:** VS Code Extensions API, Node.js 18+ (for MCP server integration), Python standard library.
*   **Databases:** File-based JSON and YAML storage, memory-bank markdown files for persistent intelligence.
*   **Key Libraries/Dependencies:** 
    *   Python: `jsonschema` (validation), `pyyaml` (YAML processing), `pytest` (testing)
    *   Node.js: MCP (Model Context Protocol) servers for external service integration
    *   VS Code: Roo Code Extension v3.25+ (required for autonomous operation)
*   **Package Manager:** pip (Python), npm (Node.js).
*   **Platforms:** Cross-platform (Windows, Linux, macOS) with VS Code dependency, cloud deployment ready.

### **Supported Application Technology Stacks:**
*   **Backend Technologies:** Node.js/Express, Django/Python, Java/Spring Boot, REST APIs, GraphQL
*   **Frontend Technologies:** React, TypeScript, Redux, Material-UI, Vue.js, component-based architectures
*   **Mobile Technologies:** React Native, Expo, Firebase integration, cross-platform development
*   **Databases:** PostgreSQL, MongoDB, Redis, MySQL, cloud databases
*   **Infrastructure:** AWS Lambda, Kubernetes, Docker, Netlify, Vercel, cloud-native deployments
*   **Security & Compliance:** JWT authentication, OAuth, GDPR compliance, SOC 2 readiness, security-by-design

## 3. Architectural Patterns & Structure

*   **Overall Architecture:** Autonomous multi-agent orchestration system with centralized control plane managing workflow coordination, quality gates, and inter-agent communication. Built as a framework for orchestrating external AI services rather than a monolithic application.
*   **Directory Structure Philosophy:**
    *   `/scripts`: Setup, validation, and utility scripts for framework management
    *   `/project`: Project-specific configurations and control files
    *   `/project/{project-name}/control`: Workflow coordination files (YAML/JSON state management)
    *   `/memory-bank`: Persistent organizational intelligence and learning patterns
    *   `/docs`: Documentation, JSON schemas, and MCP server configurations
    *   `/tests`: Unit and integration tests with pytest framework
    *   `/.roomodes`: AI agent mode definitions (15+ specialist roles)
*   **Module Organization:** Project-centric organization with each project having dedicated control files, memory banks, and configuration schemas. Agent definitions are framework-global while project instances are isolated.
*   **Common Patterns & Idioms:**
    *   **Configuration-Driven Architecture:** Heavy reliance on YAML/JSON for workflow state management and agent coordination
    *   **Schema Validation:** JSON Schema validation for all configuration files ensuring consistency and preventing runtime errors
    *   **Agent Orchestration:** Dynamic delegation between specialized AI agents based on capability matching and quality gates
    *   **Quality Gate Pattern:** Automated quality checks with circuit breaker patterns for autonomous operation
    *   **Memory Bank Pattern:** Persistent learning storage enabling cross-project pattern recognition and knowledge transfer
    *   **Async/Await Pattern:** Consistent use of `async/await` for all asynchronous operations instead of Promise chaining
    *   **File-Based State Management:** Inter-agent communication through structured JSON/YAML files rather than in-memory state

## 4. Coding Conventions & Style Guide

*   **Formatting:** 
    *   **JavaScript/TypeScript**: Prettier with 2-space indentation, **single quotes**, trailing commas, no semicolons. Max line length: 100 characters.
    *   **Python**: Follow PEP 8 with Black formatter, 4-space indentation, max line length: 100 characters.
    *   **YAML/JSON**: 2-space indentation for readability and consistency with JavaScript files.
    *   **Shell scripts**: 2-space indentation, clear variable quoting.
*   **Naming Conventions:** 
    *   **JavaScript/TypeScript**: `camelCase` for variables/functions/methods, `PascalCase` for classes/interfaces/components, `UPPER_SNAKE_CASE` for constants
    *   **Python**: `snake_case` for variables/functions/methods/files, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants
    *   **Files**: `kebab-case.js/.ts/.py` for modules, `PascalCase.js/.jsx/.ts/.tsx` for React components
    *   **Project names**: `kebab-case` (e.g., `my-project-name`)
    *   **Agent modes**: `kebab-case` with descriptive prefixes (e.g., `sparc-orchestrator`, `quality-assurance-coordinator`)
*   **API Design:** Framework emphasizes configuration-over-code with declarative YAML/JSON interfaces. Agent interactions are state-driven through file-based communication patterns. APIs should be explicit, idempotent where applicable, and prioritize clear function signatures.
*   **Async Patterns:** **Always use `async/await`** instead of `.then()` chaining for asynchronous operations. This pattern is consistently used throughout the framework for better readability and error handling.
*   **Documentation Style:** 
    *   **JavaScript/TypeScript**: Use JSDoc comments for functions and classes, not `//` inline comments for documentation
    *   **Python**: Use docstrings following PEP 257 conventions
    *   **Configuration files**: Use `#` prefix for inline comments in YAML/JSON
*   **Error Handling:** 
    *   **JavaScript/TypeScript**: Use try-catch blocks with async/await, avoid Promise rejection handlers
    *   **Python**: Use custom exception classes (`ConfigValidationError`) for framework-specific errors
    *   **Configuration**: Schema validation failures should provide specific error messages with file paths and validation details
*   **Forbidden Patterns:**
    *   **NEVER** use `@ts-expect-error` or `@ts-ignore` to suppress TypeScript errors
    *   **DO NOT** use `.then()/.catch()` chaining - use `async/await` instead
    *   **NEVER** use `var` in JavaScript - use `const` or `let`
    *   **DO NOT** use double quotes in JavaScript/TypeScript - use single quotes consistently
    *   **NEVER** commit API keys or secrets to any configuration files

## 5. Key Files & Entrypoints

*   **Main Entrypoint:** Framework is activated through VS Code Roo Extension v3.25+, not direct script execution.
*   **Configuration:** 
    *   `.roomodes`: Agent mode definitions (15+ AI specialists)
    *   `project/{project-name}/control/capabilities.yaml`: Available agents for project
    *   `project/{project-name}/control/workflow-state.json`: Current autonomous workflow status
    *   `project/{project-name}/control/sprint.yaml`: Sprint planning and goals
    *   `docs/contracts/*.schema.json`: JSON Schema validation files
*   **Setup Scripts:** 
    *   `scripts/setup_project.sh`: Interactive project initialization
    *   `scripts/validate_config.py`: Configuration validation and schema checking
*   **CI/CD Pipeline:** No traditional CI/CD - quality is managed through autonomous quality gates and the Quality Assurance Coordinator agent.

## 6. Development & Testing Workflow

*   **Local Development Environment:** 
    1. Install Python 3.8+ and Node.js 18+
    2. Install dependencies: `pip install -r requirements.txt && npm install`
    3. Install VS Code with Roo Code Extension v3.25+
    4. Run `./scripts/setup_project.sh` for new projects
    5. Validate configuration: `python scripts/validate_config.py {project-name}`
*   **Task Configuration:** Projects are managed through autonomous agent orchestration. Human developers interact through VS Code extension interface, not direct task commands.
*   **Testing:** 
    *   Use pytest for Python testing: `python -m pytest tests/`
    *   JavaScript/TypeScript testing follows framework-specific patterns (Jest, Vitest, etc. based on project type)
    *   Configuration validation is automated through `validate_config.py`
    *   Quality gates are autonomous - agents self-validate work quality
    *   Test files follow pattern: `test_*.py` for Python unit tests, `*.test.js/.ts` for JavaScript/TypeScript
    *   **MUST** mock external dependencies - no real external calls during testing
    *   All async operations in tests must use `async/await` pattern consistently
*   **Autonomous Operation:** Framework operates at 99% autonomy. Human intervention primarily for initial project setup and high-level goal setting. Agents collaborate through file-based state management.

## 7. Specific Instructions for AI Collaboration

*   **Agent Collaboration Guidelines:** 
    *   Always validate configuration files using JSON schemas before modifying
    *   When acting as a specialist agent, assess work quality using built-in quality gates
    *   Use evidence-based decision making for conflict resolution between agents
    *   Update workflow-state.json when transitioning between development phases
    *   Log decisions in memory-bank for pattern learning and future reference
*   **Technology Stack Selection:**
    *   Analyze project requirements and context to recommend optimal technology stacks
    *   Consider factors: team size, timeline, complexity, security requirements, deployment environment
    *   Use pattern matching system to apply proven architectural patterns for each stack
    *   Document technology decisions in memory-bank for organizational learning
*   **Application Type Specialization:**
    *   **Web APIs**: Focus on RESTful design, authentication, data validation, error handling
    *   **Frontend Apps**: Emphasize component architecture, state management, responsive design, accessibility
    *   **Mobile Apps**: Prioritize performance, offline functionality, platform-specific guidelines
    *   **Enterprise Systems**: Emphasize security, compliance, scalability, maintainability
    *   **MVP/Prototypes**: Balance speed with code quality, focus on core value propositions
*   **Security:** 
    *   Never commit API keys or secrets to configuration files
    *   Security architecture specialist must review all security-related changes
    *   Validate all external integrations through security review gates
    *   Follow security-by-design principles for all agent implementations
    *   Implement appropriate security patterns based on application type and data sensitivity
*   **Dependencies:** 
    *   New agent capabilities must be defined in `.roomodes` file
    *   Update `capabilities.yaml` when adding new agents to projects
    *   Validate all changes using `python scripts/validate_config.py`
    *   Document new patterns in memory-bank for organizational learning
*   **Commit Messages & Pull Requests:** 
    *   Follow Conventional Commits specification (`feat:`, `fix:`, `docs:`, `config:`)
    *   Include validation results in PR descriptions
    *   Reference affected agent roles and quality gate impacts
    *   Update documentation for any architectural or agent capability changes
*   **Avoidances/Forbidden Actions:** 
    *   **NEVER** modify `.roomodes` without updating corresponding `capabilities.yaml` files
    *   **DO NOT** bypass configuration validation - all changes must pass schema validation
    *   **NEVER** commit project-specific files to framework root (keep in `project/{name}/`)
    *   **DO NOT** hardcode file paths - use relative paths from project context
    *   **NEVER** modify memory-bank schemas without backward compatibility testing
    *   **DO NOT** assume single technology stack - framework supports multiple stacks per project
*   **Quality Gate Compliance:** 
    *   All configuration changes must pass `validate_config.py` validation
    *   Agent mode definitions must include proper self-assessment capabilities
    *   Quality gates define the "finish line" - work is complete only when quality standards are met
    *   Circuit breaker patterns prevent infinite delegation loops between agents
    *   Quality standards must be appropriate for the specific application type being developed
*   **Pattern Learning:** 
    *   Document successful agent collaboration patterns in memory-bank
    *   Record conflict resolution strategies for future reference
    *   Update `delegationPatterns.md` when discovering effective agent workflows
    *   Contribute to `actionable-patterns.md` for auto-applicable improvements
    *   Track successful technology stack combinations and architectural patterns
*   **Project Autonomy:** 
    *   Respect the 99% autonomous operation goal - minimize human intervention needs
    *   Design changes to enhance agent collaboration and reduce manual oversight
    *   Implement quality gates that enable autonomous quality assurance
    *   Focus on configuration-driven solutions over code-heavy implementations
    *   Enable agents to make intelligent technology stack decisions based on project context