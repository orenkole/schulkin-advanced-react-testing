import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";

import { ToastOptions } from "../types";
import {logErrorToasts, sendToAnalytics} from "./LogErrorToastSaga";
import { showToast } from "./toastSlice";

const errorToastOptions: ToastOptions = {
  title: "It's time to panic",
  status: "error",
};

const errorToastAction = {
  type: "test",
  payload: errorToastOptions,
};

test("saga calls analytics when it receives error toast", () => {
  return expectSaga(logErrorToasts, errorToastAction)
    .call(sendToAnalytics, errorToastOptions.title)
    .run();
});
