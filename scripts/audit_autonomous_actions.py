#!/usr/bin/env python3

# ==============================================================================
# Roo Autonomous AI Development Framework - Autonomous Actions Auditor
# ==============================================================================
#
# Description:
#   This script audits the logs of an autonomous project to detect anomalies
#   that may require human review. It helps identify inefficiencies, loops, or
#   systemic issues that might not be obvious from a standard progress report.
#
# Anomaly Checks Performed:
#   1. High Intervention Rate: Checks if oversight agents (QA, Tech Debt) are
#      creating an excessive number of tasks.
#   2. Task Loops/Churn: Detects if tasks with similar titles are being
#      repeatedly created, suggesting a failure loop.
#
# Usage:
#   python scripts/audit_autonomous_actions.py <project_name>
#
#   Example:
#   python scripts/audit_autonomous_actions.py sample-app
#
# ==============================================================================

import os
import sys
import json
import argparse
from collections import Counter

# --- ANSI Color Codes for Better Output ---
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# --- Auditor Class ---

class ActionsAuditor:
    """Scans project logs for anomalies and generates a report."""

    def __init__(self, project_name, intervention_threshold=3, loop_threshold=2):
        self.project_name = project_name
        self.control_dir = os.path.join("project", project_name, "control")
        self.workflow_file = os.path.join(self.control_dir, "workflow-state.json")
        self.anomalies = []
        
        # --- Thresholds for anomaly detection ---
        self.INTERVENTION_THRESHOLD = intervention_threshold # Max tasks from one oversight agent
        self.LOOP_THRESHOLD = loop_threshold # Max times a similar task can be created

    def run_audit(self):
        """Loads data, runs all checks, and prints the final report."""
        print_header(f"Auditing Autonomous Actions for '{self.project_name}'")
        try:
            if not os.path.exists(self.workflow_file):
                print(f"{Colors.FAIL}❌ Error: workflow-state.json not found.{Colors.ENDC}")
                return

            with open(self.workflow_file, 'r') as f:
                workflow_data = json.load(f)
            
            all_tasks = (workflow_data.get('pending_tasks', []) +
                         workflow_data.get('active_tasks', []) +
                         workflow_data.get('completed_tasks', []))

            if not all_tasks:
                print(f"{Colors.OKGREEN}No tasks found to audit. System is clean.{Colors.ENDC}")
                return

            self._check_high_intervention_rate(all_tasks)
            self._check_task_loops(all_tasks)

            self._print_report()

        except Exception as e:
            print(f"{Colors.FAIL}❌ An unexpected error occurred during the audit: {e}{Colors.ENDC}")
            sys.exit(1)

    def _check_high_intervention_rate(self, all_tasks):
        """Checks for an excessive number of tasks created by oversight agents."""
        oversight_agents = ["quality-assurance-coordinator", "technical-debt-manager"]
        intervention_tasks = [
            task for task in all_tasks 
            if task.get('assigned_to') in oversight_agents or 
               "Remediation:" in task.get('title', '')
        ]
        
        creator_counts = Counter(task.get('assigned_to') for task in intervention_tasks)
        
        for agent, count in creator_counts.items():
            if count > self.INTERVENTION_THRESHOLD:
                self.anomalies.append({
                    "type": "High Intervention Rate",
                    "details": f"Agent '{agent}' has created {count} intervention tasks, exceeding the threshold of {self.INTERVENTION_THRESHOLD}.",
                    "recommendation": "Review this agent's tasks to identify a potential root cause for repeated quality/debt issues."
                })

    def _check_task_loops(self, all_tasks):
        """Checks for tasks with similar titles being created multiple times."""
        # Normalize titles to catch simple loops (e.g., ignoring UUIDs)
        normalized_titles = []
        for task in all_tasks:
            title = task.get('title', '').lower()
            # A simple normalization: remove "remediation:", ids, etc.
            normalized = ' '.join(title.replace('remediation:', '').split()[:4])
            normalized_titles.append(normalized)
            
        title_counts = Counter(normalized_titles)
        
        for title, count in title_counts.items():
            if count > self.LOOP_THRESHOLD:
                self.anomalies.append({
                    "type": "Potential Task Loop",
                    "details": f"A task with a title similar to '{title}...' has been created {count} times, exceeding the threshold of {self.LOOP_THRESHOLD}.",
                    "recommendation": "Investigate why this task is being repeatedly created. It may indicate a persistent failure or a logical loop in the workflow."
                })

    def _print_report(self):
        """Formats and prints the audit findings."""
        print(f"\n{Colors.OKBLUE}{Colors.UNDERLINE}Audit Summary:{Colors.ENDC}")
        if not self.anomalies:
            print(f"  {Colors.OKGREEN}✅ No anomalies detected. System operations appear normal.{Colors.ENDC}")
        else:
            print(f"  {Colors.WARNING}⚠️ Found {len(self.anomalies)} potential anomal{'y' if len(self.anomalies) == 1 else 'ies'}. Human review recommended.{Colors.ENDC}")
            for i, anomaly in enumerate(self.anomalies, 1):
                print(f"\n  --- Anomaly #{i} ---")
                print(f"  {Colors.FAIL}{Colors.BOLD}Type:{Colors.ENDC} {anomaly['type']}")
                print(f"  {Colors.BOLD}Details:{Colors.ENDC} {anomaly['details']}")
                print(f"  {Colors.OKCYAN}{Colors.BOLD}Recommendation:{Colors.ENDC} {anomaly['recommendation']}")
        
        print(f"\n{Colors.HEADER}{Colors.BOLD}===================== End of Audit ====================={Colors.ENDC}\n")

# --- Main Execution ---

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Audit the autonomous actions for a Roo project to find anomalies."
    )
    parser.add_argument(
        "project_name",
        type=str,
        help="The name of the project directory inside the 'project/' folder."
    )
    args = parser.parse_args()

    auditor = ActionsAuditor(args.project_name)
    auditor.run_audit()
