const reviewsCrawler = require('amazon-reviews-crawler')

// https://www.amazon.com/Gaia-Herbs-Vegan-Liquid-Capsules/product-reviews/B07H2QFMNR/ref=reviewerType=all_reviews
// https://www.amazon.com/product-reviews/B07H2QFMNR/ref=cm_cr_arp_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&pageNumber=2

// https://www.amazon.com/product-reviews/B07H2QFMNR/ref=cm_cr_getr_d_paging_btm_next_4?ie=UTF8&reviewerType=all_reviews&pageNumber=4
const reviewsPageLink = 'https://www.amazon.com/product-reviews'
const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'

// As Amazon Updates
const htmlProductTitleClass = '.product-title'
const htmlReviewBlockClass = '.review'
const htmlLink = 'a'
const htmlReviewTitleClass = '.review-title'
const htmlReviewRatingClass = '.review-rating'
const htmlReviewRatingPatternClass = 'a-star-'
const htmlReviewTextClass = '.review-text'
const htmlReviewAuthorClass = '.a-profile-name'
const htmlReviewDateClass = '.review-date'

const htmlReviewElements = {
    // Searches whole page
    productTitle: htmlProductTitleClass,
    reviewBlock: htmlReviewBlockClass,

    // Searches within elements.reviewBlock
    link: htmlLink,
    title: htmlReviewTitleClass,
    rating: htmlReviewRatingClass,
    ratingPattern: htmlReviewRatingPatternClass,
    text: htmlReviewTextClass,
    author: htmlReviewAuthorClass,
    date: htmlReviewDateClass
}

const crawlByProductASIN = async (ASIN, TOTAL) => {
    const startTime = Date.now()

    let itemsPerPage = 10 // In amazon 10 reviews only available per page
    let totalPages = Math.ceil(TOTAL / itemsPerPage)
    console.log('Total Pages - ', totalPages);
    for(let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        await reviewsCrawler(ASIN, {
            page: reviewsPageLink + '/{{asin}}/ref=cm_cr_getr_d_paging_btm_next_' + pageNumber + '?ie=UTF8&reviewerType=all_reviews&pageNumber=' + pageNumber,
            userAgent: userAgent,
            elements: htmlReviewElements,
        
            // Stops crawling when it hits a particular review ID
            // Useful for only crawling new reviews
            stopAtReviewId: false
        })
        .then(async data => {
            console.log('Page Number - ' + pageNumber);
            const review = await data.reviews[0].author
            const endTime = Date.now()
            console.log('Total Reviews : ' + data.reviews.length + ', Reviewer : ' + review + ', Time Needed : ' + (endTime - startTime) / 1000 + 's')
        })
        .catch(console.error)
    }
}

module.exports = { crawlByProductASIN }