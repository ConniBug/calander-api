"use strict";
const mongoose = require("mongoose");
const CBucket = mongoose.connection.model("CalendarBucket");

const codes = require("../../Utils/misc/error_codes").codes;

const eventFunctions = require("../../Utils/functions/eventFunctions");

const l = require("@connibug/js-logging");
const monitoring = require("../../Utils/monitor");

exports.getEventInfo = async (eventID) => {
  let startTimestamp = new Date().getTime();

  let member = await CBucket.find({ id: eventID }).catch((err) => {
    if (err) {
      console.log(err);
      l.log("getEventRecord had an error", "ERROR");
    }
  });

  let duration = new Date().getTime() - startTimestamp;
  l.log(`[ ${duration}ms ] - [ N/A ] - Get event info`);

  monitoring.log(
      "getEventInfo - gateway",
      new Date().getTime() - startTimestamp
  );

  return member;
};

exports.getEvents = async (req, res) => {
  let startTimestamp = new Date().getTime();

  let start_date, end_date = 0;

  let memberID = req.params.MemberID;
  let calendarID = req.params.CalendarID;

  let limit = req.body.limit;
  let title = req.body.title;
  let description = req.body.description;

  let eventArray = await eventFunctions.getEvents(memberID, calendarID, limit, title, description, start_date, end_date).catch((err) => {
    console.log("ERR: ", err);

    res.status(codes.Bad_Request);
    res.send("err");
  });
  res.status(codes.Ok);
  res.json(eventArray);

  let duration = new Date().getTime() - startTimestamp;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  l.log(`[ ${duration}ms ] - [ ${ip} ] - Get events`);

  monitoring.log(
      "getEvents - gateway",
      duration
  );
};

exports.createNewEvent = async (req, res) => {
  let startTimestamp = new Date().getTime();

  let memberID = req.params.MemberID;
  let calendarID = req.params.CalendarID;

  let response = await eventFunctions
      .newEvent(memberID, calendarID,
          req.body.title,
          req.body.description,
          req.body.start,
          req.body.end,
          req.body.location)
      .catch((err) => {
        console.log("ERR: ", err);
        res.status(codes.Bad_Request);
        return "error";
      });
  if (typeof response !== "object" && response.includes("exists")) {
    res.status(codes.Conflict);
    res.send({ error: response });
    return;
  }
  if (response === "err") {
    res.status(codes.Bad_Request);
  } else {
    res.status(codes.Ok);
  }
  res.json({ response: { id: response } });


  let duration = new Date().getTime() - startTimestamp;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  l.log(`[ ${duration}ms ] - [ ${ip} ] - New event`);

  monitoring.log(
      "newEvent - gateway",
      new Date().getTime() - startTimestamp
  );
};

exports.updateEvent = async (req, res) => {
  let startTimestamp = new Date().getTime();

  let memberID = req.params.MemberID;
  let calendarID = req.params.CalendarID;
  let eventID = req.params.EventID;

  let update = {};
  req.body.title ? (update.title = req.body.title) : null;
  req.body.description ? (update.description = req.body.description) : null;
  req.body.authorID ? (update.authorID = req.body.authorID) : null;
  req.body.calendarID ? (update.calendarID = req.body.calendarID) : null;
  req.body.start ? (update.eventStart = req.body.start) : null;
  req.body.end ? (update.eventEnd = req.body.end) : null;
  req.body.location ? (update.location = req.body.location) : null;

  l.log("Updating event id: " + eventID + " - with: " + JSON.stringify(update))

  let eventArray = await eventFunctions.updateEvent(memberID, eventID, update).catch((err) => {
    console.log("ERR: ", err);

    res.status(codes.Bad_Request);
    res.send("err");
  });
  res.status(codes.Ok);
  res.json(eventArray);

  let duration = new Date().getTime() - startTimestamp;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  l.log(`[ ${duration}ms ] - [ ${ip} ] - Update event`);

  monitoring.log(
      "updateEvent - gateway",
      duration
  );
};

exports.updateMember = async (req, res) => {
  res.status(codes.Ok);
  res.send("Disabled gateway.");
  // var response = Members.findOneAndUpdate({ id: req.params.MemberID
  // },req.body, { new: true }
  //     console.log("ERR: ", err);
  //     return ("err");
  // });

  // if (response == "err") {
  //     res.status(codes.Bad_Request);
  // } else {
  //     res.status(codes.Ok);
  // }
  // Members.findOneAndUpdate({ id: req.params.MemberID },
  //     req.body, { new: true },
  //     (err, Response) => {
  //         if (err) {
  //             res.status(codes.Bad_Request);
  //             res.send(err);
  //             return;
  //         }

  //         res.status(codes.Accepted);
  //         res.json(Response);
  //     }
  // );
};

exports.deleteEvent = async (req, res) => {
  let startTimestamp = new Date().getTime();

  let memberID = req.params.MemberID;
  let calendarID = req.params.CalendarID;
  let eventID = req.params.EventID;

  let response = await eventFunctions.deleteEvent(memberID, eventID).catch((err) => {
    console.log("ERR: ", err);
    res.status(codes.Bad_Request);
    return "err";
  });

  if (response === "err") {
    res.status(codes.Bad_Request);
  } else {
    res.status(codes.Ok);
  }
  res.json({ response: response });

  let duration = new Date().getTime() - startTimestamp;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  l.log(`[ ${duration}ms ] - [ ${ip} ] - Delete event`);

  monitoring.log(
    "deleteEvent - gateway",
    new Date().getTime() - startTimestamp
  );
};

