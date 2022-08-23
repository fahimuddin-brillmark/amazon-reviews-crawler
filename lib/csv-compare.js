const fs = require("fs");
const csv2json = require("csvjson-csv2json");

/**
 * Convert CSV to JSON using csvjson-csv2json@5.0.6 library
 * https://www.npmjs.com/package/csvjson-csv2json
 *
 * params
 * @string
 */
const convertCSVtoJSON = async (csv) => {
  const json = csv2json(await csv, {
    parseNumbers: true,
    parseJson: false, // JSON validation
  });

  return json;
};

const generateDeltaFile = (
  pathToBaseFile,
  pathToFileForComparison,
  pathForOutputFileName = "./difference.csv"
) => {
  let baseFileContent = "",
    secondaryFileContent = "",
    changedLine = "";
  return new Promise((resolve, reject) => {
    const baseFileReadstream = fs.createReadStream(pathToBaseFile);
    baseFileReadstream
      .on("data", (chunk) => {
        baseFileContent = baseFileContent + chunk;
        //console.log(baseFileContent);
      })
      //.on("error", (err) => console.log(err))
      .on("end", () => {
        const secondaryFileReadstream = fs.createReadStream(
          pathToFileForComparison
        );

        secondaryFileReadstream
          .on("data", (data) => {
            secondaryFileContent = secondaryFileContent + data;
            //console.log(secondaryFileContent);
          })
          //.on("error", (err) => console.log("ok", err))
          .on("end", async () => {
            try {
              //   console.log("basefile: ", baseFileContent.length);
              //   console.log("secondaryfile", secondaryFileContent.length);
              const crawledJSONData = await convertCSVtoJSON(
                baseFileContent.toString()
              );
              const yotpoJSONData = await convertCSVtoJSON(
                secondaryFileContent.toString()
              );
              //console.log(yotpoJSONData);
              //console.log(crawledJSONData);
              for (const data of crawledJSONData) {
                for (const yotpoData of yotpoJSONData) {
                  if (data["Review Content"] === yotpoData["Review Content"]) {
                    const index = crawledJSONData.indexOf(data);

                    if (index > -1) {
                      // only splice array when item is found
                      crawledJSONData.splice(index, 1); // 2nd parameter means remove one item only
                    }
                  }
                }
              }
              // await crawledJSONData.forEach(async (data) => {
              //   await yotpoJSONData.forEach((yotpoData) => {

              //   });
              // });

              //console.log(crawledJSONData);

              var json = crawledJSONData;
              var fields = Object.keys(json[0]);
              //console.log(fields);
              var replacer = function (key, value) {
                return value === null ? "" : value;
              };
              var csv = await json.map(function (row, rowIndex) {
                const data = fields
                  .map(function (fieldName, columnIndex) {
                    //console.log(row[fieldName]);
                    //return JSON.stringify(row[fieldName], replacer)
                    return replacer(null, row[fieldName]);
                  })
                  .join(",");
                return data;
              });
              //console.log(csv);
              await csv.unshift(fields.join(",")); // add header column
              csv = await csv.join("\r\n");
              changedLine = await csv;

              // split all lines by \n to form an array for both base and secondary files
              // const internLines = baseFileContent.toString().split('\n');
              // const externLines = secondaryFileContent.toString().split('\n');

              // internLines.forEach((iLine) => {
              //     const comparableContentAgainst = iLine.split(',')[2];
              //     var isUnique = false;
              //     externLines.forEach((eLine) =>  {
              //         const comparableContent = eLine.split(',')[9];
              //         // console.log("genCSVLine = " + comparableContentAgainst + "\n\n");
              //         // console.log("yotpoCSVLine = " + comparableContent + "\n\n");
              //         // console.log(`Matched ? = ${(comparableContent === comparableContentAgainst)}`);
              //         //console.log(comparableContent === comparableContentAgainst);
              //         if(comparableContent !== comparableContentAgainst) {
              //             isUnique = true;
              //         } else {
              //             isUnique = false;
              //         }
              //     });
              //     //console.log(isUnique);
              //     if(isUnique) {
              //         changedLine = changedLine + iLine + '\n'
              //     }

              // })

              // Create a json object with each secondary file line as its key and value as true
              // const externLookup = {};
              // externLines.forEach((eLine) =>  {
              //     const comparableContent = eLine.split(',')[9];
              //     internLines.forEach((iLine) => {
              //         const comparableContentAgainst = iLine.split(',')[2];
              //         console.log("genCSVLine = " + comparableContentAgainst + "\n\n");
              //         console.log("yotpoCSVLine = " + comparableContent + "\n\n");
              //         console.log(`Matched ? = ${(comparableContent === comparableContentAgainst)}`);
              //         //console.log(comparableContent === comparableContentAgainst);
              //         if(comparableContent !== comparableContentAgainst) {
              //             changedLine = changedLine + iLine + '\n'
              //         }
              //     })
              //     externLookup[eLine] = true;
              // });
              //console.log(externLookup);
              // Iterate through each line of base file
              // internLines.forEach(iLine => {
              //     // use above formed json object and pass each line as key
              //     // value of externLookup[iLine] would be undefined if secondary file didn't have same line
              //     // in that case current line is considered as changed line and will be eventually written to output file
              //     if (!externLookup[iLine]) changedLine = changedLine + iLine + '\n'
              // })
              //console.log(internLines[0]);
              //console.log(changedLine);
              fs.writeFileSync(pathForOutputFileName, changedLine);
              resolve("DONE");
            } catch (error) {
              console.log("Error : ", error);
            }

            //crawledJSONData[0]["Review Content"]
            // console.log(yotpoJSONData[0]);

            // console.log(crawledJSONData.length);
          });
      });
  });
};

module.exports = { generateDeltaFile };
