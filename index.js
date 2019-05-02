const puppeteer = require('puppeteer')
const prices = require('./prices.json')
const conf = require('./conf.json')
const fs = require('fs')
const { promisify } = require("util")
const writeFile = promisify(fs.writeFile)

;(async () => {
    const puppet = await puppeteer.launch({headless: false})

    page = (await puppet.pages())[0]

    await page.goto('http://drunkmenworkhere.org/185.php?action=login')

    var nameinput = await page.waitForSelector('input[name=name]')
    var passinput = await page.waitForSelector('input[name=password]')
    var submitbutton = await page.waitForSelector('input[type=submit]')
    await nameinput.type(conf.username)
    await passinput.type(conf.password)
    await submitbutton.click()

    while(true) {
        await page.waitForNavigation({timeout: 0})

        var availableselect = await page.waitForSelector('select[name=drug]', {timeout: 0})
        var innerTexts = await availableselect.$$eval('option', nodes => nodes.map(n => n.innerText))
        var availables = {}

        innerTexts.forEach(innerText => {
            var [name, price] = innerText.split(' - ')
            price = price.split(' ')[1]
            availables[name] = price
        })

        Object.keys(prices).forEach(name => {
            prices[name].push(parseInt(availables[name]))
        })

        await writeFile('prices.json', JSON.stringify(prices))

        await page.waitForRequest(req => req.url().match(/185\.php\?l=\d/g), {timeout: 0})
    }
})()