const { io } = require("socket.io-client");
const { v4: uuidv4 } = require("uuid");

const BASE_URL = process.argv[2] || "https://openscg-app-cocuoryrwa-ew.a.run.app";
const SOCKET_PATH = "/api/socket";

async function runTest() {
  console.log(`[E2E Test] Target: ${BASE_URL}`);

  // 1. Anonymous Authorization
  console.log("[E2E Test] Step 1: Anonymous Authorization...");
  let deviceCode;
  let cookie;
  try {
    const response = await fetch(`${BASE_URL}/api/auth/device`, {
      method: "POST",
    });
    const data = await response.json();
    deviceCode = data.deviceCode;
    cookie = response.headers.get("set-cookie");
    console.log(`[E2E Test] Auth Success. Device Code: ${deviceCode}`);
  } catch (error) {
    console.error("[E2E Test] Auth Failed:", error.message);
    process.exit(1);
  }

  // 2. Session Initialization
  const sessionId = uuidv4();
  console.log(`[E2E Test] Step 2: Session Initialized: ${sessionId}`);

  // 3. WebSocket Real-time Test
  console.log("[E2E Test] Step 3: Testing WebSocket Connection & Real-time Broadcast...");

  const createSocket = (name) => {
    return io(BASE_URL, {
      path: SOCKET_PATH,
      extraHeaders: cookie ? { Cookie: cookie } : {},
      transports: ["polling", "websocket"], // Match client-side fallback
    });
  };

  const sender = createSocket("Sender (Patient)");
  const receiver = createSocket("Receiver (Doctor)");

  const testPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for real-time data"));
    }, 10000);

    let connectedCount = 0;
    const onConnect = () => {
      connectedCount++;
      if (connectedCount === 2) {
        console.log("[E2E Test] Both sockets connected. Joining session...");
        sender.emit("join-session", sessionId);
        receiver.emit("join-session", sessionId);

        // Wait a bit for join to complete on server
        setTimeout(() => {
          console.log("[E2E Test] Sending test data (V2 Tuple format)...");
          sender.emit("scg-data", {
            sessionId,
            data: [
              [Date.now(), 0.1, 0.2, 0.9],
              [Date.now() + 10, 0.11, 0.21, 0.91],
            ],
          });
        }, 1000);
      }
    };

    sender.on("connect", onConnect);
    receiver.on("connect", onConnect);

    receiver.on("scg-data", (data) => {
      console.log("[E2E Test] Receiver received scg-data!");
      // Standardized server broadcasts raw array of points
      if (Array.isArray(data) && data.length === 2) {
        // Verify it's a tuple [t, ax, ay, az]
        const firstPoint = data[0];
        if (Array.isArray(firstPoint) && firstPoint.length === 4) {
          console.log("[E2E Test] V2 Tuple format verified.");
          clearTimeout(timeout);
          resolve();
        } else {
          console.warn("[E2E Test] Data is array but not V2 Tuple format:", firstPoint);
        }
      } else {
        console.warn("[E2E Test] Received unexpected data format:", data);
      }
    });

    sender.on("connect_error", (err) => console.error("[Sender] Connect Error:", err.message));
    receiver.on("connect_error", (err) => console.error("[Receiver] Connect Error:", err.message));
  });

  try {
    await testPromise;
    console.log("[E2E Test] PASSED: All steps completed successfully.");
    sender.disconnect();
    receiver.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[E2E Test] FAILED: ${error.message}`);
    sender.disconnect();
    receiver.disconnect();
    process.exit(1);
  }
}

runTest();
