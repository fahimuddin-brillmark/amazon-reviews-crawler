const fs = require("fs");

const generateCSVByFile = async (_FILE_DIRECTORY, CSV_OBJECT) => {
  const tempFileName = await _FILE_DIRECTORY;

  const newLine = "\r\n";
  var fields = [
    "Shopify Product Handle",
    "Review Creation Date",
    "Review Content",
    "Review Score",
    "Review Title",
    "Reviewer Display Name",
    "Reviewer Email",
    "Publish Review",
  ];

  return new Promise(async (resolve, reject) => {
    fields = fields + newLine;

    //write the actual data and end with newline
    let rows = "";
    await CSV_OBJECT.forEach(async (rowArray) => {
      const row = Object.values(await rowArray);
      //console.log(row);
      rows += `${row}` + newLine;
    });

    fs.writeFile(await tempFileName, fields + rows, async (error) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        // console.log("Generated CSV file saved!");
        resolve(await tempFileName);
      }
    });
  });
};

const generateCSVByAppending = async (_FILE_DIRECTORY, CSV_OBJECT) => {
  const tempFileName = await _FILE_DIRECTORY;

  const newLine = "\r\n";
  var fields = [
    "Shopify Product Handle",
    "Review Creation Date",
    "Review Content",
    "Review Score",
    "Review Title (optional)",
    "Reviewer Display Name",
    "Reviewer Email",
    "Publish Review",
  ];

  return new Promise(async (resolve, reject) => {
    fs.stat(await tempFileName, async (error, stat) => {
      if (error == null) {
        //write the actual data and end with newline
        let rows = "";
        await CSV_OBJECT.forEach(async (rowArray) => {
          const row = Object.values(await rowArray);
          //console.log(row);
          rows += `${row}` + newLine;
        });

        fs.appendFile(await tempFileName, rows, async (error) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve(await tempFileName);
          }
        });
      } else {
        fields = fields + newLine;

        fs.writeFile(await tempFileName, fields, async (error) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve(await tempFileName);
          }
        });
      }
    });
  });
};

module.exports = { generateCSVByFile, generateCSVByAppending };
