const reviewsCrawler = require("amazon-reviews-crawler");

reviewsCrawler('B08Z9NHD2L', {
    page: 'https://www.amazon.com/product-reviews/{{asin}}',
    //userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    elements: {
        // Searches whole page
        productTitle: '.product-title',
        reviewBlock: '.review',

        // Searches within elements.reviewBlock
        link: 'a',
        title: '.review-title',
        rating: '.review-rating',
        ratingPattern: 'a-star-',
        text: '.review-text',
        author: '.a-profile-name',
        date: '.review-date'
    },

    // Stops crawling when it hits a particular review ID
    // Useful for only crawling new reviews
    stopAtReviewId: false
})
.then(data => {
    console.log(data.reviews[0].author);
})
.catch(console.error)
