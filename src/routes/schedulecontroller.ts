import * as express from 'express';
import * as luxon from 'luxon';

const url = require('url');

var faker = require('faker');

import { Flight } from '../entity/flight';
import { Crewmember } from '../entity/crewmember';
import { Airport } from '../entity/airport';
import { Delay } from '../entity/delay';

class ScheduleController {
  public router = express.Router();
  public path = '/schedule';

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.GetSchedule);
  }

  GetSchedule = (request: express.Request, response: express.Response) => {
    const queryObject = url.parse(request.url, true).query;

    let startDate = luxon.DateTime.utc().startOf('day');
    let endDate = startDate.plus({ days: 7 });

    if ('start' in queryObject && 'end' in queryObject) {
      startDate = luxon.DateTime.fromISO(queryObject.start, { zone: 'utc' });
      endDate = luxon.DateTime.fromISO(queryObject.end, { zone: 'utc' });
    }

    let aircraftCount = 10;
    if ('aircraftCount' in queryObject) {
      aircraftCount = Number.parseInt(queryObject.aircraftCount);
    }

    let flightCount = 20;
    if ('flightCount' in queryObject) {
      flightCount = Number.parseInt(queryObject.flightCount);
    }

    const flights = GenerateFlights(
      aircraftCount,
      flightCount,
      startDate,
      endDate
    );
    response.send(flights);
  };
}

function GenerateFlights(
  aircraftCount: number,
  flightsCount: number,
  start: luxon.DateTime,
  end: luxon.DateTime
) {
  console.log(
    'Generating ' +
      aircraftCount +
      ' aircraft with ' +
      flightsCount +
      ' flights from ' +
      start.toString() +
      ' to ' +
      end.toString()
  );

  let flights = new Array<Flight>();
  let aircrafts = new Array<String>();
  var aircraftModels = ['747-400', 'A320-500'];

  for (var i = 0; i < aircraftCount; i++) {
    let aircraft_registration =
      'N' + faker.random.number({ min: 100, max: 999 }) + 'VT';

    // don't allow the same aircraft twice
    while (aircrafts.includes(aircraft_registration)) {
      aircraft_registration =
        'N' + faker.random.number({ min: 100, max: 999 }) + 'VT';
    }
    aircrafts.push(aircraft_registration);

    const aircraftModel =
      aircraftModels[Math.floor(Math.random() * aircraftModels.length)];

    //initialize the first flight
    let lastFlight = new Flight(faker.random.number({ min: 100, max: 9999 }));
    lastFlight.id = faker.random.number({ min: 100, max: 9999 }) + i * 10000;
    lastFlight.arrival_airport = new Airport().random();
    lastFlight.estimated_time_arrival = start.minus({ hours: 4 });

    for (var j = 0; j < flightsCount; j++) {
      let thisFlight: Flight = new Flight(lastFlight.id + 1);
      thisFlight.aircraft_registration = aircraft_registration;
      thisFlight.aircraft_model = aircraftModel;
      thisFlight.departure_airport = lastFlight.arrival_airport;
      thisFlight.arrival_airport = new Airport().random();

      //don't allow the aircraft to depart and arrive in the same location
      while (
        thisFlight.arrival_airport.iata == thisFlight.departure_airport.iata
      ) {
        thisFlight.arrival_airport = new Airport().random();
      }

      //add random between 1-6 for ground
      thisFlight.estimated_time_departure = lastFlight.estimated_time_arrival.plus(
        { hours: faker.random.number({ min: 1, max: 6 }) }
      );

      //add random between 3-12 for flight
      thisFlight.estimated_time_arrival = thisFlight.estimated_time_departure.plus(
        { hours: faker.random.number({ min: 3, max: 12 }) }
      );
      thisFlight.distance = thisFlight.departure_airport.distanceBetween(
        thisFlight.arrival_airport
      );

      //add 2 crewmembers
      thisFlight.crewmembers.push(new Crewmember().random());
      thisFlight.crewmembers.push(new Crewmember().random());

      //make sure the 2 aren't the same
      while (thisFlight.crewmembers[0].id == thisFlight.crewmembers[1].id) {
        thisFlight.crewmembers[1] = new Crewmember().random();
      }

      //add random delays
      thisFlight.delays = GetDelays();

      flights.push(thisFlight);
      lastFlight = thisFlight;
    }
  }
  return flights;
}

function GetDelays() {
  const delays = new Array<Delay>();

  // 1 in 20 chance of a flight delay: 5%

  const delaysExist = faker.random.number({ min: 0, max: 20 }) === 1;

  if (delaysExist) {
    // if we're that 5% that has a delay, generate between 1-3 random delay codes
    const delayCount = faker.random.number({ min: 1, max: 3 });
    for (let index = 0; index < delayCount; index++) {
      const delay = new Delay().random();
      // if we don't already have this delay code, add it - prevents duplicates
      if (delays.find((d) => d.code == delay.code) == undefined) {
        delays.push(delay);
      }
    }
  }
  return delays;
}

export default ScheduleController;
