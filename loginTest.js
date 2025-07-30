// Import core K6 tools:
// - http: to send login requests to the website
// - check: to verify if the response is correct (e.g., status code 200)
// - SharedArray: to load and reuse multiple user logins from users.json
import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// Tell the script to load the users from users.json
const users = new SharedArray("users", function () {
  return JSON.parse(open("./users.json"));
});

// Test config: 10 virtual users for 30 seconds to see how system handles real-time traffic
export let options = {
  stages: [
    { duration: "10s", target: 5 }, // ramp-up to 5 users
    { duration: "30s", target: 10 }, // stay steady(concurrent) at 10 users
    { duration: "10s", target: 0 }, // ramp-down to 0
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // less than 1% fail
    http_req_duration: ["p(95)<500"], // 95% of responses under 500ms
  },
};

// Main test function: runs once for each virtual user (VU)
export default function () {
  // Choose a user based on the VU number
  const user = users[__VU % users.length];

  // Send a POST request to the login URL using the chosen username and password
  let res = http.post(
    "https://opensource-demo.orangehrmlive.com/web/index.php/auth/validate",
    JSON.stringify({
      username: user.username,
      password: user.password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Check if the response is successful and fast
  check(res, {
    "login success (200 or 302)": (r) => r.status === 200 || r.status === 302,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
