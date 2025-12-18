

#### Online Editor With AI

A Real time collaborative editor with Auto completions for Java, Java script and Python & Code conversion using Gemini Generative AI.

#### What You need to  Run: 

Node.js - v24.11.1
Angular CLI -  21.0.2
Code Mirror@6
Yjs, y-codemirror.next, y-websocket
Gemini API Key

#### How to generate Gemini API Key:

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Click "Create API key in new project"
5. Copy the API key


### Setup Instructions:

#### Frontend Setup:
- Have Node pre installed in your machine
- cd frontend
- npm install
- npm install -g @angular/cli
- ng serve --open
Wait for "Compiled successfully"

Front end will run on: http://localhost:4200


#### Backend Setup:
- cd backend
- npm install
- node src/Server.js
Backend running on port 5000
Yjs WebSocket server running at ws://localhost:1234

## How to Use

1. Start the backend first (follow Backend Setup)
2. Start the frontend (follow Frontend Setup)
3. Open your browser and go to http://localhost:4200
4. Select a programming language from the dropdown
5. Start typing code
6. Press Ctrl+Space for Auto completion Suggestions.


### Collaborative Editor:

Open http://localhost:4200 in first browser
Open http://localhost:4200(Same above Url) in second browser
Type in one broswer and see changes are reflecting in another browser.


## Project Structure

OnLINE_EdITOR_WITH_AI/
  frontend/
    src/
      app/
        editor-page/
        services/
  backend/
    src/
      routes/
        services/
    Server.js


### Key Features
- Real time Collaborative editing
- Code Conversion using Generative AI
- Auto Completion Suggestion using Code Mirror
- Multiple users can code together

## How to stop the  Application

Backend: Press Ctrl+C in the backend terminal

Frontend: Press Ctrl+C in the frontend terminal
