import { Context, Form, HttpRequest, Logger } from "@azure/functions";

// From: https://storck.io/posts/writing-testing-azure-functions-with-typescript/

// Mock the Azure Function context object
export const buildContext = (): Context => ({
  bindingData: undefined,
  bindingDefinitions: [],
  bindings: {},
  executionContext: undefined,
  invocationId: "",
  log: createLogger(),
  traceContext: undefined,
  done: () => {},
});

// Mock the Azure Function HTTP request object
export const buildHttpRequest = (): HttpRequest => ({
  headers: undefined,
  method: undefined,
  params: undefined,
  parseFormBody(): Form { return undefined; },
  query: {},
  url: "",
  user: undefined,
});

// Mock the Azure Function logger object
const createLogger = (): Logger => {
  const logger = () => {};
  logger.error = () => {};
  logger.info = () => {};
  logger.verbose = () => {};
  logger.warn = () => {};
  return logger;
};