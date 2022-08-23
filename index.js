const yotpoLib = require("./lib/yotpo-api");
const crawler = require("./lib/crawler");
const crawlHelper = require("./lib/crawl-helper");
const csvHelper = require("./lib/csv-helper");

const logHelper = require("./lib/logger");

const compareHelper = require("./lib/csv-compare");
const mergerHelper = require("./lib/csv-merger");

const fs = require("fs");

const csv = require("fast-csv");

//const filePathToProducts = "./files/products/gaiaherbs-products.csv";
const filePathToProducts = "./files/products/test-products.csv";

const getProducts = async (pathToFile) => {
  return new Promise((resolve, reject) => {
    const products = [];
    csv
      .parseFile(pathToFile, { headers: true })
      .on("data", (data) => {
        products.push(data);
      })
      .on("error", (error) => reject(error))
      .on("end", () => {
        resolve(products);
      });
  });
};

const run = async () => {
  // Get the products mapped with Amazon and Shopify
  let mappedProducts = [];
  await getProducts(filePathToProducts).then((products) => {
    mappedProducts = products;
    logHelper.log.info("#1 Mapped Products are ready !");
  });

  // Crawl the reviews from Amazon
  logHelper.log.info("#2 Start Crawling from Amazon ----------------------- ");

  // Set Cookie
  const cookie =
    'session-id=146-7794386-9616029; session-id-time=2082787201l; i18n-prefs=USD; sp-cdn="L5Z9:BD"; ubid-main=131-8286786-9231155; session-token=FEdTXDQPB2hk0sTQhIfrfBgVMv/esyUA/DWIisnG8g2KGwJOiq8A87kXeszk+qV/98urCO2KuBmkpXu/6OOdFf04729YhFtUMBrUawSnLV65ZFoteJUDfDhqt3R0zXVm12pQwKCy2MAWhMrvUquTYzM91jGxWAiiCxZfMCWsTbBsmAS4ti4vgkMZnwmSgbbimQ9bc8RM+5z0NpI2XsKMzdHeLn8CQAL8; csm-hit=tb:s-X0DAGBSD9B417ZM24Y5X|1661238146453&t:1661238146520&adb:adblk_no';

  // Start the Timer
  const startTime = Date.now();

  // Loop Here for multiple Products
  for (const [index, product] of mappedProducts.entries()) {
    //console.log();
    const handle = await product.HANDLE;
    const asins = await product.ASIN.replace(/\n/g, ",").split(",");

    //console.log(asins);

    if (asins.length > 1) {
      // do loop through asins for the same handle
      for (const [subIndex, asin] of asins.entries()) {
        const asinCounter = subIndex;
        logHelper.log.info(
          `#${index}.${subIndex} Crawling for '${handle}'-[#${
            asinCounter + 1
          } ${asin}]...`
        );
        const reviews = await crawlHelper.crawlReviews(handle, asin, 1, cookie);
        // const reviews = await crawler.crawlReviews(handle, asin, 1);
        logHelper.log.info(
          `#${index}.${subIndex} Finished Crawling for '${handle}'-[#${
            asinCounter + 1
          } ${asin}]...`
        );
        if (subIndex === 0) {
          const fileDirectory = `./files/amazon/${handle}.csv`;
          await logHelper.log.info(
            `#${index}.${subIndex} Creating CSV file for '${handle}'-[#${
              asinCounter + 1
            } ${asin}]...`
          );
          await csvHelper.generateCSVByFile(fileDirectory, reviews);
          await logHelper.log.info(
            `#${index}.${subIndex} Generated CSV file for '${handle}'-[#${
              asinCounter + 1
            } ${asin}]...`
          );
        } else {
          const fileDirectory = `./files/amazon/${handle}.csv`;
          await logHelper.log.info(
            `#${index}.${subIndex} Creating CSV file for '${handle}'-[#${
              asinCounter + 1
            } ${asin}]...`
          );
          await csvHelper.generateCSVByAppending(fileDirectory, reviews);
          await logHelper.log.info(
            `#${index}.${subIndex} Generated CSV file for '${handle}'-[#${
              asinCounter + 1
            } ${asin}]...`
          );
        }
        logHelper.log.info(
          `#${index}.${subIndex} Total Crawled Reviews for '${handle}'-[#${
            asinCounter + 1
          } ${asin}] : --- ${reviews.length} ---`
        );
      }
    } else {
      const asinCounter = 0;
      await logHelper.log.info(
        `#${index} Crawling for '${handle}'-[#${asinCounter + 1} ${
          asins[asinCounter]
        }]...`
      );
      const reviews = await crawlHelper.crawlReviews(
        await handle,
        await asins[asinCounter],
        1,
        cookie
      );
      //   const reviews = await crawler.crawlReviews(
      //     await handle,
      //     await asins[asinCounter],
      //     1
      //   );
      await logHelper.log.info(
        `#${index} Finished Crawling for '${handle}'-[#${asinCounter + 1} ${
          asins[asinCounter]
        }]...`
      );
      const fileDirectory = `./files/amazon/${handle}.csv`;
      await logHelper.log.info(
        `#${index} Creating CSV file for '${handle}'-[#${asinCounter + 1} ${
          asins[asinCounter]
        }]...`
      );
      await csvHelper.generateCSVByFile(fileDirectory, reviews);
      await logHelper.log.info(
        `#${index} Generated CSV file for '${handle}'-[#${asinCounter + 1} ${
          asins[asinCounter]
        }]...`
      );
      await logHelper.log.info(
        `#${index} Total Crawled Reviews for '${handle}'-[#${asinCounter + 1} ${
          asins[asinCounter]
        }] : --- ${reviews.length} ---`
      );
    }
  }
  await logHelper.log.info(
    `#2 End Crawling from Amazon ----------------------- `
  );
  const endTime = Date.now();
  const timeNeeded = (endTime - startTime) / 1000 + "s";
  await logHelper.log.info(`#2 Total Time needed : ${timeNeeded}`);
  // End Crawling ------------------------------------

  // Merge All Products CSVs
  const csvFilesDirectory = "./files/amazon/";
  const outputMergesDirectory = "./files/merged.csv";

  logHelper.log.info(`#3 Start Merging CSV Files... `);

  const csvFiles = fs.readdirSync(csvFilesDirectory);
  for (let i = 0; i < csvFiles.length; i++) {
    csvFiles[i] = csvFilesDirectory + csvFiles[i];
  }

  await mergerHelper
    .concatCSVAndOutput(csvFiles, outputMergesDirectory)
    .then(
      async () =>
        await logHelper.log.info(
          `#3 Finished Merging CSV Files ----------------------- `
        )
    );
  // End Merging ---------------------------------------

  // Start Comparing -----------------------------------

  const mergedFile = outputMergesDirectory;
  const compareFile = "./files/yotpo/reviews.csv";
  const finalOutputFile = "./files/final.csv";
  await logHelper.log.info(`#4 Looking for Unique Reviews...`);

  setTimeout(async () => {
    await compareHelper.generateDeltaFile(
      mergedFile,
      compareFile,
      finalOutputFile
    );
    await logHelper.log.info(
      `#4 Successfully generated Unique Reviews at ${finalOutputFile} ----------------------- `
    );
  }, 5000);

  //   const ASIN_LIST = [
  //     "B08Z9NHD2L",
  //     "B003VT3YP0",
  //     "B006P8NAHQ",
  //     "B0036THMYE",
  //     "B0036THLWM",
  //     "B06XSTTX7C",
  //     "B00F43LEKS",
  //     "B01DA54ESK",
  //     "B00F1J8CJG",
  //     "B07H2QFMNR",
  //   ];

  //   const HANDLE_LIST = ["ashwagandha-root"];

  // For Single Products Multiple Reviews Test ----------------
  // const numberOfReviews = 32;
  // crawler.crawlByProductASIN(ASIN_LIST[0], numberOfReviews)

  // For 10 Products Test ----------------------
  // ASIN_LIST.forEach(ASIN => {
  //     crawler.crawlByProductASIN(ASIN)
  // });

  // Single Request Test -----------------------
  // yotpoLib.createReview()

  // Multiple Request Test ---------------------
  // for(let i = 0; i < 6; i++) {
  //     yotpoLib.createReview()
  // }

  // logHelper.log.info('Started...')

  // await compareHelper.generateDeltaFile('./tmp/Yotpo_template.csv', './yotpo/Yotpo_reviews_export_2022_08_19_11_19.csv')

  // logHelper.log.info('Done Preparing CSV')
};

run();

// var request = require("request");
// var options = {
//   method: "POST",
//   url: "https://www.amazon.com/hz/reviews-render/ajax/reviews/get/ref=cm_cr_arp_d_paging_btm_next_6",
//   headers: {
//     authority: "www.amazon.com",
//     accept: "text/html,*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "cache-control": "no-cache",
//     "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
//     cookie:
//       'session-id=146-7281317-3997738; session-id-time=2082787201l; i18n-prefs=USD; sp-cdn="L5Z9:IN"; csm-hit=tb:s-J79CHYKXAZWW7HB0VXAR|1661181452257&t:1661181452579&adb:adblk_no; ubid-main=131-0029529-9238429; session-token=RHNgjLq/zkBA/ZNavmOOiNLU1Y/qMp8JWRgvssGJgWGqJf6t3Bffm1Rt9NZcd77B5z6SoCbZqbh4LAwKt07B2hOFvEBHcxwMd/AqR72UXSAiD4LHMGBrjAo5h3li5zDKNn6+rkrxXZj4X9u+xvrGMSVwUAtSaWG3BPqq9Lu1od+NGjs6aZlhW1Y1fZb/PQKRCLtz1e+eqiDe193uq7gJnEF1qGY03zMJ; session-id=144-7590761-9349020; session-id-time=2082787201l; session-token=J5NPPodsQf6ALmMMbGTB4E+QbzA3myadtrhY3aNkRB7nnw17bkFi84O7M36wOlRcpBj+Azw0hbwskgXl/fz1FCLekCGhA0iFRg8V7y8flUWR/LggEUYDgtsQl1HYEbJ6K3NR69FRLiQ9/ZKm0AhDtnr6ufOdT4aXE2uwXTR2+BLPP+C9E2rBoN8/+OnrTmWbvwTn1p6mqbDXy/0iHWdDikXgD2ASuQRf; ubid-main=135-2971400-5012863',
//     "device-memory": "8",
//     downlink: "10",
//     dpr: "2",
//     ect: "4g",
//     origin: "https://www.amazon.com",
//     pragma: "no-cache",
//     referer:
//       "https://www.amazon.com/product-reviews/B00F1J8HOQ/ref=cm_cr_getr_d_paging_btm_next_5?pageNumber=5",
//     rtt: "50",
//     "sec-ch-device-memory": "8",
//     "sec-ch-dpr": "2",
//     "sec-ch-ua":
//       '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": '"macOS"',
//     "sec-ch-viewport-width": "610",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "user-agent":
//       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
//     "viewport-width": "610",
//     "x-requested-with": "XMLHttpRequest",
//   },
//   body: "sortBy=&reviewerType=all_reviews&formatType=&mediaType=&filterByStar=&pageNumber=1&filterByLanguage=&filterByKeyword=&shouldAppend=undefined&deviceType=desktop&canShowIntHeader=undefined&reftag=cm_cr_getr_d_paging_btm_next_1&pageSize=10&asin=B00F1J8HOQ&scope=reviewsAjax1",
// };
// request(options, function (error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);
// });

// From Yotpo Widget --------------------------------------------
// review_score: 3
// review_title: Good Okay
// review_content: Good Herb
// display_name: Jhon Melon
// email: fahimuddin@brillmark.com
// appkey: nXnTwN1tP0bYpIz88ALgavTrkhRUBygBnpQ0G0sq
// review_source: widget_v2
// sku: 7610492387515
// product_title: Ashwagandha Root
// product_description: <span data-mce-fragment="1">Not for use during pregnancy or lactation. If you have a medical condition or take medications, please consult with your doctor before use. Store away from children. Use only as directed on label. Safety-sealed for your protection. Keep bottle capped at all times and store in a cool, dry place. Natural separation may occur. This does not affect product quality.</span>
// product_url: https://bm-test-store-101.myshopify.com/products/ashwagandha-root
// product_image_url: products/Gaia-Herbs-Ashwagandha-Root_LAE12060_102-0421_PDP_1060x_cede2987-64cf-4c8a-9e25-407a56f6cf14.png
