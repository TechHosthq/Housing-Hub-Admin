/**
 * Turns any API failure into sentences fit to show a user.
 *
 * Three shapes arrive here, and the third is why this was rewritten:
 *
 *  1. `BaseResponse` / `BaseErrorResponse` — the app's own envelope, with a
 *     `message` and sometimes an `error` list. Camel-cased on the wire.
 *  2. A 200 carrying `isSuccessful: false`, handled by the axios interceptor.
 *  3. ASP.NET Core's `ValidationProblemDetails`, produced when model binding
 *     rejects a request before any application code runs. Its `errors` is an
 *     **object keyed by C# property name**, not an array, and it has no `message`.
 *
 * The old version mishandled all of (3): it read `data.message`, found nothing,
 * and callers fell through to axios's own text — which is how a user was shown
 * "Request failed with status code 400". Where it did find `errors`, it was an
 * object, so it emitted a literal `{"PhoneNumber":["The PhoneNumber field is
 * required."]}`.
 *
 * The APIs now shape model-state failures into the standard envelope, so (3)
 * should no longer appear from our own backend. It is still handled here, because
 * a client should not depend on the server having been fixed.
 *
 * Rule: never surface `error.message`. That is the HTTP library talking, and it
 * says things like "Network Error" and "Request failed with status code 400".
 */

const FALLBACK = 'Something went wrong. Please try again.';

export interface ApiErrorResponse {
  StatusCode?: string | number;
  statusCode?: string | number;
  Message?: string;
  message?: string;
  /** Our envelope: BaseErrorResponse.Error, a set of sentences. */
  Error?: string[] | string;
  error?: string[] | string;
  /**
   * Either our own list, or ProblemDetails' field-keyed object. The union is the
   * point — both really do turn up under this name.
   */
  errors?: string[] | string | Record<string, string[] | string>;
  /** ProblemDetails' summary line. Deliberately not shown; see below. */
  title?: string;
  isSuccessful?: boolean;
}

/** Sentences out of anything the `errors`/`error` field might hold. */
const flatten = (value: unknown): string[] => {
  if (value == null) return [];

  if (typeof value === 'string') return value.trim() ? [value] : [];

  if (Array.isArray(value)) {
    return value.flatMap(flatten);
  }

  if (typeof value === 'object') {
    // ProblemDetails: { PhoneNumber: ["The PhoneNumber field is required."] }.
    // The keys are C# property names and are never shown — the values already
    // read as sentences, and the server-side formatter produces better ones.
    return Object.values(value as Record<string, unknown>).flatMap(flatten);
  }

  return [];
};

export const resolveApiError = (error: any): string[] => {
  const data = error?.response?.data as ApiErrorResponse | undefined;

  // No body at all: a network failure, a CORS rejection, or a payload refused by
  // the gateway before it reached the app. axios's text for these is not fit to
  // show, so say something true instead.
  if (!data || typeof data !== 'object') {
    return [FALLBACK];
  }

  // The envelope's own message is preferred over any per-field list: it is written
  // for a person, whereas the list is a breakdown. `title` is skipped on purpose —
  // ProblemDetails sets it to "One or more validation errors occurred.", which is
  // true and useless.
  const summary = data.message || data.Message;
  if (summary && String(summary).trim()) {
    return [String(summary)];
  }

  const details = flatten(data.errors ?? data.error ?? data.Error);
  if (details.length > 0) {
    return details;
  }

  return [FALLBACK];
};
