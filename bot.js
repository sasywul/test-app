// sanity.js
const axios = require("axios");

(async () => {
  const res = await axios.get("https://sima.usm.ac.id", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36"
    }
  });

  console.log("HTML length:", res.data.length);
})();
