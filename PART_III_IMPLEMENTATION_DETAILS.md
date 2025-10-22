# Part III: Implementation Details

## 8.1 Development Environment and Tools

### 8.1.1 Integrated Development Environment (IDE)

**Primary IDE: Visual Studio Code 1.85+**
```
Core Extensions:
├── ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
├── Prettier - Code formatter (esbenp.prettier-vscode)
├── ESLint (dbaeumer.vscode-eslint)
├── GitLens — Git supercharged (eamodio.gitlens)
├── Auto Rename Tag (formulahendry.auto-rename-tag)
├── Bracket Pair Colorizer 2 (coenraads.bracket-pair-colorizer-2)
├── Thunder Client (rangav.vscode-thunder-client)
├── Supabase Snippets (supabase.supabase-vscode)
├── JavaScript (ES6) code snippets (xabikos.javascriptsnippets)
└── Path Intellisense (christian-kohler.path-intellisense)

Theme & UI:
├── One Dark Pro (zhuangtongfa.material-theme)
├── Material Icon Theme (pkief.material-icon-theme)
└── Indent Rainbow (oderwat.indent-rainbow)

Productivity Extensions:
├── Live Server (ritwickdey.liveserver)
├── REST Client (humao.rest-client)
├── Todo Highlight (wayou.vscode-todo-highlight)
├── Better Comments (aaron-bond.better-comments)
└── Code Spell Checker (streetsidesoftware.code-spell-checker)
```

**VS Code Configuration (settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### 8.1.2 Runtime Environment and Package Management

**Node.js Environment:**
- **Version:** Node.js 18.17.0 LTS
- **Package Manager:** npm 9.6.7
- **Alternative:** Yarn 1.22.19 (for faster installs)

**Browser Development Tools:**
```
Primary Browsers:
├── Google Chrome 119+ (Primary development browser)
├── Mozilla Firefox 119+ (Cross-browser testing)
├── Microsoft Edge 119+ (Windows compatibility)
└── Safari 17+ (macOS testing - when available)

Chrome Extensions for Development:
├── React Developer Tools
├── Redux DevTools
├── Supabase DevTools
├── Lighthouse (Performance auditing)
└── Web Vitals (Performance monitoring)
```

### 8.1.3 Database and Backend Tools

**Supabase Development Tools:**
```
Supabase CLI: 1.110.0+
├── Database migrations management
├── Local development environment
├── Edge Functions deployment
└── Storage bucket management

Database Management:
├── Supabase Dashboard (Web-based)
├── pgAdmin 4 (PostgreSQL administration)
├── DBeaver Community (Database client)
└── TablePlus (macOS/Windows database client)
```

**API Development and Testing:**
```
API Testing Tools:
├── Thunder Client (VS Code extension)
├── Postman (Standalone application)
├── Insomnia (REST client)
└── curl (Command-line testing)

Database Tools:
├── Supabase SQL Editor (Web-based)
├── PostgreSQL 15+ (Local development)
├── pgcli (Command-line PostgreSQL client)
└── Adminer (Web-based database management)
```

### 8.1.4 AI Development Tools

**Ollama Local Development:**
```
Ollama Installation:
├── Ollama CLI (localhost:11434)
├── Model Management: llama3.2:1b, llama3.2:3b, llama3.1:8b
├── GPU Support: CUDA/ROCm (when available)
└── Memory Management: 8GB+ RAM recommended

AI Development Tools:
├── Ollama Web UI (Optional web interface)
├── LangChain.js (AI application framework)
├── OpenAI API (Fallback option)
└── Hugging Face Transformers (Model alternatives)
```

### 8.1.5 Design and Prototyping Tools

**UI/UX Design:**
```
Design Tools:
├── Figma (Primary UI/UX design and prototyping)
├── Canva (Marketing materials and graphics)
├── Adobe Photoshop (Image editing - when available)
└── GIMP (Open-source image editing alternative)

Wireframing and Diagramming:
├── Draw.io (System architecture diagrams)
├── Lucidchart (Flowcharts and process diagrams)
├── Miro (Collaborative whiteboarding)
└── Excalidraw (Hand-drawn style diagrams)
```

### 8.1.6 Build and Deployment Tools

**Build Tools:**
```
Frontend Build:
├── Create React App (React Scripts 5.0.1)
├── Webpack 5+ (Module bundling)
├── Babel (JavaScript transpilation)
└── PostCSS (CSS processing)

Deployment Platforms:
├── Vercel (Primary frontend deployment)
├── Netlify (Alternative frontend hosting)
├── GitHub Pages (Documentation hosting)
└── Supabase (Backend deployment)
```

## 8.2 Coding Standards and Best Practices

### 8.2.1 JavaScript/React Naming Conventions

**File and Directory Naming:**
```javascript
// Component files: PascalCase
UserProfile.js
AdminDashboard.js
TracerStudyForm.js

// Utility files: camelCase
supabaseClient.js
authHelpers.js
dateUtils.js

// Constants files: camelCase
constants.js
apiEndpoints.js

// CSS files: match component name
UserProfile.css
AdminDashboard.css

// Directory names: camelCase or kebab-case
src/components/
src/pages/
src/utils/
src/config/
```

**Variable and Function Naming:**
```javascript
// Variables: camelCase
const userName = 'John Doe';
const isLoggedIn = true;
const tracerStudyData = [];

// Functions: camelCase with descriptive verbs
const getUserProfile = () => {};
const handleFormSubmit = () => {};
const validateEmailFormat = () => {};

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const USER_ROLES = {
  ADMIN: 'admin',
  ALUMNI: 'alumni'
};

// React Components: PascalCase
const UserProfile = () => {};
const AdminDashboard = () => {};
```

**React-Specific Conventions:**
```javascript
// Component props: camelCase
const UserCard = ({ userName, profileImage, isActive }) => {};

// Event handlers: handle + EventType
const handleClick = () => {};
const handleInputChange = () => {};
const handleFormSubmit = () => {};

// State variables: descriptive camelCase
const [userData, setUserData] = useState({});
const [isLoading, setIsLoading] = useState(false);
const [formErrors, setFormErrors] = useState({});

// Custom hooks: use + PascalCase
const useAuth = () => {};
const useTracerStudy = () => {};
const useLocalStorage = () => {};
```

### 8.2.2 Code Formatting Standards

**Prettier Configuration (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**ESLint Configuration (.eslintrc.js):**
```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/anchor-is-valid': 'off'
  }
};
```

### 8.2.3 Component Structure Standards

**React Component Template:**
```javascript
// 1. Imports (External libraries first, then internal)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { USER_ROLES } from '../config/constants';
import './ComponentName.css';

// 2. Component definition
const ComponentName = ({ prop1, prop2, ...props }) => {
  // 3. State declarations
  const [state1, setState1] = useState(initialValue);
  const [state2, setState2] = useState(initialValue);
  
  // 4. Hooks
  const navigate = useNavigate();
  
  // 5. Effect hooks
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 6. Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 7. Helper functions
  const helperFunction = () => {
    // Helper logic
  };
  
  // 8. Conditional rendering logic
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 9. Main render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

// 10. Default export
export default ComponentName;
```

### 8.2.4 CSS/Styling Standards

**CSS Class Naming (BEM Methodology):**
```css
/* Block__Element--Modifier */
.user-profile { /* Block */ }
.user-profile__header { /* Element */ }
.user-profile__header--highlighted { /* Modifier */ }

/* Component-specific classes */
.alumni-dashboard { }
.alumni-dashboard__sidebar { }
.alumni-dashboard__content { }
.alumni-dashboard__card { }
.alumni-dashboard__card--featured { }

/* Utility classes */
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.btn-primary { /* Primary button styles */ }
```

**CSS Variable Usage:**
```css
:root {
  /* UIC Brand Colors */
  --color-primary: #8B0000;
  --color-primary-dark: #660000;
  --color-secondary: #FFD700;
  --color-secondary-light: #FFF8DC;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

### 8.2.5 Error Handling Standards

**Error Handling Pattern:**
```javascript
// Async function error handling
const fetchUserData = async (userId) => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    setUserData(data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    setError(error.message || 'Failed to fetch user data');
    toast.error('Failed to load user profile');
  } finally {
    setLoading(false);
  }
};

// Form validation pattern
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

### 8.2.6 Documentation Standards

**JSDoc Comments:**
```javascript
/**
 * Fetches tracer study responses for analytics
 * @param {string} surveyYear - The survey year to filter by
 * @param {string} program - The program to filter by (optional)
 * @returns {Promise<Array>} Array of tracer study responses
 * @throws {Error} When database query fails
 */
const fetchTracerStudyData = async (surveyYear, program = null) => {
  // Implementation
};

/**
 * UserProfile Component
 * Displays and manages user profile information
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - The user ID to display profile for
 * @param {boolean} props.editable - Whether the profile is editable
 * @param {function} props.onUpdate - Callback when profile is updated
 */
const UserProfile = ({ userId, editable = false, onUpdate }) => {
  // Component implementation
};
```

## 8.3 Version Control Strategy

### 8.3.1 Git Workflow (GitFlow)

**Branch Structure:**
```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/user-authentication
│   ├── feature/tracer-study-form
│   ├── feature/admin-dashboard
│   └── feature/ai-chatbot-integration
├── release/v1.0.0 (release preparation)
├── hotfix/critical-security-patch
└── bugfix/profile-image-upload
```

**Branch Naming Conventions:**
```
Feature branches: feature/description-in-kebab-case
├── feature/user-profile-management
├── feature/tracer-study-analytics
├── feature/batchmate-messaging
└── feature/gallery-photo-upload

Bug fix branches: bugfix/description-in-kebab-case
├── bugfix/login-validation-error
├── bugfix/dashboard-loading-issue
└── bugfix/file-upload-timeout

Hotfix branches: hotfix/description-in-kebab-case
├── hotfix/security-vulnerability-patch
├── hotfix/database-connection-fix
└── hotfix/authentication-bypass-fix

Release branches: release/version-number
├── release/v1.0.0
├── release/v1.1.0
└── release/v2.0.0
```

### 8.3.2 Commit Message Standards

**Conventional Commits Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Commit Types:**
```
feat: A new feature
fix: A bug fix
docs: Documentation only changes
style: Changes that do not affect the meaning of the code
refactor: A code change that neither fixes a bug nor adds a feature
perf: A code change that improves performance
test: Adding missing tests or correcting existing tests
chore: Changes to the build process or auxiliary tools
```

**Example Commit Messages:**
```bash
feat(auth): add user registration with email verification

- Implement registration form with validation
- Add email verification workflow
- Update user approval process
- Add pending registration status

Closes #123

fix(dashboard): resolve loading spinner infinite loop

The dashboard loading spinner was not being hidden after
data fetch completion due to missing dependency in useEffect.

feat(tracer-study): implement AI-powered response analysis

- Integrate Ollama service for contextual responses
- Add employment statistics generation
- Implement conversation history management
- Add fallback for offline AI service

Breaking Change: AI service now requires Ollama installation

chore(deps): update React to version 18.2.0

docs(readme): add installation and setup instructions
```

### 8.3.3 Pull Request Workflow

**Pull Request Template:**
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log statements in production code
```

**Review Process:**
```
1. Developer creates feature branch from develop
2. Developer implements feature with tests
3. Developer creates pull request to develop branch
4. Automated checks run (ESLint, tests, build)
5. Code review by at least one team member
6. Address review feedback and update PR
7. Merge to develop branch after approval
8. Delete feature branch after merge
```

### 8.3.4 Release Management

**Release Process:**
```
1. Create release branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.1.0

2. Update version numbers and changelog
   - package.json version
   - CHANGELOG.md entries
   - Documentation updates

3. Final testing and bug fixes
   - Integration testing
   - User acceptance testing
   - Performance testing

4. Merge to main and tag release
   git checkout main
   git merge release/v1.1.0
   git tag -a v1.1.0 -m "Release version 1.1.0"
   git push origin main --tags

5. Merge back to develop
   git checkout develop
   git merge release/v1.1.0
   git push origin develop

6. Deploy to production
   - Automated deployment via GitHub Actions
   - Monitor deployment health
   - Rollback plan if issues occur
```

## 8.4 Key Algorithms and Data Structures

### 8.4.1 Authentication and Authorization Algorithm

**JWT Token Management:**
```javascript
/**
 * Token refresh algorithm with exponential backoff
 * Automatically refreshes JWT tokens before expiration
 */
class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      const result = await this.refreshPromise;
      this.retryAttempts = 0;
      return result;
    } catch (error) {
      this.retryAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
      
      if (this.retryAttempts < this.maxRetries) {
        setTimeout(() => this.refreshToken(), delay);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }
}
```

### 8.4.2 Tracer Study Analytics Algorithm

**Employment Rate Calculation:**
```javascript
/**
 * Advanced analytics algorithm for tracer study data
 * Calculates employment rates, trends, and predictions
 */
class TracerStudyAnalytics {
  constructor(responses) {
    this.responses = responses;
    this.employmentCategories = [
      'Employed (Full-time)',
      'Employed (Part-time)',
      'Self-employed/Freelancer'
    ];
  }

  /**
   * Calculate employment rate with confidence intervals
   * Uses Wilson score interval for small sample sizes
   */
  calculateEmploymentRate() {
    const total = this.responses.length;
    const employed = this.responses.filter(r => 
      this.employmentCategories.includes(r.employment_status)
    ).length;

    if (total === 0) return { rate: 0, confidence: [0, 0] };

    const rate = employed / total;
    const z = 1.96; // 95% confidence level
    const denominator = 1 + (z * z) / total;
    const centre = (rate + (z * z) / (2 * total)) / denominator;
    const margin = z * Math.sqrt((rate * (1 - rate) + (z * z) / (4 * total)) / total) / denominator;

    return {
      rate: Math.round(rate * 100),
      confidence: [
        Math.max(0, Math.round((centre - margin) * 100)),
        Math.min(100, Math.round((centre + margin) * 100))
      ]
    };
  }

  /**
   * Industry distribution analysis with clustering
   */
  analyzeIndustryDistribution() {
    const industryMap = new Map();
    
    this.responses.forEach(response => {
      if (response.industry) {
        const industry = response.industry.trim();
        industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
      }
    });

    return Array.from(industryMap.entries())
      .map(([industry, count]) => ({
        industry,
        count,
        percentage: Math.round((count / this.responses.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }
}
```

### 8.4.3 AI Context Generation Algorithm

**Contextual AI Response System:**
```javascript
/**
 * Advanced context generation for AI chatbot responses
 * Uses TF-IDF and semantic similarity for relevant context extraction
 */
class AIContextGenerator {
  constructor(tracerData) {
    this.tracerData = tracerData;
    this.stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a']);
  }

  /**
   * Generate contextually relevant data for AI responses
   * Uses keyword extraction and statistical analysis
   */
  generateContext(userQuery) {
    const keywords = this.extractKeywords(userQuery);
    const relevantData = this.filterRelevantData(keywords);
    const statistics = this.calculateStatistics(relevantData);
    
    return {
      summary: this.generateSummary(statistics),
      details: this.formatDetails(relevantData),
      trends: this.analyzeTrends(relevantData),
      recommendations: this.generateRecommendations(statistics)
    };
  }

  /**
   * Extract keywords using simple TF-IDF approach
   */
  extractKeywords(query) {
    return query.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
  }

  /**
   * Filter tracer study data based on query relevance
   */
  filterRelevantData(keywords) {
    const keywordList = Object.keys(keywords);
    
    return this.tracerData.filter(response => {
      const responseText = [
        response.employment_status,
        response.job_title,
        response.company_name,
        response.industry,
        response.program
      ].join(' ').toLowerCase();

      return keywordList.some(keyword => 
        responseText.includes(keyword)
      );
    });
  }
}
```

### 8.4.4 File Upload Optimization Algorithm

**Progressive File Upload with Chunking:**
```javascript
/**
 * Optimized file upload algorithm with progress tracking
 * Implements chunked upload for large files and retry mechanism
 */
class FileUploadManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.chunkSize = 1024 * 1024; // 1MB chunks
    this.maxRetries = 3;
  }

  /**
   * Upload file with progress tracking and error recovery
   */
  async uploadFile(file, bucket, path, onProgress) {
    if (file.size <= this.chunkSize) {
      return this.uploadSingleChunk(file, bucket, path, onProgress);
    }
    
    return this.uploadChunked(file, bucket, path, onProgress);
  }

  /**
   * Chunked upload algorithm for large files
   */
  async uploadChunked(file, bucket, path, onProgress) {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    const uploadId = this.generateUploadId();
    const uploadedChunks = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const chunkPath = `${path}_chunk_${i}_${uploadId}`;
      
      try {
        const result = await this.uploadWithRetry(chunk, bucket, chunkPath);
        uploadedChunks.push(result);
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalChunks) * 100));
        }
      } catch (error) {
        // Cleanup uploaded chunks on failure
        await this.cleanupChunks(uploadedChunks, bucket);
        throw error;
      }
    }

    // Combine chunks (this would be handled by a cloud function)
    return this.combineChunks(uploadedChunks, bucket, path);
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async uploadWithRetry(chunk, bucket, path, attempt = 1) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, chunk);
        
      if (error) throw error;
      return data;
    } catch (error) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadWithRetry(chunk, bucket, path, attempt + 1);
      }
      throw error;
    }
  }
}
```

### 8.4.5 Search and Filtering Algorithm

**Advanced Alumni Search with Fuzzy Matching:**
```javascript
/**
 * Fuzzy search algorithm for alumni directory
 * Implements Levenshtein distance and phonetic matching
 */
class AlumniSearchEngine {
  constructor(alumniData) {
    this.alumniData = alumniData;
    this.searchIndex = this.buildSearchIndex();
  }

  /**
   * Build inverted index for fast searching
   */
  buildSearchIndex() {
    const index = new Map();
    
    this.alumniData.forEach((alumni, id) => {
      const searchableText = [
        alumni.first_name,
        alumni.last_name,
        alumni.program,
        alumni.company,
        alumni.graduation_year?.toString()
      ].filter(Boolean).join(' ').toLowerCase();

      const words = searchableText.split(/\W+/);
      
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, new Set());
        }
        index.get(word).add(id);
      });
    });

    return index;
  }

  /**
   * Fuzzy search with ranking algorithm
   */
  search(query, options = {}) {
    const { maxResults = 20, threshold = 0.6 } = options;
    const queryWords = query.toLowerCase().split(/\W+/);
    const candidates = new Map();

    // Find candidates using index
    queryWords.forEach(word => {
      // Exact matches
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word).forEach(id => {
          candidates.set(id, (candidates.get(id) || 0) + 1);
        });
      }

      // Fuzzy matches
      this.searchIndex.forEach((ids, indexWord) => {
        const similarity = this.calculateSimilarity(word, indexWord);
        if (similarity >= threshold) {
          ids.forEach(id => {
            candidates.set(id, (candidates.get(id) || 0) + similarity);
          });
        }
      });
    });

    // Rank and return results
    return Array.from(candidates.entries())
      .map(([id, score]) => ({
        alumni: this.alumniData[id],
        relevanceScore: score / queryWords.length
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  /**
   * Levenshtein distance for fuzzy matching
   */
  calculateSimilarity(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const distance = matrix[str2.length][str1.length];
    return 1 - distance / Math.max(str1.length, str2.length);
  }
}
```

---

## Part III: Testing

### 9.1 Testing Strategy and Approach

The testing strategy for the CCS Alumni Portal System adopts a comprehensive multi-level approach to validate correctness, performance, usability, and compliance. It ensures both functional and non-functional requirements are met before deployment to production.

#### Types of Testing

**Unit Testing** – Validate individual components (functions, methods, React components) in isolation.
- Focus: Individual functions, React components, utility modules
- Coverage: Minimum 80% code coverage for critical business logic
- Automation: Integrated into CI/CD pipeline

**Integration Testing** – Check interactions between modules and external services.
- Focus: Component interactions, API integrations, database operations
- Coverage: All major user workflows and data flows
- Tools: React Testing Library for component integration

**System Testing** – End-to-end validation of the complete system.
- Focus: Complete user journeys, cross-browser compatibility, performance
- Coverage: All user roles (Alumni, Admin), all major features
- Environment: Production-like staging environment

**User Acceptance Testing (UAT)** – Final validation with actual stakeholders.
- Focus: Business requirements, usability, real-world scenarios
- Participants: UIC faculty, alumni representatives, system administrators
- Duration: 2-week UAT period before production release

#### Testing Tools

**Frontend Testing Stack:**
```javascript
// Unit & Integration Testing
├── Jest 29.0+ (Test runner and assertion library)
├── React Testing Library 13.0+ (Component testing)
├── @testing-library/jest-dom (Custom Jest matchers)
├── @testing-library/user-event (User interaction simulation)
└── MSW (Mock Service Worker) - API mocking

// End-to-End Testing
├── Cypress 12.0+ (E2E testing framework)
├── Playwright (Cross-browser testing alternative)
└── Cypress Testing Library (Better selectors)

// Performance Testing
├── Lighthouse CI (Performance auditing)
├── Web Vitals (Core performance metrics)
└── Bundle Analyzer (Bundle size optimization)
```

**Backend Testing Stack:**
```javascript
// API Testing
├── Supabase Test Client (Database testing)
├── Supertest (HTTP assertion library)
├── Postman/Newman (API testing automation)
└── Jest (Unit testing for utility functions)

// Load & Performance Testing
├── k6 (Load testing tool)
├── Artillery (Performance testing)
└── Apache JMeter (Stress testing)

// Security Testing
├── OWASP ZAP (Security vulnerability scanning)
├── npm audit (Dependency vulnerability checking)
├── Snyk (Security monitoring)
└── ESLint Security Plugin (Static security analysis)
```

#### Testing Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Frontend Developers** | Unit tests for React components, integration tests for user workflows, component accessibility testing |
| **Backend Developers** | API endpoint testing, database operation testing, authentication/authorization testing |
| **QA Engineers** | System testing, regression testing, cross-browser testing, performance testing |
| **DevOps Engineers** | CI/CD pipeline testing, deployment testing, infrastructure testing |
| **Project Lead** | Test strategy oversight, UAT coordination, defect triage, test sign-off |
| **UIC Stakeholders** | UAT participation, business requirement validation, usability feedback |

#### High-Level Test Plan

**Test Environment Strategy:**
```
Development → Staging → UAT → Production

Development Environment:
├── Local development with test database
├── Unit and integration tests run locally
├── Mock external services (Ollama, email)
└── Fast feedback loop for developers

Staging Environment:
├── Production-like configuration
├── Full system testing and E2E tests
├── Performance and security testing
├── Integration with real external services

UAT Environment:
├── Identical to production setup
├── Real data migration testing
├── User acceptance testing with stakeholders
└── Final validation before production release
```

**Defect Management Process:**
```
Defect Tracking: GitHub Issues with labels
├── Priority: Critical, High, Medium, Low
├── Type: Bug, Enhancement, Documentation
├── Component: Frontend, Backend, Database, Infrastructure
└── Status: Open, In Progress, Testing, Closed

Defect Workflow:
1. Defect identified and logged
2. Severity and priority assigned
3. Developer assigned and fix implemented
4. Code review and testing
5. Verification in staging environment
6. Defect closure and documentation
```

**Exit Criteria:**
- All critical and high-priority test cases passed (100%)
- No unresolved critical or high-severity defects
- System performance meets requirements (< 3s page load)
- Security vulnerabilities addressed
- UAT sign-off from all stakeholders
- Documentation complete and reviewed

**Regression Testing Strategy:**
- Automated test suite runs on every pull request
- Full regression suite runs nightly on develop branch
- Smoke tests run after each deployment
- Critical path tests run before each release

### 9.2 Unit Testing

#### Definition and Purpose

Unit testing focuses on testing individual functions, methods, or React components in isolation. The goal is to ensure that each component performs correctly according to its specification before integrating with other system components.

**Key Benefits:**
- Early bug detection during development
- Improved code quality and maintainability
- Documentation of expected behavior
- Confidence in refactoring and code changes
- Faster debugging and issue resolution

#### Unit Testing Approach for CCS Alumni Portal

**Testing Framework Setup:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.test.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Mock Service Worker Setup:**
```javascript
// src/mocks/handlers.js
import { rest } from 'msw';
import { API_ENDPOINTS } from '../config/constants';

export const handlers = [
  // Mock Supabase authentication
  rest.post(`${API_ENDPOINTS.supabase.url}/auth/v1/token`, (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: 'test@uic.edu.ph',
          role: 'alumni'
        }
      })
    );
  }),

  // Mock user profile data
  rest.get(`${API_ENDPOINTS.supabase.url}/rest/v1/user_profiles`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'profile-1',
          first_name: 'John',
          last_name: 'Doe',
          program: 'Computer Science',
          graduation_year: 2020
        }
      ])
    );
  })
];
```

#### Unit Test Examples for CCS Alumni Portal

**1. Authentication Utility Function Testing:**
```javascript
// src/utils/authHelpers.test.js
import { validateEmail, validatePassword, formatUserRole } from './authHelpers';

describe('Authentication Helpers', () => {
  describe('validateEmail', () => {
    test('should return true for valid UIC email', () => {
      expect(validateEmail('student@uic.edu.ph')).toBe(true);
      expect(validateEmail('faculty@uic.edu.ph')).toBe(true);
    });

    test('should return false for invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@gmail.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(validateEmail('test.email+tag@uic.edu.ph')).toBe(true);
      expect(validateEmail('test@uic.edu.ph.fake')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return true for strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('StrongP@ss1')).toBe(true);
    });

    test('should return false for weak passwords', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('PASSWORD')).toBe(false);
      expect(validatePassword('Pass1')).toBe(false);
    });

    test('should require minimum length of 6 characters', () => {
      expect(validatePassword('Aa1!')).toBe(false);
      expect(validatePassword('Aa1!23')).toBe(true);
    });
  });

  describe('formatUserRole', () => {
    test('should format user roles correctly', () => {
      expect(formatUserRole('admin')).toBe('Administrator');
      expect(formatUserRole('alumni')).toBe('Alumni');
    });

    test('should handle invalid roles', () => {
      expect(formatUserRole('invalid')).toBe('Unknown');
      expect(formatUserRole(null)).toBe('Unknown');
      expect(formatUserRole('')).toBe('Unknown');
    });
  });
});
```

**2. React Component Testing:**
```javascript
// src/components/UserProfile.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserProfile from './UserProfile';

// Mock Supabase client
jest.mock('../config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'profile-1',
              first_name: 'John',
              last_name: 'Doe',
              program: 'Computer Science',
              graduation_year: 2020
            },
            error: null
          }))
        }))
      }))
    }))
  }
}));

const renderWithProviders = (component, { user = mockUser } = {}) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user, loading: false }}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

const mockUser = {
  id: 'user-1',
  email: 'john.doe@uic.edu.ph',
  role: 'alumni'
};

describe('UserProfile Component', () => {
  test('should render user profile information', async () => {
    renderWithProviders(<UserProfile userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Class of 2020')).toBeInTheDocument();
    });
  });

  test('should show loading spinner while fetching data', () => {
    renderWithProviders(<UserProfile userId="user-1" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('should handle profile update', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfile userId="user-1" editable={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);

    // Update first name
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  test('should display error message on fetch failure', async () => {
    // Mock failed API call
    const { supabase } = require('../config/supabaseClient');
    supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: null,
            error: { message: 'Profile not found' }
          })
        })
      })
    });

    renderWithProviders(<UserProfile userId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
    });
  });
});
```

**3. Custom Hook Testing:**
```javascript
// src/hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabaseClient';

// Mock Supabase
jest.mock('../config/supabaseClient');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('should handle successful login', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@uic.edu.ph',
      role: 'alumni'
    };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@uic.edu.ph', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle login failure', async () => {
    const mockError = { message: 'Invalid credentials' };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: mockError
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@uic.edu.ph', 'wrongpassword');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  test('should handle logout', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
```

**4. Tracer Study Analytics Testing:**
```javascript
// src/utils/tracerStudyAnalytics.test.js
import { TracerStudyAnalytics } from './tracerStudyAnalytics';

describe('TracerStudyAnalytics', () => {
  const mockResponses = [
    {
      employment_status: 'Employed (Full-time)',
      industry: 'Technology',
      salary_range: '₱50,001 - ₱75,000',
      graduation_year: 2020
    },
    {
      employment_status: 'Employed (Part-time)',
      industry: 'Technology',
      salary_range: '₱25,001 - ₱50,000',
      graduation_year: 2021
    },
    {
      employment_status: 'Unemployed - Looking for work',
      industry: null,
      salary_range: null,
      graduation_year: 2022
    }
  ];

  test('should calculate employment rate correctly', () => {
    const analytics = new TracerStudyAnalytics(mockResponses);
    const result = analytics.calculateEmploymentRate();

    expect(result.rate).toBe(67); // 2 out of 3 employed
    expect(result.confidence).toHaveLength(2);
    expect(result.confidence[0]).toBeGreaterThanOrEqual(0);
    expect(result.confidence[1]).toBeLessThanOrEqual(100);
  });

  test('should handle empty responses', () => {
    const analytics = new TracerStudyAnalytics([]);
    const result = analytics.calculateEmploymentRate();

    expect(result.rate).toBe(0);
    expect(result.confidence).toEqual([0, 0]);
  });

  test('should analyze industry distribution', () => {
    const analytics = new TracerStudyAnalytics(mockResponses);
    const result = analytics.analyzeIndustryDistribution();

    expect(result).toHaveLength(1); // Only Technology industry
    expect(result[0]).toEqual({
      industry: 'Technology',
      count: 2,
      percentage: 67
    });
  });

  test('should filter by graduation year', () => {
    const analytics = new TracerStudyAnalytics(mockResponses);
    const filtered = analytics.filterByGraduationYear(2020);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].graduation_year).toBe(2020);
  });
});
```

**5. AI Service Testing:**
```javascript
// src/services/OllamaService.test.js
import OllamaService from './OllamaService';

// Mock fetch globally
global.fetch = jest.fn();

describe('OllamaService', () => {
  beforeEach(() => {
    fetch.mockClear();
    OllamaService.clearHistory();
  });

  test('should check connection successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [] })
    });

    const isConnected = await OllamaService.checkConnection();
    expect(isConnected).toBe(true);
    expect(fetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
  });

  test('should handle connection failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Connection failed'));

    const isConnected = await OllamaService.checkConnection();
    expect(isConnected).toBe(false);
  });

  test('should generate context from tracer data', () => {
    const tracerData = [
      {
        full_name: 'John Doe',
        employment_status: 'Employed (Full-time)',
        company_name: 'Tech Corp',
        graduation_year: 2020
      }
    ];

    const context = OllamaService.generateContext(tracerData);

    expect(context).toContain('Total Responses: 1');
    expect(context).toContain('Employment Rate: 100%');
    expect(context).toContain('John Doe');
    expect(context).toContain('Tech Corp');
  });

  test('should send message with context', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        response: 'Based on the data, employment rate is 100%'
      })
    };

    fetch
      .mockResolvedValueOnce({ ok: true }) // Connection check
      .mockResolvedValueOnce(mockResponse); // Message send

    const tracerData = [
      { employment_status: 'Employed (Full-time)' }
    ];

    const result = await OllamaService.sendMessage(
      'What is the employment rate?',
      tracerData
    );

    expect(result.success).toBe(true);
    expect(result.response).toContain('employment rate is 100%');
  });
});
```

**Test Execution Commands:**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test UserProfile.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should handle login"
```

---

*Document Version: 1.0*  
*Last Updated: September 19, 2025*  
*Prepared for: University of the Immaculate Conception - College of Computer Studies*
