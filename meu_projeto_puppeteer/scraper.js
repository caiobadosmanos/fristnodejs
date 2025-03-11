const puppeteer = require('puppeteer');

async function scrapeTerabyteShop() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.terabyteshop.com.br/busca?str=amd');

  let products = [];
  let loadMoreVisible = true;

  while (loadMoreVisible) {
    // Aguarda os produtos carregarem
    await page.waitForSelector('.commerce_columns_item_inner');

    // Extrai as informações dos produtos
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

    // Verifica se o botão "Clique para ver mais produtos" está visível
    loadMoreVisible = await page.evaluate(() => {
      const loadMoreButton = document.querySelector('.btn-load-more');
      return loadMoreButton && loadMoreButton.offsetParent !== null;
    });

    // Clica no botão "Clique para ver mais produtos" se ele estiver visível
    if (loadMoreVisible) {
      await page.click('.btn-load-more');
      await page.waitForTimeout(2000); // Aguarda 2 segundos para o carregamento dos novos produtos
    }
  }

  await browser.close();
  return products;
}

scrapeTerabyteShop().then(products => console.log(products));
