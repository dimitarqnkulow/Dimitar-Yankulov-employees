const form = document.getElementById("csvForm");
let allEmp = null;
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const files = document.getElementById("csvFile").files;
  if (files.length > 0) {
    const csvFile = files[0];
    const reader = new FileReader();
    reader.readAsText(csvFile);

    reader.onload = function (e) {
      e.preventDefault();
      const csvData = e.target.result;

      const rawData = csvData.split("\n");
      allEmp = csvToArr(csvData, ",");

      const tBody = document.getElementById("tableBody");
      const finalParagraph = document.getElementById("longestPair");
      tBody.innerHTML = "";
      rawData.shift();
      rawData.forEach((row) => {
        const newRow = tBody.insertRow();

        let rowColData = row.split(",");
        rowColData.forEach((element) => {
          const newCell = newRow.insertCell();
          newCell.innerHTML = element;
        });
      });
      //Separation of the employees by projectid
      let projects = {};

      for (const object of allEmp) {
        if (!projects[object.projectId]) {
          projects[object.projectId] = {
            projectId: object.projectId,
          };
          projects[object.projectId].projectEmps = [object];
        } else {
          projects[object.projectId].projectEmps.push(object);
        }
      }
      projects = Object.values(projects);
      const longestWorkingPairs = [];
      for (let i = 0; i < projects.length; i++) {
        longestWorkingPairs.push(empWorkingTogether(projects[i]));
      }
      let longestWorkingPair = longestWorkingPairs
        .sort((a, b) => a.daysTogether < b.daysTogether)
        .shift();
      longestWorkingPair = Object.values(longestWorkingPair);
      finalParagraph.innerHTML = `${longestWorkingPair.join(", ")}`;
    };
  } else {
    alert("Please select a file.");
  }
});
//Convert csv file to array of objects
function csvToArr(stringVal, splitter) {
  const [keys, ...rest] = stringVal
    .trim()
    .split("\r\n")
    .map((item) => item.split(splitter));

  const formedArr = rest.map((item) => {
    const object = {};
    keys.forEach((key, index) => (object[key] = item.at(index)));
    return object;
  });
  return formedArr;
}

//Each Project longest pair
function empWorkingTogether(project) {
  let arrayOfPairs = [];
  const employees = project.projectEmps;
  //Dates in time
  employees.map((emp) => {
    emp.dateFrom = new Date(emp.dateFrom.match(/(\d+)/g).join("/")).getTime();
    if (emp.dateTo == "null") {
      emp.dateTo = new Date().getTime();
    } else {
      emp.dateTo = new Date(emp.dateTo.match(/(\d+)/g).join("/")).getTime();
    }
  });
  for (let i = 0; i < employees.length; i++) {
    const currentEmp = employees[i];
    for (let j = i + 1; j < employees.length; j++) {
      const comparingEmp = employees[j];
      let daysTogether;
      if (
        currentEmp.dateFrom >= comparingEmp.dateFrom &&
        currentEmp.dateFrom < comparingEmp.dateTo
      ) {
        if (currentEmp.dateTo >= comparingEmp.dateTo) {
          daysTogether = Math.floor(
            (comparingEmp.dateTo - currentEmp.dateFrom) / (1000 * 60 * 60 * 24)
          );

          arrayOfPairs.push({
            emp1Id: currentEmp.empId,
            emp2Id: comparingEmp.empId,
            projectId: currentEmp.projectId,
            daysTogether,
          });
        } else if (currentEmp.dateTo <= comparingEmp.dateTo) {
          daysTogether = Math.floor(
            (currentEmp.dateTo - currentEmp.dateFrom) / (1000 * 60 * 60 * 24)
          );
          arrayOfPairs.push({
            emp1Id: currentEmp.empId,
            emp2Id: comparingEmp.empId,
            projectId: currentEmp.projectId,
            daysTogether,
          });
        }
      } else if (
        currentEmp.dateFrom <= comparingEmp.dateFrom &&
        comparingEmp.dateFrom < currentEmp.dateTo
      ) {
        if (comparingEmp.dateTo <= currentEmp.dateTo) {
          daysTogether = Math.floor(
            (comparingEmp.dateTo - comparingEmp.dateFrom) /
              (1000 * 60 * 60 * 24)
          );
          arrayOfPairs.push({
            emp1Id: currentEmp.empId,
            emp2Id: comparingEmp.empId,
            projectId: currentEmp.projectId,
            daysTogether,
          });
        } else if (comparingEmp.dateTo >= currentEmp.dateTo) {
          daysTogether = Math.floor(
            (currentEmp.dateTo - comparingEmp.dateFrom) / (1000 * 60 * 60 * 24)
          );
          arrayOfPairs.push({
            emp1Id: currentEmp.empId,
            emp2Id: comparingEmp.empId,
            projectId: currentEmp.projectId,
            daysTogether,
          });
        }
      }
    }
  }
  if (arrayOfPairs.length > 0) {
    return arrayOfPairs.sort((a, b) => a.daysTogether < b.daysTogether).shift();
  }
}
