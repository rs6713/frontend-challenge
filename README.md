# Soho Strategy Front End Technical Challenge
A single route web app is required for a booking system to manage availability of the spare room in the client's house.

## Requirements
- The client should be able to check the calendar to see which nights are booked for any given month. Each day on the calendar should correspond to the night following that day, (eg. the 4th Feb represents the night from 4th-5th Feb).
- It should be made obvious which days are reserved/free.
- The client should be able to toggle the availability of a night by clicking/tapping that day.
- The app should save and fetch changes to and from the attached server.
- The server is unreliable and sometimes slow. There is a 10% chance of receiving a HTTP 500. The app should handle this and show a loading indicator whilst waiting for responses.
- Though the API will allow it, you should not be able to place bookings for Sunday nights.
- The app only needs to record which dates are booked, no other information is necessary.
- The app should be responsive and loosely mirror the attached wireframes on desktop and mobile.

## Rules
- **You are free to use any frameworks or libraries you think would help, however please build the calendar component yourself.**
- You can contact abyrom@sohostrategy.com at any time to discuss the test or ask questions.
- React is preferred, but feel free to use any framework you're comfortable with.
- You're welcome to use bootstrapping tools.
- You are not required to design the app, but feel free add your own basic styles to make it more presentable.

## API
The server contains an in-memory store of of which nights have been reserved. It has three endpoints.

`GET /reserved/:start/:end`
Returns a list of reserved dates (in ISO8601 format `YYYY-MM-DDTHH:mm:ssZ`) between `:start` and `:end` inclusive.
`:start` and `:end` should take the form `YYYY-MM-DD`

`PUT /reserved/:date`
Accepts a JSON object with a `reserved` boolean, indicating whether the date is to be reserved (`reserved === true`) or made free (`reserved === false`).
`:date` should take the form `YYYY-MM-DD`.

`GET /now`
Returns the current date in ISO8601 format.

## Getting started
You'll need to install NodeJS. Once you have NodeJS run npm/yarn `install` in the directory to install dependencies.

You'll then need to run npm/yarn `start` to start the server on port 3000.

You can then build your app in its own directory and connect locally to the server. Your app will be tested against the server provided in this test, so please don't make any changes to `server.js`.

## Comments
If you have any issues with the test, please get in touch.

We're looking for confident use of Javascript (ES6 syntax), and an understanding of core front end concepts such as events, promises, state, etc.

Please compile your JS so it works across modern browsers and use a linter.

This challenge has been tested with Node v8.9.4 on macOS High Sierra. Any OS that supports NodeJS should work with a modern version of Node.
