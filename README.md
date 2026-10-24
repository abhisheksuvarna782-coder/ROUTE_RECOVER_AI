
# 🚆 RouteRecover AI — AI-Powered Travel Disruption Recovery

**An intelligent travel recovery agent for cancelled or delayed flights, trains, and buses.**

RouteRecover AI is a full-stack project developed by **Team QuadCoders** for the **Nexus SIT Hackathon** under the theme **Open Innovation**.

The project helps travellers manage unexpected travel disruptions by identifying affected bookings, evaluating alternative journeys, checking travel constraints, and generating ranked recovery plans with clear explanations.

Instead of manually searching across multiple platforms, travellers can explore recovery options through one unified interface and make informed decisions.

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
| Project Domain | Artificial Intelligence & Full-Stack Development |

**Built for the Nexus SIT Hackathon**, RouteRecover AI demonstrates how artificial intelligence, deterministic decision-making, and full-stack web development can address real-world travel disruption challenges.

---

## 👥 Team Members

- **Abhishek** — Team Leader
- **Rishitha R**
- **Ajaya Raj A.N**
- **Ritu R Suvarna**

---

## 🎯 Problem Statement

When a flight, train, or bus is cancelled or delayed, travellers must manually search for alternatives while protecting hotel check-ins, onward connections, arrival deadlines, and budgets.

Existing travel platforms often operate separately, making it difficult to understand how one disruption affects an entire itinerary.

RouteRecover AI addresses this challenge by providing a unified system that evaluates alternative journeys against traveller-specific requirements.

### Key Challenges

- Fragmented travel information across different platforms.
- Missed connections and affected hotel bookings.
- Unexpected travel expenses.
- Strict arrival deadlines and budget constraints.
- Accessibility requirements and overnight travel restrictions.
- Lack of transparent explanations for recommended alternatives.

---

## 💡 Proposed Solution

RouteRecover AI provides an intelligent recovery workflow that:

1. Detects or simulates a travel disruption.
2. Identifies affected bookings and connected travel dependencies.
3. Generates alternative travel options.
4. Filters options that violate mandatory constraints.
5. Scores feasible alternatives based on cost, arrival time, and journey duration.
6. Uses an AI assistant to explain recommendations and rejected alternatives.
7. Presents a recovery plan for the traveller to review and approve.

The deterministic decision engine handles feasibility checks and ranking, while the AI service provides natural-language explanations.

---

## ✨ Key Features

- **Disruption Center:** Simulate and manage travel disruption scenarios.
- **Recovery Workspace:** View ranked alternatives and rejection reasons.
- **Booking Impact Analysis:** Identify affected bookings and itinerary dependencies.
- **Constraint Management:** Configure budgets, arrival deadlines, stop limits, overnight restrictions, and accessibility requirements.
- **Intelligent Decision Engine:** Apply mandatory constraints and weighted scoring.
- **AI Travel Assistant:** Help users understand recovery recommendations.
- **Dashboard:** Access a unified overview of travel and recovery activity.
- **Recovery History:** Review previous recovery decisions.
- **Audit Trail:** Support transparent decision-making.
- **Human Approval:** Allow travellers to review and approve proposed recovery plans.

---

## 🏗️ System Architecture

```text
              TRAVELLER
                  |
                  v
           REACT FRONTEND
                  |
                  v
           FASTAPI BACKEND
                  |
          +-------+-------+
          |               |
          v               v
    DECISION ENGINE    AI SERVICE
          |               |
          v               v
    Impact Analysis   AI Explanations
    Constraint Check  LLM / Fallback
    Candidate Scoring
          |               |
          +-------+-------+
                  |
                  v
              DATABASE
                  |
                  v
       RECOVERY OPTIONS & RESULTS
                  |
                  v
         TRAVELLER APPROVAL
```

---

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Leaflet Maps
- Axios

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy

### Database
- SQLite
- PostgreSQL support through database configuration

### AI & Decision Making
- Deterministic decision engine
- Booking-dependency impact analysis
- Constraint-based filtering
- Weighted scoring algorithm
- OpenAI or Anthropic Claude integration with offline fallback support

### Development & Deployment
- Git and GitHub
- Vercel
- Environment-based configuration

---

## ⚙️ How the Decision Engine Works

RouteRecover AI follows a structured decision-making pipeline.

1. **Impact Analysis:** Identify bookings affected by a disruption.
2. **Candidate Search:** Generate alternative travel options.
3. **Constraint Filtering:** Reject options that violate mandatory requirements.
4. **Weighted Scoring:** Rank feasible alternatives using configured criteria.
5. **AI Explanation:** Explain recommendations and rejected alternatives.
6. **Human Approval:** Allow the traveller to review and approve the proposed plan.

### Example Scoring Priorities

| Criterion | Weight |
|---|---:|
| Cost | 40% |
| Arrival Time | 30% |
| Journey Duration | 20% |
| Stops and Preferences | 10% |

Mandatory constraints are applied before feasible alternatives are ranked.

---

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

### 2. Set Up the Backend

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

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the project's environment example files, including database settings and any required AI provider credentials.

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend API documentation:

http://127.0.0.1:8000/docs

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend environment file with the appropriate backend API URL.

Start the frontend:

```bash
npm run dev
```

Open the local development URL displayed in the terminal.

**Note:** Adjust the commands to match the actual directory structure and configuration of the repository.

---

## 🌐 Project Links

- **GitHub Repository:** [RouteRecover AI](https://github.com/abhisheksuvarna782-coder/ROUTE_RECOVER_AI)
- **Live Deployment:** [RouteRecover AI on Vercel](https://route-recover-ai.vercel.app)

---

## 🧪 Prototype Status

RouteRecover AI includes a working web application prototype demonstrating travel disruption recovery workflows.

The hackathon demonstration uses simulated disruption scenarios and booking changes to showcase the decision engine, constraint filtering, alternative ranking, and recovery explanations.

Live external booking availability and real-time transport prices should not be assumed unless the relevant integrations are configured.

---

## 🔮 Future Enhancements

- Integration with live airline, railway, and bus availability APIs.
- Automated travel disruption notifications.
- Hotel and onward-journey rebooking integrations.
- Advanced dependency analysis for complex itineraries.
- Multilingual AI travel assistance.
- Improved accessibility-aware recommendations.
- Production-grade authentication and monitoring.
- Enhanced audit logs and recovery analytics.

---

## 🌟 What Makes RouteRecover AI Different?

Unlike a general-purpose chatbot that may recommend alternatives without checking constraints, RouteRecover AI combines deterministic decision-making with AI-assisted explanations.

- **Explainability:** Understand why an alternative was selected or rejected.
- **Constraint Awareness:** Evaluate options against traveller requirements.
- **Connected-Booking Analysis:** Assess disruption impacts across an itinerary.
- **Human Control:** Keep the final recovery decision with the traveller.
- **Unified Experience:** Bring disruption analysis, alternatives, and recovery history into one interface.

---

## 🙌 Acknowledgements

Developed by **Team QuadCoders** for the **Nexus SIT Hackathon**, representing **Srinivas Institute of Technology (SIT)**.

We aim to explore practical applications of artificial intelligence, explainable decision-making, and full-stack software development to make travel disruption recovery more transparent and efficient.

---

<div align="center">

**Built with purpose by Team QuadCoders 💙**

*RouteRecover AI — Recover Your Journey. Make Informed Decisions.*

</div>
