const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.globus.ch/polo-ralph-lauren-jacke-1313051700525';

async function web() {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
        args: ['--start-maximized'] 
       });
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function price(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(html);

    $('span.sc-ZEldx, span.sc-ghzrUh.YQUuk', html).each(function() {
        let dollarPrice = $(this).text();
        // console.log(dollarPrice);
        var currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g,""));
        // console.log(currentPrice);
    
        if (currentPrice < 500){
            sendNotif(currentPrice);
        }
    });
}

async function track() {
    const page = await web();
    let job = new CronJob('*/60 * * * * *',function () {
        price(page);
    },null,true,null,null,true);
    job.start();
}

async function sendNotif(price){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jababen316@gmail.com',
          pass: 'uhwt bspm ymad gfcs'
        }
      });
    
      let textToSend = 'Price dropped to ' + price;
      let htmlText = `<a href=\"${url}\">Link</a>`;
    
      let info = await transporter.sendMail({
        from: '"Price Tracker" <jababen316@gmail.com>',
        to: "jababen316@gmail.com",
        subject: 'Price dropped to ' + price, 
        text: textToSend,
        html: htmlText
      });
      console.log("message sent successfully");
}

track();

