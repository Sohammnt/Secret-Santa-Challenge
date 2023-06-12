const xlsx = require("xlsx");

// Read input file and return a Promise that resolves to the employee data
module.exports.readInputFile = (inputFile) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(inputFile);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);
      if (data.length < 1) {
        throw new Error("Csv File Invalid or Empty");
      }
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

// Generate the output CSV file with secret Santa assignments

module.exports.generateOutputFile = (secretSantaAssignments, outputFile) => {
  const worksheet = xlsx.utils.json_to_sheet(secretSantaAssignments);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, outputFile);
};
