const yotpoLib = require('./lib/yotpo-api')
const crawler = require('./lib/crawler')

const run = async () => {
    const ASIN_LIST = [
        'B08Z9NHD2L',
        'B003VT3YP0',
        'B006P8NAHQ',
        'B0036THMYE',
        'B0036THLWM',
        'B06XSTTX7C',
        'B00F43LEKS',
        'B01DA54ESK',
        'B00F1J8CJG',
        'B07H2QFMNR'
    ]
    
    // For Single Products Multiple Reviews Test ----------------
    const numberOfReviews = 39;
    crawler.crawlByProductASIN(ASIN_LIST[0], numberOfReviews)

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
    
    
}

run()

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


