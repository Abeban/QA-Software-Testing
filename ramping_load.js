import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  scenarios: {
    ramping: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 20,
      maxVUs: 150,
      stages: [
        { duration: "5s", target: 100 }, // ramp up to 100 RPS in 20s
        { duration: "7s", target: 100 }, // hold at 100 RPS for 30s
        { duration: "8s", target: 20 }, // ramp down to 20 RPS in 20s
      ],
    },
  },
};

export default function () {
  let res = http.get(
    "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
  );
  check(res, {
    "status code is 200": (r) => r.status === 200,
  });
}
