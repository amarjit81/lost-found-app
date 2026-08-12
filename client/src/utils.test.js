import test from "node:test";
import assert from "node:assert/strict";
import { initials, queryString } from "./utils.js";

test("initials uses the first two words", () => assert.equal(initials("Laishram Amarjit Singh"), "LA"));
test("queryString skips empty filters", () => assert.equal(queryString({ type: "lost", search: "" }), "type=lost"));
