import app from "./app";
import config from "./config";
import "dotenv/config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    await prisma.$disconnect(); // Disconnect from the database in case of an error
    process.exit(1); // Exit the process with an error code
  }
}

main();
