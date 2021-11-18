// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// const puppeteer = require('puppeteer')
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

const handler = async (req, res) => {
  const { number } = req.query;
  const url =
    'https://my.service.nsw.gov.au/MyServiceNSW/index#/rms/freeRegoCheck/details';
  try {
    let browser;
    let notFoundMessage = '';
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      browser = await puppeteer.launch({
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      });
    } else {
      browser = await puppeteer.launch({ headless: true });
    }

    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector('#formly_2_input_plateNumber_0');
    // await page.type('#formly_2_input_plateNumber_0', 'eeb72z') // found
    await page.type('#formly_2_input_plateNumber_0', number);
    await page.click(
      '#formly_2_checkbox-label-with-action_termsAndConditions_1'
    );
    // await page.click('button[type="submit"]');
    page.on('response', (response) => {
      response.text().then(function (textBody) {
        if (textBody) {
          const text = JSON.parse(textBody);
          const result = text[0].result;
          if (result) {
            const message = result.statusMessage;
            if (message && message !== 'SUCCESS' && message !== 'success') {
              notFoundMessage = message;
              browser.close();
              return res.status(422).json({ message });
            }
          }
        }
      });
    });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    console.log('doneee');
    const titles = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('h1'),
        (element) => element.innerText
      );
    });
    console.log(titles);
    const found = titles[1] == 'Vehicle details';
    console.log(found);
    if (!found) {
      res.status(422).json({
        message: 'Vehicle not found. Please check and try again.',
      });
    }
    const vehicle = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('small'),
        (element) => element.innerText
      );
    });
    console.log(vehicle);
    if (vehicle && vehicle.length > 0) {
      const data = vehicle.slice(1, 3);
      res.status(200).json({ message: 'Vehicle found!', data });
    }
    await browser.close();
  } catch (error) {
    res.status(422).json({ message: 'Something went wrong', error: error });
  }
};

export default handler;
