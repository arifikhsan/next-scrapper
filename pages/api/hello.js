// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const puppeteer = require('puppeteer')

const handler = async(req, res) => {
    const { number } = req.query
    const url = 'https://my.service.nsw.gov.au/MyServiceNSW/index#/rms/freeRegoCheck/details'
    try {
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()

        await page.goto(url)
        await page.waitForSelector('#formly_2_input_plateNumber_0');
        // await page.type('#formly_2_input_plateNumber_0', 'eeb72z') // found
        await page.type('#formly_2_input_plateNumber_0', number)
        await page.click('#formly_2_checkbox-label-with-action_termsAndConditions_1');
        await page.click('button[type="submit"]')
        await page.waitForNavigation()
        const titles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h1'), (element) => element.innerText)
        })
        const found = titles[1] == 'Vehicle details'
        console.log(found)
        if (!found) {
            res.status(422).json({ message: 'Vehicle not found!' })
        }
        const vehicle = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('small'), (element) => element.innerText)
        })
        console.log(vehicle)
        if (vehicle && vehicle.length > 0) {
            const data = vehicle.slice(1, 3)
            res.status(200).json({ message: 'Vehicle found!', data })
        }
        await browser.close()
    } catch (error) {
        res.status(422).json({ message: 'Something went wrong', error: error })
    }
}

export default handler