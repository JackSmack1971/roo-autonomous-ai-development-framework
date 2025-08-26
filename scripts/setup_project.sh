#!/bin/bash

# ==============================================================================
# Roo Autonomous AI Development Framework - Project Setup Script
# ==============================================================================
#
# Description:
#   This master script automates the initial setup for a new project within
#   the Roo framework, as outlined in the implementation_guide.md. It creates
#   the necessary directory structure, initializes control files with default
#   values, and sets up the memory bank for the autonomous agents.
#
# Usage:
#   ./setup_project.sh
#
# ==============================================================================

# --- Configuration ---
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions ---

# Function to print a formatted header message.
print_header() {
  echo ""
  echo "================================================="
  echo "  $1"
  echo "================================================="
}

# Function to print a success message for a step.
print_success() {
  echo "✅  $1"
}

# --- Main Script ---

print_header "Roo Framework Project Initialization"

# 1. Get Project Name from User
read -p "Enter a name for the new project (e.g., 'new-mobile-app'): " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Error: Project name cannot be empty."
  exit 1
fi

if [ -d "project/$PROJECT_NAME" ]; then
  echo "❌ Error: A project named '$PROJECT_NAME' already exists."
  exit 1
fi

echo "🚀  Starting setup for project: $PROJECT_NAME"

# 2. Create Core Project Directories
print_header "Step 1: Creating Directory Structure"
mkdir -p "project/$PROJECT_NAME/control"
mkdir -p "project/$PROJECT_NAME/src"
mkdir -p "memory-bank" # Ensures memory-bank exists at the root
print_success "Project directories created at project/$PROJECT_NAME"

# Define control file path for easier access
CONTROL_DIR="project/$PROJECT_NAME/control"

# 3. Initialize Control Files
print_header "Step 2: Initializing Control Files"

# --- backlog.yaml ---
cat > "$CONTROL_DIR/backlog.yaml" << EOF
# Product Backlog: List of high-level features and user stories.
# The autonomous system will pull from this list to plan sprints.
version: 1.0
stories:
  - id: USER-001
    title: "Implement User Authentication"
    description: "As a user, I want to be able to sign up and log in, so I can access my account."
    priority: "high"
    status: "todo"
EOF
print_success "Created backlog.yaml"

# --- sprint.yaml ---
cat > "$CONTROL_DIR/sprint.yaml" << EOF
# Sprint Plan: Defines the goal and scope for the current development cycle.
version: 1.0
sprint_id: "SPRINT-01"
goal: "Establish the core application shell and user authentication."
duration_days: 14
start_date: "$(date +'%Y-%m-%d')"
status: "not-started"
EOF
print_success "Created sprint.yaml"

# --- capabilities.yaml ---
cat > "$CONTROL_DIR/capabilities.yaml" << EOF
# Capabilities Registry: Lists the AI agents and their functions available to the system.
version: 1.0
agents:
  - "sparc-orchestrator"
  - "sparc-architect"
  - "sparc-specification-writer"
  - "sparc-pseudocode-designer"
  - "sparc-code-implementer"
  - "sparc-tdd-engineer"
  - "sparc-security-architect"
  - "security-reviewer"
  - "performance-engineer"
  - "integration-specialist"
  - "database-specialist"
  - "code-quality-specialist"
  - "technical-debt-manager"
  - "quality-assurance-coordinator"
  - "rapid-fact-checker"
EOF
print_success "Created capabilities.yaml"

# --- issue-patterns.yaml ---
touch "$CONTROL_DIR/issue-patterns.yaml"
print_success "Created empty issue-patterns.yaml"

# --- quality-dashboard.json ---
cat > "$CONTROL_DIR/quality-dashboard.json" << EOF
{
  "version": "1.0",
  "project_id": "$PROJECT_NAME",
  "overall_quality_score": 1.0,
  "metrics": {
    "code_coverage": 0,
    "maintainability_index": 100,
    "security_vulnerabilities": 0,
    "technical_debt_ratio": 0.0,
    "build_success_rate": 1.0
  },
  "quality_trend": "stable"
}
EOF
print_success "Created quality-dashboard.json"

# --- workflow-state.json ---
cat > "$CONTROL_DIR/workflow-state.json" << EOF
{
  "version": "2.0",
  "project_id": "$PROJECT_NAME",
  "state": "initialization",
  "current_sprint": "SPRINT-01",
  "active_tasks": [],
  "pending_tasks": [],
  "completed_tasks": [],
  "issue_log": [],
  "predictive_insights": {
    "potential_bottlenecks": [],
    "recommended_actions": []
  }
}
EOF
print_success "Created workflow-state.json"

# 4. Initialize Memory Bank Files
print_header "Step 3: Initializing Memory Bank"

# --- decisionLog.md ---
cat > "memory-bank/decisionLog.md" << EOF
# Decision Log

*This log records significant decisions made by the autonomous system, including architectural choices, conflict resolutions, and strategic pivots.*

---
EOF
print_success "Initialized decisionLog.md"

# --- delegationPatterns.md ---
cat > "memory-bank/delegationPatterns.md" << EOF
# Delegation Patterns

*This document stores successful sequences of task delegations and collaborations between AI agents. It serves as a blueprint for efficient workflow execution.*

---
EOF
print_success "Initialized delegationPatterns.md"

# --- learningHistory.md ---
cat > "memory-bank/learningHistory.md" << EOF
# Learning History

*A record of outcomes from various approaches. The system analyzes this history to refine its strategies, avoid repeating mistakes, and improve its predictive capabilities.*

---
EOF
print_success "Initialized learningHistory.md"

# --- productContext.md ---
cat > "memory-bank/productContext.md" << EOF
# Product Context

*This file contains the high-level business goals, target audience, and core value proposition for the project. It provides the 'why' behind the work.*

---
EOF
print_success "Initialized productContext.md"

# --- progress.md ---
cat > "memory-bank/progress.md" << EOF
# Progress Tracker

*A high-level summary of sprint-over-sprint progress, major milestones achieved, and overall project velocity.*

---
EOF
print_success "Initialized progress.md"

# --- systemPatterns.md ---
cat > "memory-bank/systemPatterns.md" << EOF
# System & Architectural Patterns

*A repository of approved architectural patterns, technology stacks, and coding standards for this project.*

---
EOF
print_success "Initialized systemPatterns.md"


# --- Finalization ---
print_header "🎉 Project Setup Complete! 🎉"
echo "Your new project '$PROJECT_NAME' is ready."
echo "Next steps:"
echo "1. Review the generated files in 'project/$PROJECT_NAME/control'."
echo "2. Update 'backlog.yaml' with your specific user stories."
echo "3. Initiate the autonomous workflow."
echo ""
