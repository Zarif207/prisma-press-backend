import app from "./app";

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process with an error code
  }
}

main();
