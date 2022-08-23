const fetch = import('node-fetch')

const appKey = 'nXnTwN1tP0bYpIz88ALgavTrkhRUBygBnpQ0G0sq'
const secretKey = 'V6nLnYY9z3beRP1gq4RrxmDDwSMoOv4SfAfjkYhV'

const authenticate = async () => {
    const url = 'https://api.yotpo.com/oauth/token';
    const options = {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: appKey,
            client_secret: secretKey
        })
    };

    fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
}

const accessToken = 'PBs4j2k3RXhP3wHW1BWScqADHyI2cnMuGJg3M1ka'

const createReview = async () => {
    const url = 'https://api.yotpo.com/v1/widget/reviews';
    const options = {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            appkey: 'nXnTwN1tP0bYpIz88ALgavTrkhRUBygBnpQ0G0sq',
            domain: 'https://bm-test-store-101.myshopify.com/',
            sku: 'ASH-101',
            product_title: 'Ashwagandha Root',
            product_description: 'Not for use during pregnancy or lactation. If you have a medical condition or take medications, please consult with your doctor before use. Store away from children. Use only as directed on label. Safety-sealed for your protection. Keep bottle capped at all times and store in a cool, dry place. Natural separation may occur. This does not affect product quality.',
            product_url: 'https://bm-test-store-101.myshopify.com/products/ashwagandha-root',
            product_image_url: 'https://cdn.shopify.com/s/files/1/0626/6991/4299/products/Gaia-Herbs-Ashwagandha-Root_LAE12060_102-0421_PDP_1060x_cede2987-64cf-4c8a-9e25-407a56f6cf14.png?v=1660036118',
            display_name: 'Test Reviewer',
            email: 'fahimuddin@brillmark.com',
            is_incentivized: true,
            review_content: 'Its really good',
            review_title: 'Great Herb',
            review_score: 5
        })
    };

    fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
}

module.exports = {
    createReview
}

