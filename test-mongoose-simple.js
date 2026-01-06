console.log("Start");
try {
  const mongoose = require('mongoose');
  console.log("Mongoose loaded", mongoose.version);
} catch (e) {
  console.error("Failed to load mongoose", e);
}
console.log("End");
