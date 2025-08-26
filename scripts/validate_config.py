#!/usr/bin/env python3

# ==============================================================================
# Roo Autonomous AI Development Framework - Configuration Validator
# ==============================================================================
#
# Description:
#   This script validates all critical configuration files for a specified
#   Roo project. It ensures that files exist, are correctly formatted, and
#   adhere to the framework's contracts (schemas). This prevents the
#   autonomous system from starting in an invalid state.
#
# Dependencies:
#   - PyYAML (pip install PyYAML)
#   - jsonschema (pip install jsonschema)
#
# Usage:
#   python scripts/validate_config.py <project_name>
#
#   Example:
#   python scripts/validate_config.py sample-app
#
# ==============================================================================

import os
import sys
import json
import yaml
import argparse
from jsonschema import validate, ValidationError

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

# --- Helper Functions ---

def print_header(message):
    """Prints a formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}================================================={Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}  {message}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}================================================={Colors.ENDC}")

def print_status(message, success=True):
    """Prints a status message with a checkmark or cross."""
    if success:
        print(f"  {Colors.OKGREEN}✅ {message}{Colors.ENDC}")
    else:
        print(f"  {Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_error(message, details=""):
    """Prints a formatted error message."""
    print(f"    {Colors.FAIL}Error: {message}{Colors.ENDC}")
    if details:
        # Indent details for readability
        indented_details = "\n".join(["      " + line for line in str(details).splitlines()])
        print(f"{Colors.WARNING}{indented_details}{Colors.ENDC}")


# --- Validator Class ---

class ConfigValidator:
    """A class to encapsulate the validation logic for a Roo project."""

    def __init__(self, project_name):
        self.project_name = project_name
        self.project_dir = os.path.join("project", project_name)
        self.control_dir = os.path.join(self.project_dir, "control")
        self.schema_dir = os.path.join("docs", "contracts")
        self.errors = 0

    def run_validations(self):
        """Runs all validation checks and returns the final status."""
        print_header(f"Validating Project: {self.project_name}")

        self._validate_file_existence()
        # Stop if core files are missing, as other checks will fail
        if self.errors > 0:
            return False

        self._validate_roomodes()
        self._validate_yaml_files()
        self._validate_json_files()
        self._cross_reference_capabilities()

        return self.errors == 0

    def _check_path(self, path, is_dir=False):
        """Helper to check if a file or directory exists."""
        check = os.path.isdir if is_dir else os.path.isfile
        if not check(path):
            self.errors += 1
            print_status(f"Checking path: {path}", success=False)
            print_error(f"{'Directory' if is_dir else 'File'} not found.")
            return False
        print_status(f"Checking path: {path}", success=True)
        return True

    def _validate_file_existence(self):
        """Checks that all required files and directories exist."""
        print(f"\n{Colors.OKCYAN}--- 1. Validating File & Directory Structure ---{Colors.ENDC}")
        self._check_path(".roomodes")
        self._check_path(self.project_dir, is_dir=True)
        self._check_path(self.control_dir, is_dir=True)
        self._check_path(self.schema_dir, is_dir=True)
        
        # Check control files
        for f in ["backlog.yaml", "sprint.yaml", "capabilities.yaml", "workflow-state.json", "quality-dashboard.json"]:
            self._check_path(os.path.join(self.control_dir, f))
            
        # Check schema files
        for s in ["backlog_v1.schema.json", "workflow_state_v2.schema.json"]:
            self._check_path(os.path.join(self.schema_dir, s))

    def _validate_roomodes(self):
        """Validates the format of the .roomodes file."""
        print(f"\n{Colors.OKCYAN}--- 2. Validating .roomodes File ---{Colors.ENDC}")
        path = ".roomodes"
        try:
            with open(path, 'r') as f:
                content = f.read()
                if not content.strip():
                    self.errors += 1
                    print_status("Checking .roomodes content", success=False)
                    print_error("File is empty.")
                else:
                    print_status("Checking .roomodes content", success=True)
        except Exception as e:
            self.errors += 1
            print_status(f"Reading {path}", success=False)
            print_error(f"Could not read file.", details=e)

    def _validate_yaml_files(self):
        """Parses and validates the structure of YAML files."""
        print(f"\n{Colors.OKCYAN}--- 3. Validating YAML Files ---{Colors.ENDC}")
        # --- capabilities.yaml ---
        path = os.path.join(self.control_dir, "capabilities.yaml")
        try:
            with open(path, 'r') as f:
                data = yaml.safe_load(f)
                if "agents" in data and isinstance(data["agents"], list) and data["agents"]:
                    print_status("Validating capabilities.yaml structure", success=True)
                else:
                    self.errors += 1
                    print_status("Validating capabilities.yaml structure", success=False)
                    print_error("Must contain a non-empty list under the 'agents' key.")
        except yaml.YAMLError as e:
            self.errors += 1
            print_status(f"Parsing {path}", success=False)
            print_error("YAML syntax error.", details=e)

        # --- sprint.yaml ---
        path = os.path.join(self.control_dir, "sprint.yaml")
        try:
            with open(path, 'r') as f:
                data = yaml.safe_load(f)
                required_keys = ["sprint_id", "goal", "status"]
                missing_keys = [key for key in required_keys if key not in data]
                if not missing_keys:
                    print_status("Validating sprint.yaml structure", success=True)
                else:
                    self.errors += 1
                    print_status("Validating sprint.yaml structure", success=False)
                    print_error(f"Missing required keys: {', '.join(missing_keys)}")
        except yaml.YAMLError as e:
            self.errors += 1
            print_status(f"Parsing {path}", success=False)
            print_error("YAML syntax error.", details=e)

    def _validate_json_files(self):
        """Validates JSON files against their defined schemas."""
        print(f"\n{Colors.OKCYAN}--- 4. Validating JSON Files Against Schemas ---{Colors.ENDC}")
        
        validation_map = {
            "workflow-state.json": "workflow_state_v2.schema.json",
            # Add other JSON/schema mappings here
        }

        for data_file, schema_file in validation_map.items():
            data_path = os.path.join(self.control_dir, data_file)
            schema_path = os.path.join(self.schema_dir, schema_file)
            
            try:
                with open(data_path, 'r') as f:
                    data_instance = json.load(f)
                with open(schema_path, 'r') as f:
                    schema = json.load(f)
                
                validate(instance=data_instance, schema=schema)
                print_status(f"Validating {data_file} against {schema_file}", success=True)
            
            except json.JSONDecodeError as e:
                self.errors += 1
                print_status(f"Parsing {data_file}", success=False)
                print_error("JSON syntax error.", details=e)
            except ValidationError as e:
                self.errors += 1
                print_status(f"Validating {data_file} against {schema_file}", success=False)
                print_error("Schema validation failed.", details=e.message)
            except Exception as e:
                self.errors += 1
                print_status(f"Processing {data_file}", success=False)
                print_error("An unexpected error occurred.", details=e)

    def _cross_reference_capabilities(self):
        """Ensures agents in capabilities.yaml are defined in .roomodes."""
        print(f"\n{Colors.OKCYAN}--- 5. Cross-Referencing Agent Capabilities ---{Colors.ENDC}")
        try:
            with open(".roomodes", 'r') as f:
                defined_modes = {line.strip() for line in f if line.strip()}
            
            cap_path = os.path.join(self.control_dir, "capabilities.yaml")
            with open(cap_path, 'r') as f:
                project_caps = yaml.safe_load(f)
            
            project_agents = set(project_caps.get("agents", []))
            
            undefined_agents = project_agents - defined_modes
            
            if not undefined_agents:
                print_status("All project agents are defined in .roomodes", success=True)
            else:
                self.errors += 1
                print_status("All project agents are defined in .roomodes", success=False)
                print_error(f"The following agents in capabilities.yaml are not defined in .roomodes: {', '.join(undefined_agents)}")

        except Exception as e:
            self.errors += 1
            print_status("Cross-referencing capabilities", success=False)
            print_error("Could not perform cross-reference check.", details=e)


# --- Main Execution ---

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Validate the configuration for a Roo Autonomous AI Framework project."
    )
    parser.add_argument(
        "project_name",
        type=str,
        help="The name of the project directory inside the 'project/' folder."
    )
    args = parser.parse_args()

    validator = ConfigValidator(args.project_name)
    is_valid = validator.run_validations()

    if is_valid:
        print_header("✅ Validation Successful ✅")
        print(f"{Colors.OKGREEN}All configuration files for project '{args.project_name}' are valid.{Colors.ENDC}")
        sys.exit(0)
    else:
        print_header("❌ Validation Failed ❌")
        print(f"{Colors.FAIL}Found {validator.errors} error(s) in the configuration for project '{args.project_name}'.{Colors.ENDC}")
        print(f"{Colors.WARNING}Please fix the issues listed above before starting the autonomous system.{Colors.ENDC}")
        sys.exit(1)
