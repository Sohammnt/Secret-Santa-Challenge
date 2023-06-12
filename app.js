const { generateOutputFile, readInputFile } = require("./file.service");
const _ = require("lodash");
const {
  uniqueEmployeeField,
  employeeExcelHeaders,
  lastYearExcelHeaders,
} = require("./constants");

// Assign secret children to employees based on constraints
function assignSecretChildren(employeeData, previousYearSecretSanta) {
  const secretSantaAssignments = [];

  const availableEmployees = [...employeeData];
  const availableChildren = [...employeeData];

  for (const employee of employeeData) {
    let child = null;
    let attempts = 0;

    while (
      !child ||
      employee.Employee_Name === child.Employee_Name ||
      isPreviousChild(employee, child, previousYearSecretSanta)
    ) {
      if (attempts >= availableChildren.length) {
        // Unable to find a valid child, restart the process
        return assignSecretChildren(employeeData, previousYearSecretSanta);
      }

      const randomIndex = Math.floor(Math.random() * availableChildren.length);
      child = availableChildren[randomIndex];
      attempts++;
    }

    if (child) {
      secretSantaAssignments.push({
        employeeName: employee.Employee_Name,
        employeeEmailID: employee.Employee_EmailID,
        secretChildName: child.Employee_Name,
        secretChildEmailID: child.Employee_EmailID,
      });

      // Remove assigned employee and child from available employees and children
      availableEmployees.splice(availableEmployees.indexOf(employee), 1);
      availableChildren.splice(availableChildren.indexOf(child), 1);
    }
  }

  return secretSantaAssignments;
}

// Check if the employee and child were paired in the previous assignments
function isPreviousChild(employee, child, previousYearSecretSanta) {
  return previousYearSecretSanta.some(
    (assignment) =>
      assignment.employeeName === employee.Employee_Name &&
      assignment.secretChildName === child.Employee_Name
  );
}

function checkMandatoryHeaders(mandatoryHeaders, excelDataRow) {
  const keys = Object.keys(excelDataRow);
  return mandatoryHeaders.every((header) => keys.includes(header));
}

//Function to generate Secret Santa Output file
async function getSecretSantaGameFile(
  employeeFile,
  previousYearSecretSantaFile,
  outputFile
) {
  try {
    const employeeData = await readInputFile(employeeFile);

    if (employeeData.length === 1) {
      throw new Error(
        "Only one employee present data not enough to map secret child."
      );
    }
    if (!checkMandatoryHeaders(employeeExcelHeaders, employeeData[0])) {
      throw new Error("Invalid Headers in Employee Excel");
    }

    const uniqueEmployeeData = _.uniqBy(employeeData, uniqueEmployeeField);

    const previousYearSecretSanta = await readInputFile(
      previousYearSecretSantaFile
    );
    if (
      !checkMandatoryHeaders(lastYearExcelHeaders, previousYearSecretSanta[0])
    ) {
      throw new Error("Invalid Headers in Last Year Assignment Excel");
    }

    const secretSantaAssignments = assignSecretChildren(
      uniqueEmployeeData,
      previousYearSecretSanta
    );

    generateOutputFile(secretSantaAssignments, outputFile);

    console.log("Secret Santa assignments generated successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const employeeFile = "employee-excel/Employee-List Duplicates.xlsx";
const previousYearSecretSantaFile =
  "last-year-assignment-excel/Secret-Santa-Game-Result-2023.xlsx";
const outputFile = "output-excel/Secret-Santa-Game-Result-2024.xlsx";
getSecretSantaGameFile(employeeFile, previousYearSecretSantaFile, outputFile);
