# AGENTS.md: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality within the Roo Advanced Autonomous AI Development Framework.

## 1. Project Overview & Purpose

*   **Primary Goal:** A revolutionary autonomous AI development system orchestrating 15+ specialized AI agents to deliver enterprise-grade software with 99% autonomy and minimal human intervention.
*   **Business Domain:** Software Development Automation, AI Orchestration, DevOps Intelligence, Enterprise Software Development.
*   **Key Features:** 
    *   Autonomous orchestration of specialized AI agents (architects, implementers, QA coordinators)
    *   Intelligent conflict resolution through evidence-based decision making
    *   Continuous learning with pattern recognition across projects
    *   Built-in quality gates and automated quality assurance
    *   Security-by-design with dedicated security architecture specialists

## 2. Core Technologies & Stack

*   **Languages:** Python 3.8+, JavaScript ES2023, Shell/Bash, YAML, JSON.
*   **Frameworks & Runtimes:** VS Code Extensions API, Node.js 18+ (for MCP server integration), Python standard library.
*   **Databases:** File-based JSON and YAML storage, memory-bank markdown files for persistent intelligence.
*   **Key Libraries/Dependencies:** 
    *   Python: `jsonschema` (validation), `pyyaml` (YAML processing), `pytest` (testing)
    *   Node.js: MCP (Model Context Protocol) servers for external service integration
    *   VS Code: Roo Code Extension v3.25+ (required for autonomous operation)
*   **Package Manager:** pip (Python), npm (Node.js).
*   **Platforms:** Cross-platform (Windows, Linux, macOS) with VS Code dependency, cloud deployment ready.

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
    *   **Configuration-Driven Architecture:** Heavy reliance on YAML/JSON for workflow state management
    *   **Schema Validation:** JSON Schema validation for all configuration files ensuring consistency
    *   **Agent Orchestration:** Dynamic delegation between specialized AI agents based on capability matching
    *   **Quality Gate Pattern:** Automated quality checks with circuit breaker patterns for autonomous operation
    *   **Memory Bank Pattern:** Persistent learning storage enabling cross-project pattern recognition

## 4. Coding Conventions & Style Guide

*   **Formatting:** Python follows PEP 8 standards. Use 4-space indentation. Shell scripts use 2-space indentation. YAML files use 2-space indentation with explicit structure. JSON files are formatted with proper indentation for readability.
*   **Naming Conventions:** 
    *   Python: `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants
    *   Files: `snake_case.py` for Python, `kebab-case.yaml` for configs, `camelCase.json` for state files
    *   Project names: `kebab-case` (e.g., `my-project-name`)
    *   Agent modes: `kebab-case` with descriptive prefixes (e.g., `sparc-orchestrator`, `quality-assurance-coordinator`)
*   **API Design:** Framework emphasizes configuration-over-code with YAML/JSON interfaces. Agent interactions are state-driven through file-based communication patterns. Quality gates are declarative and schema-validated.
*   **Documentation Style:** Markdown for all documentation with clear headers and actionable instructions. Inline comments in config files use `#` prefix. Code documentation follows standard Python docstring conventions.
*   **Error Handling:** Configuration validation failures should provide specific error messages with file paths and validation details. Use custom exception classes (`ConfigValidationError`) for framework-specific errors.

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
    *   Configuration validation is automated through `validate_config.py`
    *   Quality gates are autonomous - agents self-validate work quality
    *   Test files follow pattern: `test_*.py` for unit tests
*   **Autonomous Operation:** Framework operates at 99% autonomy. Human intervention primarily for initial project setup and high-level goal setting. Agents collaborate through file-based state management.

## 7. Specific Instructions for AI Collaboration

*   **Agent Collaboration Guidelines:** 
    *   Always validate configuration files using JSON schemas before modifying
    *   When acting as a specialist agent, assess work quality using built-in quality gates
    *   Use evidence-based decision making for conflict resolution between agents
    *   Update workflow-state.json when transitioning between development phases
    *   Log decisions in memory-bank for pattern learning and future reference
*   **Security:** 
    *   Never commit API keys or secrets to configuration files
    *   Security architecture specialist must review all security-related changes
    *   Validate all external integrations through security review gates
    *   Follow security-by-design principles for all agent implementations
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
*   **Quality Gate Compliance:** 
    *   All configuration changes must pass `validate_config.py` validation
    *   Agent mode definitions must include proper self-assessment capabilities
    *   Quality gates define the "finish line" - work is complete only when quality standards are met
    *   Circuit breaker patterns prevent infinite delegation loops between agents
*   **Pattern Learning:** 
    *   Document successful agent collaboration patterns in memory-bank
    *   Record conflict resolution strategies for future reference
    *   Update `delegationPatterns.md` when discovering effective agent workflows
    *   Contribute to `actionable-patterns.md` for auto-applicable improvements
*   **Project Autonomy:** 
    *   Respect the 99% autonomous operation goal - minimize human intervention needs
    *   Design changes to enhance agent collaboration and reduce manual oversight
    *   Implement quality gates that enable autonomous quality assurance
    *   Focus on configuration-driven solutions over code-heavy implementations