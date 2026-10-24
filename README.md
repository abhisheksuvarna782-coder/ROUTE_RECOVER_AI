# 🚆 RouteRecover AI — AI-Powered Travel Disruption Recovery

**An intelligent travel recovery agent that helps travellers recover from cancelled or delayed flights, trains, and buses.**

RouteRecover AI is a hackathon project developed by **Team QuadCoders** at **Srinivas Institute of Technology (SIT)**. It aims to simplify travel disruption management by identifying affected bookings, evaluating alternative travel options, checking user constraints, and generating ranked recovery plans with clear explanations.

Instead of manually searching across multiple travel platforms, travellers can use a unified workspace to explore feasible alternatives and make informed recovery decisions.

---

## 🏆 Hackathon Information

| Detail | Information |
|---|---|
| Project Name | RouteRecover AI |
| Hackathon | Nexus SIT Hackathon |
| Theme | Open Innovation |
| Team Name | QuadCoders |
| Team Leader | Abhishek |
| Institution | Srinivas Institute of Technology (SIT) |
| Project Category | AI / Full-Stack Web Development |
| Project Type | Travel Disruption Recovery Agent |

**Built for the Nexus SIT Hackathon:** RouteRecover AI demonstrates how deterministic decision-making, AI-assisted explanations, and full-stack web development can be combined to address real-world travel disruption challenges.

## 👥 Team Members & Responsibilities

| Team Member | Role |
|---|---|
| **Abhishek** | Team Leader — Frontend Design & Backend Integration |
| **Rishitha R** | Backend Development & API Design |
| **Ajaya Raj A.N** | AI Decision Engine & Recovery Logic |
| **Ritu R Suvarna** | Testing & Quality Assurance |

Each member has one defined primary role within the project team.

## 🎯 Problem Statement

Travel disruptions such as cancelled or delayed flights, trains, and buses can cause missed connections, hotel check-in problems, additional expenses, and missed deadlines.

Travellers often need to search multiple platforms manually to find suitable alternatives. Existing approaches may not consider the complete impact of a disruption across connected bookings or the traveller's personal constraints.

RouteRecover AI addresses this problem by providing a unified system that evaluates travel alternatives against factors such as:

- Arrival deadlines
- Additional budget limits
- Number of stops and connections
- Overnight travel requirements
- Accessibility needs
- Hotel and onward-journey dependencies

## 💡 Proposed Solution

RouteRecover AI provides an intelligent recovery workflow that:

1. Detects or simulates a travel disruption.
2. Identifies affected bookings and connected travel dependencies.
3. Generates alternative travel options.
4. Filters alternatives that violate mandatory constraints.
5. Scores feasible options according to cost, arrival time, and duration.
6. Uses an AI assistant to explain recommendations and rejected alternatives.
7. Presents the recovery plan for the traveller to review and approve.

**Important:** The decision engine determines feasibility and ranking. The AI assistant explains the results rather than independently inventing travel availability or prices.

## ✨ Key Features

- **Disruption Center:** Simulate and manage travel disruption scenarios.
- **Recovery Workspace:** View ranked recovery options and reasons for rejecting alternatives.
- **Booking Impact Analysis:** Understand how a disrupted journey affects connected bookings.
- **Constraint Management:** Set arrival deadlines, budget limits, stop limits, overnight restrictions, and accessibility preferences.
- **Intelligent Decision Engine:** Apply hard constraints and weighted scoring to identify suitable options.
- **AI Travel Assistant:** Get natural-language explanations and assistance with recovery decisions.
- **Dashboard:** Access a unified overview of trips and recovery activity.
- **Recovery History:** Review previous recovery decisions and their outcomes.
- **Audit Trail:** Support transparent, explainable decision-making.
- **Human Approval:** Allow travellers to review and approve a proposed recovery plan.

## 🏗️ System Architecture

```text
Traveller
    |
    v
React Frontend
    |
    v
FastAPI Backend
    |
    +----------------------+
    |                      |
    v                      v
Decision Engine        AI Service
    |                      |
    v                      v
Constraint Filtering   LLM-Based Explanations
    |                      |
    +-----------+----------+
                |
                v
          Database Layer
                |
                v
      Recovery Options & Results
                |
                v
       Traveller Review/Approval
```

### Technology Stack

**Frontend**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Leaflet Maps
- Axios

**Backend**
- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy

**Database**
- SQLite for local development
- PostgreSQL support through database configuration

**AI & Decision Making**
- Deterministic decision engine
- Booking-dependency impact analysis
- Constraint-based filtering and weighted scoring
- Pluggable OpenAI or Anthropic Claude integration, with offline fallback support

**Development & Deployment**
- Git and GitHub
- Vercel for frontend deployment
- Environment-based backend configuration

## ⚙️ How the Decision Engine Works

RouteRecover AI uses a structured decision pipeline:

1. **Impact Analysis:** Identify bookings affected by a disruption.
2. **Candidate Search:** Generate alternative recovery options.
3. **Hard-Constraint Filtering:** Reject options that violate mandatory requirements.
4. **Weighted Scoring:** Compare feasible options using cost, arrival time, and journey duration.
5. **AI Explanation:** Explain the results and the reasons behind rejected options.
6. **Human Approval:** Present the proposed recovery plan for traveller approval.

The scoring model prioritizes cost (40%), arrival time (30%), and journey duration (20%), with additional consideration for stops and preferred transport options. The implementation's configured weights and scoring rules determine the final ranking.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Python 3.10 or later
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/abhisheksuvarna782-coder/ROUTE_RECOVER_AI.git
cd ROUTE_RECOVER_AI
```

### 2. Configure the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the root `.env.example` as a reference. Set the database URL and any required AI provider credentials according to the project configuration.

Start the backend server:

```bash
uvicorn app.main:app --reload
```

The API documentation is available at:

`http://127.0.0.1:8000/docs`

### 3. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a frontend `.env` file using `frontend/.env.example` as a reference and configure the backend API URL.

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal to access the application.

**Note:** Some functionality may require valid database configuration, backend availability, and AI provider credentials. Follow the repository's deployment documentation for production setup.

## 🌐 Project Links

- **GitHub Repository:** [RouteRecover AI](https://github.com/abhisheksuvarna782-coder/ROUTE_RECOVER_AI)
- **Live Deployment:** [route-recover-ai.vercel.app](https://route-recover-ai.vercel.app)
- **Deployment Guide:** [`docs/deployment.md`](docs/deployment.md)

## 🧪 Prototype Status

RouteRecover AI includes a working web application prototype with a disruption recovery workflow. The hackathon demonstration uses simulated disruption scenarios and booking changes to showcase the system's capabilities.

Travel alternatives and prices displayed in simulated scenarios should not be interpreted as live, externally verified booking availability.

## 🔮 Future Enhancements

- Integration with live airline, railway, and bus availability APIs.
- Automated notifications for significant travel disruptions.
- Real-time hotel and onward-journey rebooking integrations.
- Improved dependency analysis for complex multi-booking itineraries.
- Multilingual assistance for travellers.
- More comprehensive accessibility-aware route recommendations.
- Production-grade authentication, monitoring, and audit capabilities.

## 🌟 What Makes RouteRecover AI Different?

Unlike a general-purpose chatbot that may suggest alternatives without verifying constraints, RouteRecover AI combines a deterministic decision engine with AI-assisted explanations.

Its key strengths are:

- **Explainability:** Understand why an option was selected or rejected.
- **Constraint awareness:** Filter alternatives against traveller requirements.
- **Connected-booking analysis:** Evaluate the impact of disruptions across an itinerary.
- **Human control:** Keep the final recovery decision with the traveller.
- **Unified experience:** Bring disruption analysis, alternatives, and recovery history into one workspace.

## 🙌 Acknowledgements

Developed by **Team QuadCoders** for the **Nexus SIT Hackathon**, representing Srinivas Institute of Technology.

This project reflects our team's effort to explore practical applications of artificial intelligence, explainable decision-making, and full-stack software development.

---

**Built with purpose by Team QuadCoders 💙**

*RouteRecover AI — Recover your journey. Make informed decisions.*
