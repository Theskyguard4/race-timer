# race-timer
# race-timer by UP2211837

## This is my submission for the Web Programming (M30237-2024/25-SMJAN) Race Timer Course work.

To run the program:
[in terminal in the project file]

1) npm install
2) npm run setup
3) npm start

## Key Features:
 - 1 - Offline & Online Race creation and recording (Create Race Page)
      - Races are saved locally, and uploaded after Internet connection is received
 - 2 - Editable Races Offline & Online (My Races Page)
      - Allows races to be recorded offline, maintained and uploaded later
 - 3 - Live Race Results, uploaded live or after race complete and comes online (Race Results Page)
      - The Race Code system allows easy access to live race results for participants, the link can be shared or the code with the link to the site separately 
      - Easy Runner identification via runner details which updates live
 - 4 - Live Race Checkpoint screens with editable names (Live Screen Page)
      - Editable names to allow easy checkpoint creation working along side marshalls to identify race analytics
 - 5 - Auto Race Start with live countdown (Create Race Page)
      - 5 second countdown and emergency cancel buttons to allow the race to be delayed with short notice
 - 6 - Editable runner details (Create race Page)
      - Maintainable runner identification
 - 7 - Marshall upload including distance, notes and Runners who have passed the checkpoints (Marshall page)
      - Marshall upload is not connected to a race until upload is clicked, this is as it seemed much easier to have marshall be like a form that you upload rather then a tag along page to each race, this means marshalls can upload multiple checkpoints with ease.
      - This also infers the need for upload validation (accepting and confirming marshalls)

## Instructions for use:

    Option 1: (Offline Race Mode)

     - step 1 - Create a Race
        - Access the server on a second device (E.G Mobile Phone) (optional For offline demonstration)
        - (this can be achieved by entering the ip address of the server pc, {ip     address + :8080})
        - Click Create a Race
        - Enter a relating name
        - Enter a start time (+ 5 to 10 minutes)
        - Click Create Race
        - Enter Airplane mode
        - Copy the race code from the race details page

     - Step 2 - View Race Results
        - On the server device, go to the local host index page
        - Navigate to the "View Race Results" Page
        - Enter the race code into the input box
        - (as the race device is in airplane mode, the race will not be displayed)

     - step 3 - Offline Race Control (online works the same, just extra steps may be taken)
        - Race Details - 
          - Race code is the races public share code
          - start time can be changed to any time in future
          - Public Share Link - Link to the race results page with race code pre inserted
          - Live Screen Link - Link to the live Race screens for checkpoints and Race start/end

          - Click the "Ready to Start" slider to allow auto start at the time selected.
          - Countdown slider inputs a start time into the "Start time" input box, at the current time + countdown

     - Step 4 - Start Offline Race
        - Click "Start Race" to start the timer
        - Click "Add FInish" to add a runner to the race results table below

        - Click on each runner to show a drop down of the runners details
        - Enter a First and Last name into the details.

     - Step 5 - End Race
        - Click "End Race"
        - The race is saved locally

     - Step 6 - Access locally saved races
        - Disable airplane mode (Required to load other pages on the domain)
        - Navigate to index (Via the back button)
        - Click on "My Races"
        - Find the race we just created
        - Click view on the race

     - Step 7 - View the races Details
        - Below is the race table
        - When view is clicked, if connection is available the race is uploaded to the Server

        - (Return to the mobile device to see the now uploaded Race results)

        - On the My races page, options include
          - Edit race name 
          - Download CSV of race results
          - Clicking on a runner allows you to edit runner details
          - A list of confirmed and requested marshall results
            - when a marshall uploads there results, they must be confirmed before being saved
            - As the race admin, you can decline, view and accept marshall results here.


    - Option 2 - (Online Race Mode)
     - Step 1 - Online Race Setup
        - Follow the previous step 1 
        (DO NOT TURN ON AIRPLANE MODE)

     - Step 2 - Race Results
        - Following the "Race Results link" displays a live updated Results page of the race 

     - Step 3 - Live Screen
       - Following the Live Screen link" Takes you to the checkpoints page
       - Edit the checkpoint name
       - The Timer will match the race time, starting at the same time or waiting to be manually started by the admin

     - Step 4 - Marshalls
       - Opening the Domain in a new tab and navigate to the Index Page
       - Click on the "Im a Marshall" page
       - Enter the Race Code into the "Race Code" box
       - Enter a Identifiable Name into the "Marshall Name" Box
       - Enter the checkpoint/Area name into the "Checkpoint Name" Box
       - Enter the distance of the marshall into the "Distance Into Race" box (0 if N/A)

       - Click the record runner to record a runner passing the marshall and save the time in the list below
       - Enter any notes about the checkpoint or runners in the "Notes" Box

       - Click Upload results to upload the marshall results to the table (Only will work with a valid race code)

       - Download Results downloads a csv file of the marshall recordings


## Pages:
    --Index (Navigation page)
       From index navigate to either:
       - View Race Results
       - Create New Race
       - My Races
       - I'm a Marshall

    --View Race Results
       - Enter a 10 digit race code to view the results of that race.
       - Auto Update (on/off) 
         on - automatically fetches the latest results from the current race
         off - displays the last fetched results

    --Create New Race
       - Enter a Race Name
       - Enter a suggested race Start time (editable)

       - Create My Race
         - Display of race details and race links
         - Ready to start?
           on - Starts a countdown from selected start time
           off - displays a waiting for race on live and race results pages
         - Countdown - When start is clicked, adds countdown value to the current time and starts the race in that amount of time
         - Start Race - starts race at the current time

         -- Below a table of the race results
           - Each result has a name field when clicked on, this will automatically be saved and uploaded to the server 

    --My Races
       - List of your local Races
       - View Button For each race
         - View displays race below
         - View the races marshalls in 2 lists
           confirmed - marshalls you confirmed as Real
           requested - marshalls still awaiting confirmation
         - Download csv 
           Download - Download /a csv file of the race details
       - Click each runner toe dit their runner details



## Use Of AI

    Ive used AI (referring to Microsoft Copilot, chatgpt, DeepseekAI & GrokAI) widely through my project, below i will detail the main use cases and how it has helped not only stream line development but save countless hours of debugging or web searching for problems and syntax.

    (Before describing my AI use id like to preface it with ive never coded in JavaScript previously, all of this is my first ever time using the syntax and codebase, AI has helped me develop a strong understanding of the theory behind full stack development using js and has been incredibly useful when begging work on my SETUP coursework which follows a very similar format to this piece of work. I strongly believe AI will be the future of development, weather it is aiding software devs or straight up building entire code bases on the future.)

### Use Cases: 
    1) Runtime Error Debugging -
      - Often Errors came in the connection between front and backend, these often were due to unvalid datatypes, sometimes being displayed in terminal while other times being displayed in 422 error responses etc.
      - Example AI Prompt: 
          "
          chunks = self.iterencode(o, _one_shot=True)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            File "/usr/lib/python3.12/json/encoder.py", line 258, in iterencode
              return _iterencode(o, 0)
                     ^^^^^^^^^^^^^^^^^
            File "/usr/lib/python3.12/json/encoder.py", line 180, in default
              raise TypeError(f'Object of type {o.__class__.__name__} '
          TypeError: Object of type coroutine is not JSON serializable
          /home/lewisloveskim/uni/SETUP/BookingApp/src/venv/lib/python3.12/site-packages/uvicorn/protocols/http/httptools_impl.py:-1: RuntimeWarning: coroutine 'DatabaseManager.create_token' was never awaited
          RuntimeWarning: Enable tracemalloc to get the object allocation traceback
          What does this error mean?
          "
      - Response: 
          "
          The error you're seeing, TypeError: Object of type coroutine is not JSON serializable, is caused because you are trying to serialize a coroutine (asynchronous function) to JSON, which is not directly possible.
          ....
          "
      - Review:
        - This error is quite obvious however when debugging sometimes the complicated error messages would be confusing, AI very clearly describes what is wrong and makes it easy to find the error

    2) Incorrect Syntax Errors - 
      - Often slight errors in code do not bring up a runtime error, this means debugging requires breaking down the problem to find out whats really wrong.
      - Example AI prompt:
          "
           if (matchingRace) {
          if (matchingRace.ended = -2) {
            document.getElementById("notificationTitle").textContent =
              "Waiting for Race...";
          } else if (matchingRace.ended = -1) {
            const strlen = matchingRace.startTimeDate.length;
            document.getElementById("notificationTitle").textContent =
              "Race starting at: " +
              matchingRace.startTimeDate.slice(strlen - 5, strlen);
          } else if (matchingRace.ended = 0) {
            document.getElementById("notificationTitle").textContent = "Race Time:";
          } else {
            document.getElementById("notificationTitle").textContent = "Race Ended";
          }
          Whats wrong with this code it isnt working?
          "
      - Response:
        The issue is with your use of the assignment operator = instead of the comparison operator == or === in the if / else if conditions. Here's the corrected version:
        ....
        "
      - Review:
        - This error could of been quite hard to spot especially in a large piece of code, AI like chatgpt can very quickly identify that = is incorrect and should be changed.
    
    3) File Setup and formatting - 
      - At the start of this project i found it very difficult to setup the project as i have never done this before.
      - Prompt: 
         "
          (Pasting the cw Doc here)
         i wanna start the project, how do i set up he project with all the files and have it on github
         "
      - Response: 
             "
             1. Set up the project structure
                First, create the basic folder structure for your project.
                    mkdir race-timer
                    cd race-timer
             2. Initialize a Node.js project
                Initialize your project using npm to create a package.json file.
                    npm init -y
                This will create a package.json file that contains metadata about your project.
             3. Install dependencies
                You will need Express (or Fastify), SQLite3, and other dependencies.
                To install Express and SQLite3:
                    npm install express sqlite3
                You can also install development dependencies like nodemon to auto-restart the server during development:
                    npm install --save-dev nodemon
             4. Create your folder structure
                Here’s a basic folder structure for the project:
                    mkdir controllers models routes views public
                    touch app.js README.md
                controllers: Business logic (handling requests)
                models: Database models and interactions
                routes: Define API routes
                views: HTML files (for your UI)
                public: Static files (CSS, JavaScript, images)
             5. Set up GitHub repository
                Go to GitHub and create a new repository (e.g., race-timer).
                In your project folder, initialize a Git repository and link it to GitHub.
                    git init
                    git remote add origin https://github.com/your-username/race-timer.git
                Create a .gitignore file to exclude unnecessary files from being tracked by Git:
                    touch .gitignore
                In .gitignore, add the following:
                    node_modules/
                    .env
                Commit and push the initial setup:
                    git add .
                    git commit -m "Initial project setup"
                    git push -u origin master
             "
      - Review: 
        This prompts and similar were EXTREMELY helpful and helped me setup the entire project. withoiut this very simple and step by step approach dedicated to my 