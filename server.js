const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const _ = require('lodash')
const app = express()

app.use(bodyParser.json())

const makeNight = (dateStr) => moment(dateStr).startOf('day').format()

var data = [
  makeNight("2018-01-01"),
  makeNight("2018-01-08"),
  makeNight("2018-02-14"),
  makeNight("2018-02-28"),
  makeNight("2018-03-15"),
  makeNight("2018-03-16"),
  makeNight("2018-04-12"),
  makeNight("2018-04-18"),
  makeNight("2018-05-25"),
  makeNight("2018-06-18"),
  makeNight("2018-07-02"),
  makeNight("2018-08-11"),
  makeNight("2018-09-25"),
  makeNight("2018-10-14"),
  makeNight("2018-11-01"),
  makeNight("2018-12-29"),
];

// How not to handle CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.header("Access-Control-Allow-Headers",
             "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function badRequest(response) {
  response.status(400);
  response.send('Bad Request');
}

function internalError(response) {
  response.status(500);
  response.send('Internal Server Error');
}

// Simulate failure every so often and artificial latency
var failureProb = 0.1;
var maxLatency = 1500;

function send(response, data) {
  if (Math.random() < failureProb) {
    internalError(response);
    return;
  }
  var latency = Math.floor(Math.random() * maxLatency);
  setTimeout(function() {
    response.send(JSON.stringify(data))
  }, latency);
}

// End-point to get booked nights for a given month
// * start and end are dates in ISO8601 format
app.get('/reserved/:start/:end', function(request, response) {
  const start = moment(request.params.start, 'YYYY-MM-DD')
  const end = moment(request.params.end, 'YYYY-MM-DD')
  if (!start.isValid() || !end.isValid()) {
    badRequest(response)
    return
  }
  const availableDays = data.filter(date => moment(date).isSameOrBefore(moment(end)) && moment(date).isSameOrAfter(moment(start)))
  send(response, {
    payload: availableDays,
  });
});

// End-point to change
app.put('/reserved/:date', function(request, response) {
  console.log("Reservation", request.body.reserved)
  const date = moment(request.params.date);
  const reserved = !!request.body.reserved;
  if (!date.isValid()) {
    badRequest(response);
    return;
  }
  else {
    if (reserved) {
      if (!data.includes(date.format())) {
        data.push(date.format());
      }
    } else {
      _.pull(data, date.format());
    }
    send(response, {
      ok: true
    });
  }
});

// Get server time
app.get('/now', function(request, response) {
  send(response, {
    date: moment().format()
  });
});

app.get('/', (req, res) => res.send('Good luck 👍'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
