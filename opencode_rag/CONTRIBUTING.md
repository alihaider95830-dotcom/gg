# Contributing to RAG Chatbot

Thank you for considering contributing to the RAG Chatbot project!

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Python version, config profile)

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature already exists or is planned
- Describe the use case and expected behavior
- Explain how it improves the project

### Code Contributions

1. **Fork and Clone**
   ```bash
   git fork https://github.com/yourusername/opencode_rag
   git clone https://github.com/yourusername/opencode_rag
   cd opencode_rag
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   pip install pytest pytest-cov  # for testing
   ```

4. **Make Changes**
   - Follow existing code style
   - Add docstrings to new functions
   - Keep functions focused and modular

5. **Add Tests**
   ```bash
   # Add tests in tests/ directory
   # Run tests
   pytest tests/ -v
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add: brief description of changes"
   ```

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## Code Style

- Follow PEP 8 guidelines
- Use meaningful variable names
- Add type hints where appropriate
- Write docstrings for public functions
- Keep lines under 100 characters

## Testing Guidelines

- Write tests for new functionality
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Use fixtures for test setup
- Mock external API calls

## Pull Request Process

1. Ensure tests pass
2. Update README.md if adding features
3. Add your changes to CHANGELOG (if exists)
4. PR will be reviewed by maintainers
5. Address review feedback
6. Once approved, PR will be merged

## Questions?

Open an issue with the "question" label or reach out to the maintainers.

Thank you for contributing!
