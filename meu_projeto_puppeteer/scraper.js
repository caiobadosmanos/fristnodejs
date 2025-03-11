const puppeteer = require('puppeteer');

async function scrapeTerabyteShop() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.terabyteshop.com.br/busca?str=amd', { waitUntil: 'networkidle2' });

    // Espera os produtos carregarem
    await page.waitForSelector('.product-item_box', { timeout: 120000 });

    let hasMoreProducts = true;
    while (hasMoreProducts) {
        try {
            // Clica no botão "Ver mais produtos" se ele existir
            const loadMoreButton = await page.$('#pdmore');
            if (loadMoreButton) {
                await loadMoreButton.click();
                await page.waitForTimeout(3000); // Aguarda carregar mais produtos
            } else {
                hasMoreProducts = false;
            }
        } catch (error) {
            hasMoreProducts = false;
        }
    }

    // Captura os produtos
    const products = await page.$$eval('.product-item_box', items => {
        return items.map(item => {
            const linkElement = item.querySelector('a');
            const imgElement = item.querySelector('img');
            const priceElement = item.querySelector('.price'); // Verifique se este seletor está correto
            const title = linkElement ? linkElement.title : '';
            const link = linkElement ? linkElement.href : '';
            const img = imgElement ? imgElement.src : '';
            const price = priceElement ? priceElement.innerText.trim() : '';

            return { title, link, img, price };
        });
    });

    console.log(products);
    await browser.close();
}

scrapeTerabyteShop();
