# RouteRecover AI ✈️

**AI-Powered Travel Disruption and Recovery Platform**

RouteRecover AI is a web-based platform designed to help travellers manage unexpected travel disruptions and explore alternative recovery plans. It brings trip information, disruption management, traveller constraints, and recovery workflows together in a single interface.

🌐 **Live Demo:** https://route-recover-ai.vercel.app/

## 🚀 Features

- **Interactive Dashboard** — View travel information, trip summaries, and available dashboard insights.
- **Trip Management** — Access and manage trip-related information.
- **Disruption Centre** — Explore travel disruption scenarios and their impact.
- **AI-Powered Recovery** — Generate and review alternative recovery plans using the application's recovery logic and configured AI services.
- **Recovery Workspace** — Review proposed recovery options and relevant itinerary details.
- **Traveller Constraints** — Account for traveller preferences and requirements during recovery planning.
- **Recovery History** — Review previously recorded recovery activities.
- **AI Assistant** — Interact with the assistant functionality available in the application.
- **Responsive Interface** — A modern interface designed for convenient navigation across supported screen sizes.

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Axios
- React Router
- Tailwind CSS and existing UI styling

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy

### Database and AI
- SQLite for local database storage
- Configurable AI services, depending on environment configuration

### Deployment
- Vercel for the live frontend
- Backend hosting and persistent database configuration depend on the deployment setup.

## 📁 Project Structure

```text
RourterCover/
├── frontend/
│   ├── src/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── requirements.txt
│
└── README.md
```

*Note: The structure above summarizes the main application areas. Refer to the repository for the complete directory structure.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm, or the package manager specified by the frontend project.
- Python 3.10+ (verify compatibility with the backend dependencies).
- Git.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd RourterCover
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the provided `.env.example`, if available. Do not commit real API keys or secrets.

Start the backend using the application's actual FastAPI entry point. For example, if the entry point is `app.main:app`:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API documentation, when enabled, is typically available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL displayed in your terminal, usually:

http://localhost:5173

Use the package manager and scripts defined in `frontend/package.json` if they differ from these examples.

### 4. Configure Frontend and Backend Connectivity

During local development, the Vite proxy can forward `/api` requests to the FastAPI server at:

```text
http://localhost:8000
```

For production, configure the frontend's API base URL to point to the deployed backend. Set the corresponding environment variable according to the existing API service implementation.

Never expose private AI API keys or backend secrets in frontend environment variables.

## 🌍 Deployment

### Frontend — Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Set the frontend root directory to `frontend`.
4. Configure the build command and output directory according to the Vite configuration and package scripts.
5. Set the production API URL to the deployed backend.
6. Deploy and verify the live application.

**Live application:** https://route-recover-ai.vercel.app/

### Backend and Database

The FastAPI backend must also be deployed and reachable by the frontend. Configure the required environment variables, CORS origins, and database connection for the selected hosting platform.

SQLite is suitable for local development, but production deployments requiring durable data should use appropriately configured persistent storage or a managed database.

## 🔄 Application Workflow

1. Access trip and traveller information.
2. Identify or select a travel disruption scenario.
3. Review the disruption and its impact.
4. Generate or explore recovery options.
5. Evaluate recommendations against traveller constraints.
6. Review and approve or reject recovery proposals where supported.
7. Review recorded recovery activities.

The exact workflow depends on the features enabled and the configured backend services.

## 🔐 Environment Configuration

Keep credentials in local environment files or the deployment platform's secret manager.

Depending on the existing configuration, environment variables may include:

- Database connection settings.
- AI provider API credentials.
- CORS allowed origins.
- Frontend API base URL.
- Application secret or authentication settings, if required.

Use `.env.example` to document required variables with placeholder values. Never publish actual secrets.

## 🎯 Project Objective

The objective of RouteRecover AI is to simplify travel disruption management by combining travel information, recovery planning, traveller constraints, and decision-support workflows in one application.

## 🔮 Future Enhancements

- Real-time airline and transport disruption integrations.
- More advanced AI-driven recovery recommendations.
- Improved cost and time optimization.
- Persistent cloud database integration.
- Notifications for important itinerary changes.
- Integration with external booking providers.

These are potential enhancements and are not claims of currently implemented functionality.

## 👨‍💻 Author

**Abhishek Suvarna**

Computer Science and Engineering — Artificial Intelligence and Machine Learning

GitHub: https://github.com/abhisheksuvarna782-coder

LinkedIn: https://www.linkedin.com/in/abhishek-suvarna-1bb2b6335

---

⭐ If you find this project interesting, consider starring the repository.
