import http2 from "http2";
import fs from "fs";

const client = http2.connect("https://localhost:8443", {
  ca: fs.readFileSync("cert.pem")
});

client.on("error", (err) => console.error(err));

function request(path) {
  const req = client.request({":path": path});

  const response = {};

  req.setTimeout(5000, () => {
    console.log("request timeout");
    req.close();
  });

  req.on("response", (headers, flags) => {
    response.headers = headers;
  });

  req.setEncoding("utf8");
  response.data = "";
  req.on("data", (chunk) => {
    response.data += chunk;
  });

  req.on("end", () => {
    console.log();
    for (const name in response.headers) {
      console.log(`${name}: ${response.headers[name]}`);
    }
    console.log(`${response.data}`);
    console.log();
  });

  req.end(() => {
    console.log("request sent");
  });
}

request("/ping");
request("/ping");
request("/foo");

console.log("press enter to quit anytime...");
process.stdin.once("data", () => {
  client.close();
  process.exit();
});