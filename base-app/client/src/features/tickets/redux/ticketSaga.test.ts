import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";

import { holdReservation } from "../../../test-utils/fake-data";
import { showToast } from "../../toast/redux/toastSlice";
import { releaseServerCall, reserveTicketServerCall } from "../api";
import { TicketAction } from "../types";
import { generateErrorToastOptions, ticketFlow } from "./ticketSaga";
import { selectors, startTicketAbort } from "./ticketSlice";

const holdAction = {
  type: "test",
  payload: holdReservation,
};

describe("Common to all flows", () => {
  test("starts with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [matchers.call.fn(reserveTicketServerCall), null],
        [matchers.call.fn(releaseServerCall), null],
      ])
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: "Abort! Abort!",
        })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });
  test("show error toast and clean up after server error", () => {
    return (
      expectSaga(ticketFlow, holdAction)
        .provide([
          [
            matchers.call.fn(reserveTicketServerCall),
            throwError(new Error("it did not work")),
          ],
          // write matcher for selector
          [
            matchers.select.selector(selectors.getTicketAction),
            TicketAction.hold,
          ],
          [matchers.call.fn(releaseServerCall), null],
        ])
        // assert on startToast action
        .put(
          showToast(
            generateErrorToastOptions("it did not work", TicketAction.hold)
          )
        )
        .run()
    );
  });
});
