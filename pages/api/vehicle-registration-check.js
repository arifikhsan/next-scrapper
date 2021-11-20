// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';
// const puppeteer = require('puppeteer')
// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'HEAD'],
    origin: '*'
  })
);

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
  await cors(req, res);
  const { number } = req.query;
  const url =
    'https://my.service.nsw.gov.au/MyServiceNSW/index#/rms/freeRegoCheck/details';
  let browser;
  let finalResult = '';
  try {
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
    await page.type('#formly_2_input_plateNumber_0', number);
    await page.click(
      '#formly_2_checkbox-label-with-action_termsAndConditions_1'
    );
    page.on('response', async (response) => {
      response.text().then(function (textBody) {
        if (textBody.startsWith('[')) {
          const json = JSON.parse(textBody);
          const body = json[0];
          if (body.method == 'postVehicleListForFreeRegoCheck') {
            finalResult = body.result;
            browser.close();
          }
        }
      });
    });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    // console.log('doneee');
    if (finalResult) {
      res.status(200).json({
        data: finalResult,
      });
    }
  } catch (error) {
    res.status(200).json({ data: finalResult });
  }
};

export default handler;
