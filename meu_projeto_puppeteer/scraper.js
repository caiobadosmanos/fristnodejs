const puppeteer = require('puppeteer');

async function scrapeTerabyteShop() {
  const browser = await puppeteer.launch({ headless: false }); // Desabilita o modo headless
  const page = await browser.newPage();
  await page.goto('https://www.terabyteshop.com.br/busca?str=amd');

  let products = [];
  let loadMoreVisible = true;

  while (loadMoreVisible) {
    await page.waitForSelector('.commerce_columns_item_inner', { timeout: 60000 });

    const newProducts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.commerce_columns_item_inner')).map(product => {
        const titleElement = product.querySelector('.prod-name a');
        const priceElement = product.querySelector('.prod-new-price');
        const installmentElement = product.querySelector('.prod-juros');

        return {
          link: titleElement ? titleElement.href : null,
          title: titleElement ? titleElement.innerText.trim() : null,
          image: product.querySelector('.prod-img img') ? product.querySelector('.prod-img img').src : null,
          price: priceElement ? priceElement.innerText.trim() : null,
          installment: installmentElement ? installmentElement.innerText.trim() : null,
        };
      });
    });

    products = products.concat(newProducts);

    // Verifica se o botão "Ver mais produtos" está visível
    loadMoreVisible = await page.evaluate(() => {
      const loadMoreButton = document.querySelector('#pdimore'); // Usando ID do botão
      return loadMoreButton && loadMoreButton.offsetParent !== null;
    });

    if (loadMoreVisible) {
      await page.click('#pdimore'); // Clica no botão pelo ID
      await page.waitForTimeout(2000);
    }
  }

  await browser.close();
  return products;
}

scrapeTerabyteShop().then(products => console.log(products));
