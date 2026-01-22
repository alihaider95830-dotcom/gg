# Issues Report and Remediation

This report outlines issues identified in the `opencode_rag` codebase and the steps taken to resolve them.

## `app.py`

### 1. Insecure Default Secret Key
- **Issue:** `app.secret_key` defaulted to a hardcoded string if `FLASK_SECRET_KEY` was missing.
- **Status:** **Fixed**.
- **Remediation:** The application now raises a `ValueError` in production if `FLASK_SECRET_KEY` is not set. A default key is only allowed in development mode.

### 2. Global State Usage
- **Issue:** The RAG pipeline is stored in a global variable (`rag_pipeline`).
- **Status:** **Technical Debt**.
- **Note:** While still using a global variable for simplicity in this Flask app, it is lazy-loaded. For a production refactor, consider using a proper dependency injection system or application factory pattern to handle resources better.

### 3. Broad Exception Handling
- **Issue:** The code caught all exceptions and returned `str(e)` to the client.
- **Status:** **Fixed**.
- **Remediation:** Exception handlers now log the full traceback server-side and return generic error messages to the client to prevent information leakage.

### 4. Lack of CORS and CSRF Protection
- **Issue:** The application lacks CORS and CSRF protection.
- **Status:** **Outstanding**.
- **Recommendation:** Install `flask-cors` and `flask-wtf` to secure the application further.

## `rag_pipeline.py`

### 1. Deprecated OpenAI API Usage
- **Issue:** The code used global `openai.api_base` configuration.
- **Status:** **Fixed**.
- **Remediation:** The code has been refactored to use `openai.OpenAI` client instances, passing the API key and base URL explicitly.

### 2. Heavy Model Initialization
- **Issue:** `CrossEncoder` is loaded during initialization.
- **Status:** **Addressed**.
- **Note:** The model is still loaded in `__init__`, but since the pipeline is lazy-loaded in `app.py`, it won't block the app startup until the first request.

### 3. Potential Prompt Injection
- **Issue:** User input was directly interpolated into the prompt.
- **Status:** **Mitigated**.
- **Remediation:** The code now uses the `messages` list format for Chat APIs, which provides better separation between system instructions and user content.

## `vector_store.py`

### 1. ChromaDB Client Usage
- **Issue:** Potential use of deprecated/ephemeral `chromadb.Client`.
- **Status:** **Fixed**.
- **Remediation:** The code now attempts to use `chromadb.PersistentClient` for reliable persistence in newer ChromaDB versions.
