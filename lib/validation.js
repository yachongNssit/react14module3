const MAX_TEXT_LENGTH = 200;

// OBJECTIVE: Data validation and error handling
//
// Checked HERE, at the API boundary, before anything reaches the
// database. lib/db.js trusts that whatever arrives at it is already
// valid — that separation (validate at the edge, trust past it) keeps
// the database layer simple and keeps every validation rule in one
// place instead of scattered across every route that touches notes.

export function validateText(text) {
  if (typeof text !== "string") {
    return "Text must be a string";
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return "Text is required";
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return `Text must be ${MAX_TEXT_LENGTH} characters or fewer`;
  }
  return null; // no error = valid
}

export function isValidId(id) {
  return /^\d+$/.test(id);
}
