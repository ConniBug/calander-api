"use strict";
const {authWrapper} = require("../proxys/authProxy");
const memberGateway = require("../gatewayFunctions/memberGateway");
const eventGateway = require("../gatewayFunctions/eventGateway");
module.exports = (app) => {
  const memberGateway = require("../gatewayFunctions/memberGateway");
  const authenticationGateway = require("../gatewayFunctions/authGateway");
  const testingGateway = require("../gatewayFunctions/testingGateway.js");
  const eventGateway = require("../gatewayFunctions/eventGateway.js");

  const authWrapper = require("../proxys/authProxy").authWrapper;

  const monitoringUtils = require("./../../Utils/monitor");

  /**
   *  Un-Authenticated Routes
   */
  //#region Un-Authenticated Routes

  app
      .route("/api/member/register")
      .post(memberGateway.createNewMember);

  app
      .route("/api/member/login")
      .post(memberGateway.login);

  //#endregion

  /**
   *  Authenticated Routes
   */
  //#region Authenticated Routes

  /**
   *
   *  Member Gateways
   *
   */
  //#region Member Gateway
  app
    .route("/api/member/:MemberID")
    .get(authWrapper, memberGateway.getMemberRecord)
    .put(authWrapper, memberGateway.updateMember)
    .delete(authWrapper, memberGateway.deleteMember);
  app
    .route("/api/member/:MemberID/calander")
    .post(authWrapper, memberGateway.createNewCalander)
    .delete(authWrapper, memberGateway.deleteCalander);
  //#endregion

  /**
   *
   * Event Gateways
   *
   */
  app
      .route("/api/member/:MemberID/calander/:CalanderID")
      .post(authWrapper, eventGateway.createNewEvent)
      .get(authWrapper, eventGateway.getEvents);

  app
      .route("/api/:MemberID/:CalanderID/:EventID")
      .put(authWrapper, eventGateway.updateEvent)
      .delete(authWrapper, eventGateway.deleteEvent);
  //#endregion

  /**
   * Monitoring API
   */
  //#region Monitoring API

  app.route("/api/monitoring/data").get(monitoringUtils.data);

  //#endregion

  /**
   *  Testing Stuff
   */
  //#region Testing stuff

  app.route("/api/test/1").post(testingGateway.test1);

  //#endregion
};
