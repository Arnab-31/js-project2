describe('Fetch data from API', () => {

  //Complete the class Portfolio. Create a map inside its constructor names cryptocurrencies, where key would be the name of the crypto and 
  //and the value would be the units of that crypto present in the portflio. Create two functions addCryptocurrency(name,units) and 
  // removeCryptocurrency(name, units). Name is the currency and units is the quanity. addCryptocurrency should add crypto to the map and removeCryptocurrency should 
  //remove crypto from the portfolio
  it('test the portfolio class and its function', () => { 
    cy.visit('/')
    cy.window().then(win => {
      const Portfolio = win.Portfolio;
      const obj = new Portfolio();
      obj.addCryptocurrency('BTC', 2); 
      obj.addCryptocurrency('ETH', 3); 
      expect(obj.cryptocurrencies.get('BTC')).to.equal(2);
      expect(obj.cryptocurrencies.get('ETH')).to.equal(3);
      obj.removeCryptocurrency('BTC', 1);
      obj.removeCryptocurrency('ETH', 2);
      expect(obj.cryptocurrencies.get('BTC')).to.equal(1);
      expect(obj.cryptocurrencies.get('ETH')).to.equal(1);
    });
  });

  //Create a init function which should be called everytime the page is loaded. The init function should fetch the prices of 10 cryptocurrencies for the api
  //https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP,LTC,BCH,EOS,BNB,ADA,XLM,DOT&tsyms=USD
  //and store it in a global variable called prices. And display it in the html inside the #prices div.
  let appPrices;
  it('fetches data and compares it to stored variable', () => {
    cy.visit('/')
    let prices;
    cy.wait(2000)
    cy.window().then(win => {
      prices = win.prices;
      appPrices = prices;
    });
    let expectedHtml = "";
    cy.request('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP,LTC,BCH,EOS,BNB,ADA,XLM,DOT&tsyms=USD')
      .then((response) => {
        expect(response.body).to.deep.equal(prices)
        let html = ""
        for (const key in prices) {
            html += `<div class="price"><b>${key}:</b> $${prices[key].USD}</div>`
        }
        expectedHtml = html
    })
    cy.get('#prices')
    .then(($div) => {
      expect($div.html()).to.equal(expectedHtml)
    });
  })
  
  //Create a global variable called balance which will store the amount of dollars with the user. Its value should be 10000 initally.
  //Create two global functions handleBuy(e) and handleSel(e). When the user buys crypto by clicking the #buy-button the handleBuy function should 
  //update the portfolio using the addCryptocurrency function. Similarly when the user sells crypto  by clicking the #sell-button, the handleSell(e)
  //function should update the portfolio using the removeCryptocurrency function. Both of these function should also update the global variable balance.
  //At the end, update the UI with the new portfolio data. In the #portfolio div, display the portfolio details in a list, and update the text of
  //#balance with the new balance, in the form "Balance: $10000"

  it('test buying and selling of crypto', () => {
    cy.server();
    cy.intercept(
      'GET',
      'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP,LTC,BCH,EOS,BNB,ADA,XLM,DOT&tsyms=USD',
      {
          BTC: {
            USD: 7428.12
            },
            ETH: {
            USD: 1332.63
            },
            XRP: {
            USD: 0.3585
            },
            LTC: {
            USD: 82.68
            },
            BCH: {
            USD: 107.65
            },
            EOS: {
            USD: 0.9484
            },
            BNB: {
            USD: 276.85
            },
            ADA: {
            USD: 0.3156
            },
            XLM: {
            USD: 0.07971
            },
            DOT: {
            USD: 4.874
            }
      }
    )

    cy.visit('/')
    cy.wait(2000)
    cy.get('#currency').select('BTC');
    cy.get('#units').type(1);
    cy.get('button[type=submit]').click();
    cy.wait(100)
    cy.get('#balance').invoke('text').then((text) => {
      const balance = text.replace('Balance: $', '');
      expect(Number(balance)).to.equal(10000 - 7428.12);
    });

    cy.intercept(
      'GET',
      'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP,LTC,BCH,EOS,BNB,ADA,XLM,DOT&tsyms=USD',
      {
          BTC: {
            USD: 7438.12
            },
            ETH: {
            USD: 1342.63
            },
            XRP: {
            USD: 0.3585
            },
            LTC: {
            USD: 82.68
            },
            BCH: {
            USD: 107.65
            },
            EOS: {
            USD: 0.9484
            },
            BNB: {
            USD: 276.85
            },
            ADA: {
            USD: 0.3156
            },
            XLM: {
            USD: 0.07971
            },
            DOT: {
            USD: 4.874
            }
      }
    )

    cy.visit('/')
    cy.wait(1000)
    cy.get('#currency').select('BTC');
    cy.get('#units').type(1);
    cy.get('#sell-button').click();
    cy.wait(2000)
    cy.get('#balance').invoke('text').then((text) => {
      const balance = text.replace('Balance: $', '');
      expect(Number(balance)).to.equal(10010);
    });
  })

  // Wheever the portfolio and the balance gets updated, store their data in the localstorage. The portfolio data must to stored in the
  // key portfolio and the balance of the user must be stored with the key balance. When the page is loaded, initlaize the portfolio and the balance
  // with the one present in the local storage if present.
  it('verify local storage', () => {
    cy.visit('/')
    cy.wait(2000)
    cy.get('#currency').select('BNB');
    cy.get('#units').type(1);
    cy.get('button[type=submit]').click();
    cy.window().then(win => {
      appPrices = win.prices;
    });
    cy.window().then((win) => {
      const balance = win.localStorage.getItem('balance');
      expect(Number(balance)).to.equal(10000 - appPrices['BNB'].USD);
    });
  })
  
  
})