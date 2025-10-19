# HeartGuard - Heart Health App

HeartGuard is a web application that helps people check their risk of heart disease and manage their heart health. It uses smart technology to give personalized advice about food, exercise, and medications.

## What Does This App Do?

### Main Features

1. **Check Your Heart Risk**
   - Find out your chance of getting heart disease
   - Get easy-to-understand results
   - See what you can do to stay healthy

2. **Healthy Eating Plans**
   - Get meal plans just for you
   - Recipes that are good for your heart
   - Check for food allergies and medicine conflicts
   - Learn how much to eat

3. **Exercise Programs**
   - Workouts that match your fitness level
   - Videos showing how to do exercises
   - Safety checks before you start
   - Track your workouts

4. **Health Tracking**
   - Keep track of your health information
   - Record your blood pressure and cholesterol
   - Note any symptoms you have
   - Log what you eat

5. **Medicine Reminders**
   - Never forget to take your pills
   - Check if medicines work well together
   - See how well you're following your medicine plan

6. **Health Goals**
   - Set health targets for yourself
   - Weekly health challenges to stay motivated
   - Earn badges when you reach goals

7. **Doctor Visits**
   - Book appointments with doctors
   - Talk to doctors online

8. **Community Support**
   - Talk with others about heart health
   - Ask questions and share experiences

9. **For Doctors**
   - See all your patients' health data
   - Group patients by risk level
   - Study health patterns
   - Create reports

10. **Privacy & Security**
    - Keep your information safe with login protection
    - Control who can see your data
    - Download or delete your data anytime

## Technology Used

### Frontend (What You See)
- **React** - Makes the website work
- **TypeScript** - Helps prevent coding mistakes
- **Vite** - Makes the website load fast
- **Tailwind CSS** - Makes it look good

### Backend (Behind the Scenes)
- **Node.js** - Runs the server
- **Express** - Handles web requests
- **TypeScript** - Keeps code organized
- **Drizzle ORM** - Talks to the database
- **MySQL** - Stores all the information

### Smart Features
- **Machine Learning** - Calculates heart disease risk
- **SHAP** - Explains why you got your risk score

## How It Works

```
┌─────────────────┐    Internet    ┌──────────────────┐
│   Your Browser  │◄──────────────►│    HeartGuard    │
│   (Phone/PC)    │               │    Server        │
└─────────────────┘               └──────────────────┘
                                             │
                                             ▼
                                  ┌──────────────────┐
                                  │    Database      │
                                  │    (MySQL)       │
                                  └──────────────────┘
```

### Main Parts

1. **Frontend**
   - Easy-to-use website that works on phones and computers
   - Keeps track of what's happening with your data

2. **Backend**
   - Handles all the requests when you click buttons
   - Keeps you logged in securely
   - Organizes all the health information

3. **Database**
   - MySQL database that stores all user information
   - 30+ tables for different types of health data
   - Automatic updates when needed

4. **Smart Calculations**
   - Computer models that predict heart disease risk
   - Connected to the main system

## Database Structure

The app stores information in a MySQL database with these main sections:

### Your Account
- `users` - Your login information
- `user_profiles` - Your personal details

### Health Information
- `clinical_entries` - Doctor visit data
- `predictions` - Your risk scores
- `lab_results` - Blood tests and checkups
- `symptoms` - Any symptoms you report

### Food & Nutrition
- `recipes` - Healthy recipes
- `meal_plans` - Your eating plans
- `food_logs` - What you've eaten
- `portion_guidelines` - How much to eat

### Exercise
- `exercises` - Workout library
- `exercise_plans` - Your workout plans
- `workout_logs` - Your workout history
- `safety_checks` - Safety questions before exercising

### Medicines
- `medications` - Your medicine schedule

### Community
- `forum_categories` - Discussion topics
- `forum_posts` - Questions and discussions
- `forum_replies` - Responses to posts

### Goals & Challenges
- `health_goals` - Your health targets
- `goal_achievements` - Badges you've earned
- `weekly_challenges` - Weekly health activities
- `user_challenge_participations` - Your challenge progress

### Doctor Appointments
- `tele_consult_bookings` - Online doctor visits

### Privacy
- `biometric_templates` - Fingerprint/face recognition
- `privacy_consents` - Your privacy choices
- `data_export_requests` - Requests for your data
- `data_deletion_requests` - Requests to delete your data

## How to Set Up

### What You Need

- Node.js (version 18 or newer)
- MySQL (version 8.0 or newer)
- npm (comes with Node.js)

### Installation Steps

1. Get the code:
   ```bash
   git clone <repository-url>
   cd heartguard
   ```

2. Install everything needed:
   ```bash
   npm install
   ```

### Setup Your Settings

1. Copy the example settings file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your information:
   ```env
   # Server port
   PORT=5001

   # Website port
   VITE_PORT=3001

   # API address
   VITE_API_URL=http://localhost:5001/api

   # Database connection
   DATABASE_URL=mysql://username:password@localhost:3307/heartguard

   # Login security key
   JWT_SECRET=your_jwt_secret_here
   ```

### Database Setup

1. Create the database:
   ```sql
   CREATE DATABASE heartguard;
   ```

2. Set up the tables:
   ```bash
   npm run db:push
   ```

### Run the App

#### For Testing (Development)

1. Start the test server:
   ```bash
   npm run dev
   ```

2. Visit:
   - Website: http://localhost:3001
   - API: http://localhost:5001

#### For Real Use (Production)

1. Prepare for real use:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Project Folder Structure

```
heartguard/
├── client/                 # Website files
│   ├── src/
│   │   ├── components/     # Page pieces (buttons, menus)
│   │   ├── hooks/          # Special functions
│   │   ├── lib/            # Helper tools
│   │   ├── pages/          # Main pages
│   │   ├── utils/          # Useful functions
│   │   ├── App.tsx         # Main app file
│   │   └── main.tsx        # Starting point
│   └── index.html          # Main HTML file
├── server/                 # Server files
│   ├── auth/               # Login system
│   ├── clinical/           # Health data
│   ├── db/                 # Database setup
│   ├── exercise/           # Exercise features
│   ├── exports/            # Data downloads
│   ├── forums/             # Community
│   ├── goals/              # Health goals
│   ├── medication/         # Medicine features
│   ├── ml/                 # Smart calculations
│   ├── nutrition/          # Food features
│   ├── profiles/           # User profiles
│   ├── symptoms/           # Symptom tracking
│   ├── teleconsult/        # Doctor visits
│   ├── utils/              # Helper functions
│   ├── index.ts            # Server starting point
│   └── routes.ts           # Web address setup
├── shared/                 # Files used by both website and server
│   └── schema.ts           # Database design
├── migrations/             # Database updates
└── scripts/                # Helper scripts
```

## Useful Commands

- `npm run dev` - Start test server
- `npm run build` - Prepare for real use
- `npm start` - Start real server
- `npm run check` - Check for coding mistakes
- `npm run db:push` - Update database
- `npm test` - Run tests

## Testing

The app has different types of tests:
1. **Unit Tests** - Test small pieces of code
2. **Integration Tests** - Test how parts work together
3. **Database Tests** - Test database changes
4. **End-to-End Tests** - Test user experiences

Run tests with:
```bash
npm test
```

## For Production Use

### Prepare for Real Use

1. Build the app:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

### Using Docker (Recommended)

Create a Dockerfile for easier deployment:

```dockerfile
# TODO: Add Dockerfile content
```

### Production Settings

Make sure these are set properly:
- Strong security key
- Real database connection
- Working email setup
- HTTPS security

## How to Help

1. Copy the project
2. Make a new branch for your changes
3. Add your changes
4. Upload your changes
5. Ask to add your changes to the main project

Make sure your code follows the project's style and includes tests.

## License

This project uses the MIT License - see the [LICENSE](LICENSE) file for details.