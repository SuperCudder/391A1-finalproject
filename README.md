# AutoClutch
Daily automotive guessing games running off of the CarQuery API

## AutoGuessr
Guess the car's make model and year given an outlined photo that slowly reveals the vehicle of the day.

## AutoRank
Ladder guessing game given a certain pool of vehicles user ranks them by a given statistic.

## Tech Features
API handling, seamless frontend UI, Next.js OAuth.

## API Routes Overview

Routes fetch data from the CarQuery API and returns JSON.

### `/api/autoguessr/random-car`
- **GET**
- Returns a random car's basic info (`model_id`, `make`, `model`, `year`).
- Used to generate the "car of the day" for AutoGuessr.

### `/api/autoguessr/car/[model_id]`
- **GET**
- Returns full details for a specific car, given its `model_id`.
- Used to reveal or check the correct answer in AutoGuessr.

### `/api/autorank/pool`
- **GET**
- Query params: `stat` (add/edit params as needed), `count` (number of cars, default 5).
- Returns a randomized pool of cars filtered by the chosen stat.
- Used to generate the set of cars for each AutoRank round.

### `/api/autorank/car/[model_id]`
- **GET**
- Returns full details for a specific car, given its `model_id` in json.
- Used to reveal or check the correct ranking/stat in AutoRank.

