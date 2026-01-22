"""
Setup and initialization script for RAG Chatbot.
Helps users get started quickly.
"""
import os
import sys
import subprocess


def print_banner():
    """Print welcome banner."""
    print("=" * 70)
    print("  RAG Chatbot Setup")
    print("  SQuAD Dataset Question Answering System")
    print("=" * 70)
    print()


def check_python_version():
    """Check Python version."""
    print("Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    print()


def check_env_file():
    """Check if .env file exists."""
    print("Checking environment configuration...")
    if os.path.exists(".env"):
        print("✅ .env file found")

        # Check if API key is set
        with open(".env", "r") as f:
            content = f.read()
            if "GOOGLE_API_KEY" in content or "OPENAI_API_KEY" in content or "OPENROUTER_API_KEY" in content:
                print("✅ API key configured")
            else:
                print("⚠️  API key not found in .env")
                print("   Please add your API key to .env file")
    else:
        print("⚠️  .env file not found")
        print("   Creating from .env.example...")
        if os.path.exists(".env.example"):
            import shutil
            shutil.copy(".env.example", ".env")
            print("✅ Created .env file")
            print("   Please edit .env and add your API key")
        else:
            print("❌ .env.example not found")
    print()


def install_dependencies():
    """Install Python dependencies."""
    print("Installing dependencies...")
    print("This may take a few minutes...")
    print()

    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print()
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        print("   Please run manually: pip install -r requirements.txt")
        sys.exit(1)
    print()


def create_directories():
    """Create necessary directories."""
    print("Creating directories...")
    dirs = ["chroma_db", "logs"]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d)
            print(f"✅ Created {d}/")
    print()


def run_quickstart():
    """Ask if user wants to run quickstart."""
    print("=" * 70)
    print("Setup Complete!")
    print("=" * 70)
    print()
    print("Next steps:")
    print()
    print("1. Edit .env file and add your API key (if not already done)")
    print("2. Run quick demo:")
    print("   python quickstart.py")
    print()
    print("3. Start web interface:")
    print("   python app.py")
    print()
    print("4. For production, ingest more data:")
    print("   python ingest.py --config gemini --samples 1000")
    print()

    response = input("Would you like to run the quick demo now? (y/n): ").strip().lower()
    if response in ['y', 'yes']:
        print()
        print("Running quickstart demo...")
        print()
        try:
            subprocess.check_call([sys.executable, "quickstart.py"])
        except subprocess.CalledProcessError:
            print("❌ Quickstart failed")
            print("   Make sure your API key is set in .env")
    else:
        print()
        print("Skipping demo. Run 'python quickstart.py' when ready!")


def main():
    """Main setup function."""
    print_banner()

    # Step 1: Check Python version
    check_python_version()

    # Step 2: Check environment
    check_env_file()

    # Step 3: Install dependencies
    response = input("Install dependencies? (y/n): ").strip().lower()
    if response in ['y', 'yes']:
        install_dependencies()
    else:
        print("Skipping dependency installation")
        print()

    # Step 4: Create directories
    create_directories()

    # Step 5: Next steps
    run_quickstart()


if __name__ == "__main__":
    main()
