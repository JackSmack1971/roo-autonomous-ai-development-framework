#!/bin/bash

# ==============================================================================
# Roo Autonomous AI Development Framework - Python Environment Setup
# ==============================================================================
#
# This script sets up the Python environment for the autonomous AI framework
# with proper dependency management, virtual environment configuration,
# and development tool initialization.
#
# Usage:
#   ./setup-python-env.sh [production|development|minimal|all]
#
# Options:
#   production   - Install only production dependencies
#   development  - Install development dependencies (includes production)  
#   minimal      - Install core dependencies without ML/scientific packages (Python 3.13 safe)
#   all         - Install everything with optional dependencies (default)
#
# ==============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Configuration
PYTHON_MIN_VERSION="3.8"
PYTHON_RECOMMENDED="3.11"
VENV_NAME=".venv"
MODE="${1:-all}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}================================================="
    echo -e "  $1"
    echo -e "=================================================${NC}"
}

print_success() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "  ${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "  ${RED}❌ $1${NC}"
}

print_info() {
    echo -e "  ${CYAN}ℹ️ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python version
check_python_version() {
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python ${PYTHON_RECOMMENDED}+ first."
        exit 1
    fi

    local python_version
    python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    
    if ! python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"; then
        print_error "Python ${PYTHON_MIN_VERSION}+ is required. Current version: ${python_version}"
        print_info "Recommended version: Python ${PYTHON_RECOMMENDED}"
        exit 1
    fi

    # Special warning for Python 3.13
    if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)" 2>/dev/null; then
        print_warning "Python 3.13 detected - some packages may need compilation from source"
        print_info "If you encounter numpy/scipy compilation errors:"
        print_info "  1. Try: pip install --only-binary=all -r requirements.txt"
        print_info "  2. Or downgrade to Python 3.11-3.12 for best compatibility"
        print_info "  3. Or install without ML dependencies: MODE=production"
        echo ""
        read -p "Continue with Python 3.13? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Consider using Python 3.11 or 3.12 for optimal compatibility"
            exit 0
        fi
    elif [[ "$python_version" == "$PYTHON_RECOMMENDED" ]]; then
        print_success "Python version: ${python_version} (recommended)"
    else
        print_warning "Python version: ${python_version} (minimum supported, recommend ${PYTHON_RECOMMENDED})"
    fi
}

# Create and activate virtual environment
setup_virtual_environment() {
    print_header "Setting Up Virtual Environment"
    
    if [[ -d "$VENV_NAME" ]]; then
        print_warning "Virtual environment already exists at ${VENV_NAME}"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$VENV_NAME"
            print_info "Removed existing virtual environment"
        else
            print_info "Using existing virtual environment"
        fi
    fi

    if [[ ! -d "$VENV_NAME" ]]; then
        python3 -m venv "$VENV_NAME"
        print_success "Created virtual environment at ${VENV_NAME}"
    fi

    # Activate virtual environment
    source "${VENV_NAME}/bin/activate"
    print_success "Activated virtual environment"

    # Upgrade pip, setuptools, and wheel
    python -m pip install --upgrade pip setuptools wheel
    print_success "Updated core Python packaging tools"
}

# Install dependencies based on mode
install_dependencies() {
    print_header "Installing Dependencies (Mode: ${MODE})"

    # Check if we're on Python 3.13 and adjust strategy
    local use_binary_only=false
    if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)" 2>/dev/null; then
        print_info "Python 3.13 detected - using binary-only installation strategy"
        use_binary_only=true
    fi

    case "$MODE" in
        "production")
            print_info "Installing production dependencies..."
            if $use_binary_only; then
                print_info "Attempting binary-only installation for Python 3.13 compatibility..."
                pip install --only-binary=all -r requirements.txt -c constraints.txt || {
                    print_warning "Binary-only installation failed. Trying with compilation fallback..."
                    pip install -r requirements.txt -c constraints.txt --no-binary=:none: || {
                        print_error "Installation failed. Try with MODE=minimal or use Python 3.11-3.12"
                        exit 1
                    }
                }
            else
                pip install -r requirements.txt -c constraints.txt
            fi
            print_success "Production dependencies installed"
            ;;
        "development")
            print_info "Installing development dependencies (includes production)..."
            if $use_binary_only; then
                print_info "Attempting binary-only installation for Python 3.13 compatibility..."
                pip install --only-binary=all -r requirements-dev.txt -c constraints.txt || {
                    print_warning "Some packages may need compilation. Falling back to mixed installation..."
                    pip install -r requirements-dev.txt -c constraints.txt
                }
            else
                pip install -r requirements-dev.txt -c constraints.txt
            fi
            print_success "Development dependencies installed"
            ;;
        "minimal")
            print_info "Installing minimal dependencies (no ML/scientific packages)..."
            # Create temporary minimal requirements
            python3 -c "
import sys
if sys.version_info >= (3, 13):
    # Skip scientific packages for Python 3.13
    skip_packages = ['numpy', 'pandas', 'scikit-learn', 'matplotlib', 'seaborn', 'plotly']
    with open('requirements.txt', 'r') as f:
        lines = f.readlines()
    with open('requirements-minimal.txt', 'w') as f:
        for line in lines:
            if not any(pkg in line.lower() for pkg in skip_packages) and not line.strip().startswith('#'):
                f.write(line)
            elif line.strip().startswith('#'):
                f.write(line)
else:
    # For older Python versions, use full requirements
    import shutil
    shutil.copy('requirements.txt', 'requirements-minimal.txt')
"
            pip install -r requirements-minimal.txt -c constraints.txt
            rm -f requirements-minimal.txt
            print_success "Minimal dependencies installed"
            ;;
        "all"|*)
            print_info "Installing all dependencies with optional packages..."
            if $use_binary_only; then
                print_warning "Python 3.13 detected. Skipping optional ML packages to avoid compilation issues."
                print_info "For ML features, consider using Python 3.11 or 3.12"
                pip install --only-binary=all -r requirements-dev.txt -c constraints.txt || {
                    pip install -r requirements-dev.txt -c constraints.txt
                }
            else
                pip install -r requirements-dev.txt -c constraints.txt
                
                # Install optional AI/ML packages if requested
                print_info "Installing optional AI/ML packages..."
                pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu || {
                    print_warning "Failed to install PyTorch (CPU). Skipping optional ML dependencies."
                }
            fi
            
            print_success "All dependencies installed"
            ;;
    esac
}

# Setup pre-commit hooks
setup_pre_commit() {
    if [[ "$MODE" == "development" || "$MODE" == "all" ]]; then
        print_header "Setting Up Pre-commit Hooks"
        
        if command_exists pre-commit; then
            pre-commit install
            print_success "Pre-commit hooks installed"
        else
            print_warning "Pre-commit not available. Install development dependencies first."
        fi
    fi
}

# Verify installation
verify_installation() {
    print_header "Verifying Installation"

    # Test core imports
    python -c "
import asyncio
import json
import yaml
import aiofiles
import jsonschema
import httpx
import fastapi
import sqlalchemy
print('✅ Core dependencies verified')
"

    # Test AI provider imports (if available)
    python -c "
try:
    import anthropic
    print('✅ Anthropic client available')
except ImportError:
    print('⚠️ Anthropic client not available (API key may be needed)')

try:
    import openai
    print('✅ OpenAI client available')
except ImportError:
    print('⚠️ OpenAI client not available')
" || true

    # Test development tools (if in development mode)
    if [[ "$MODE" == "development" || "$MODE" == "all" ]]; then
        python -c "
import pytest
import mypy
import ruff
print('✅ Development tools verified')
" || print_warning "Some development tools may not be properly installed"
    fi

    print_success "Installation verification completed"
}

# Generate activation script
generate_activation_script() {
    print_header "Generating Activation Script"

    cat > activate.sh << 'EOF'
#!/bin/bash
# Roo Framework Environment Activation
source .venv/bin/activate
echo "🤖 Roo Autonomous AI Development Framework activated"
echo "Python: $(python --version)"
echo "Virtual Environment: $VIRTUAL_ENV"
echo ""
echo "Available commands:"
echo "  python scripts/validate_config.py <project>     - Validate project configuration"
echo "  python scripts/setup_project.sh                - Create new project"
echo "  python scripts/audit_autonomous_actions.py     - Audit autonomous operations"
echo "  python scripts/generate_sprint_report.py       - Generate sprint reports"
echo ""
echo "To deactivate: deactivate"
EOF

    chmod +x activate.sh
    print_success "Created activation script: ./activate.sh"
}

# Main execution
main() {
    print_header "Roo Autonomous AI Development Framework - Python Setup"
    print_info "Mode: ${MODE}"
    print_info "Target directory: $(pwd)"

    # Check if we're in the right directory
    if [[ ! -f "requirements.txt" ]]; then
        print_error "requirements.txt not found. Are you in the project root directory?"
        exit 1
    fi

    check_python_version
    setup_virtual_environment
    install_dependencies
    setup_pre_commit
    verify_installation
    generate_activation_script

    print_header "🎉 Setup Complete! 🎉"
    print_success "Python environment ready for autonomous AI development"
    print_info "To activate the environment: source activate.sh"
    print_info "To validate setup: python scripts/validate_config.py sample-app"

    # Show next steps
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Activate environment: ${GREEN}source activate.sh${NC}"
    echo "  2. Configure AI API keys in .env file"
    echo "  3. Set up MCP servers in Roo Code extension"
    echo "  4. Initialize your first project: ${GREEN}./scripts/setup_project.sh${NC}"
    echo "  5. Start autonomous development! 🚀"
    echo ""
    if python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)" 2>/dev/null; then
        echo -e "${YELLOW}Python 3.13 Notes:${NC}"
        echo "  • Some ML packages may not be available due to compilation issues"
        echo "  • For full ML support, consider Python 3.11 or 3.12"
        echo "  • Core autonomous AI features work fully on Python 3.13"
        echo ""
    fi
}

# Run main function
main "$@"