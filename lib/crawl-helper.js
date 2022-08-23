const fetch = require("node-fetch");
const cheerio = require("cheerio");
const helper = require("./helper");
const logHelper = require("./logger");
const fs = require("fs");

const url = "https://www.amazon.com/hz/reviews-render/ajax/reviews/get/";

var reviews = [];

const requestReviews = async (
  HANDLE,
  ASIN,
  pageNumber,
  cookie,
  EMAIL = "example@example.com"
) => {
  //   console.log(
  //     "Requesting For - Page Number : ",
  //     pageNumber,
  //     " - Handle : ",
  //     HANDLE,
  //     " - ASIN : ",
  //     ASIN
  //   );
  const params = `sortBy=&reviewerType=all_reviews&formatType=&mediaType=&filterByStar=&pageNumber=${pageNumber}&filterByLanguage=&filterByKeyword=&shouldAppend=undefined&deviceType=desktop&canShowIntHeader=undefined&reftag=cm_cr_getr_d_paging_btm_next_${pageNumber}&pageSize=20&asin=${ASIN}&scope=reviewsAjax${pageNumber}`;
  const ref = `ref=cm_cr_getr_d_paging_btm_next_${pageNumber}`;
  const endpoint = url + ref;

  const headers = {
    authority: "www.amazon.com",
    accept: "text/html,*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    Cookie: cookie,
    "device-memory": "8",
    downlink: "10",
    dpr: "2",
    ect: "4g",
    origin: "https://www.amazon.com",
    pragma: "no-cache",
    rtt: "50",
    "sec-ch-device-memory": "8",
    "sec-ch-dpr": "2",
    "sec-ch-ua":
      '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-ch-viewport-width": "610",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    "viewport-width": "610",
    "x-requested-with": "XMLHttpRequest",
  };

  const options = {
    method: "POST",
    headers: headers,
    body: params,
  };

  await fetch(endpoint, options)
    .then(async (response) => await response.text())
    .then(async (result) => {
      //   fs.writeFileSync(`./files/result_${pageNumber}.txt`, result.toString());
      const $ = cheerio.load(result, null, false);

      const message = $('b[class="h1"]').text();
      //console.log(result);
      if (message !== "Looking for something?") {
        const dataArray = await result.split("&&&");

        if (dataArray.length > 6) {
          for (
            let dataIndex = 6;
            dataIndex < dataArray.length - 6;
            dataIndex++
          ) {
            // console.log("----------- " + dataIndex + " --------------" + "\n");
            // console.log(dataArray[dataIndex] + "\n");

            const reviewHtmlArray = await dataArray[dataIndex].split(",");

            let reviewHtml = "";
            for (let i = 2; i < reviewHtmlArray.length; i++) {
              reviewHtml += await reviewHtmlArray[i];
            }
            reviewHtml = reviewHtml.substring(1);
            reviewHtml = reviewHtml.slice(0, -3).replace(/\\/g, "");
            //console.log(reviewHtml)

            const $ = cheerio.load(reviewHtml, null, false);

            const reviewerName = $('span[class="a-profile-name"]').text();
            const reviewTitle = $(".review-title").children("span").text();
            const reviewRating = $(".review-rating").children("span").text()[0];
            const reviewText = $(".review-text").children("span").text();
            const reviewDate = $(".review-date").text().split(" on ")[1];

            // console.log("Reviewer Name : " + reviewerName + "\n" +
            //             "Review Title : " + reviewTitle + "\n" +
            //             "Review Rating : " + reviewRating + "\n" +
            //             "Review Text : " + reviewText + "\n" +
            //             "Review Date : " + reviewDate + "\n")

            const reviewObject = {
              reviewerName: reviewerName,
              reviewTitle: reviewTitle,
              reviewRating: reviewRating,
              reviewText: reviewText,
              reviewDate: reviewDate,
            };
            //console.log(reviewObject);
            let reviewFormattedDate = "";
            if (
              reviewObject.reviewerName ||
              reviewObject.reviewTitle ||
              reviewObject.reviewRating ||
              reviewObject.reviewText ||
              reviewObject.reviewDate
            ) {
              const formattedDate = reviewObject.reviewDate.split(" ");
              reviewFormattedDate =
                formattedDate[2] +
                "-" +
                helper.formatMonthFromString(formattedDate[0]) +
                "-" +
                helper.formatNumberDate(formattedDate[1]);

              const formattedObject = {
                shopifyProductHandle: HANDLE,
                reviewCreationDate: reviewFormattedDate,
                reviewContent: reviewObject.reviewText,
                reviewScore: reviewObject.reviewRating,
                reviewTitle: reviewObject.reviewTitle,
                reviewerDisplayName: reviewObject.reviewerName,
                reviewerEmail: EMAIL,
                publishReview: "TRUE",
              };

              reviews.push(formattedObject);
            }
          }

          pageNumber = (await pageNumber) + 1;
          await requestReviews(
            await HANDLE,
            await ASIN,
            await pageNumber,
            await cookie
          );
        } else {
          // Done Crawling
          //resolve(reviews);
        }
      } else {
        await logHelper.log.error(
          `Error : Cookie is expired at page number - ${pageNumber}, For - Handle : ${HANDLE}, ASIN : ${ASIN}`
        );
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
};

const crawlReviews = async (
  HANDLE,
  ASIN,
  pageNumber,
  cookie,
  EMAIL = "example@example.com",
  clear = true
) => {
  if (clear) {
    reviews.length = 0;
  }
  return await new Promise(async (resolve, reject) => {
    reviews.length = 0;
    await requestReviews(HANDLE, ASIN, pageNumber, cookie, EMAIL);
    resolve(reviews);
  });
};

module.exports = { crawlReviews };
