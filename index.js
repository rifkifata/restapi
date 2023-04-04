const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')
require('dotenv').config()
const {
  momen
} = require('mongodb');
const {
  ObjectID
} = require('mongodb');
const axios = require('axios');

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// Create or Update an item
app.post('/:col', async (req, res) => {
  console.log(req.body)
  const now = new Date();
  let date = {
    "createdAt": now.toISOString(),
    "updatedAt": now.toISOString()
  }
  const isi = {
    ...req.body,
    ...date
  }

  const objectId = new ObjectID();
  const col = req.params.col
  //const key = req.params.key
  let key = objectId.toString()

  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, isi)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Delete an item
app.delete('/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
})

// Get a single item
app.get('/getbykey/:col/:key', async (req, res) => {
  const col = req.params.col
  const key = req.params.key
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  let item = await db.collection(col).get(key)
  let props = item.props
  delete props.updated
  delete props.created
  let newitem = {
    key: key,
    collection: col,
    ...props
  }
  console.log(JSON.stringify(newitem, null, 2))
  res.json(newitem).end()
})

//Get all full listing
/*app.get('/getfull/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
})*/

//get All
app.get('/getall/:col', async (req, res) => {
  const col = req.params.col
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  let result = items.results.map(a => a.key)
  let currentArray = []

  await Promise.all(
    result.map(async (item) => {
      currentArray.push(await db.collection(col).get(item))
    })
  )

  currentArray.map(item => {
    Object.assign(item, item.props)
    delete item.props;
    return item
  })

  let finalResult = {
    "results": currentArray
  }
  res.json(finalResult).end()
})

// Update entire bike
app.put("/:col/:key", async (req, res) => {
  const key = req.params.key
  const col = req.params.col
  const now = new Date()

  // get createdAt and updatedAt
  let oldDate = await db.collection(col).get(key)
  let createdAtOld = oldDate.props.createdAt
  let updatedAtOld = oldDate.props.updatedAt

  if (req.body.updatedAt) {
    const mydate = req.body.updatedAt
    updatedAtOld = new Date(mydate).toISOString()
  } else {
    updatedAtOld = now.toISOString()
  }

  // Delete existing object
  await db.collection(col).delete(key)

  //isi
  const isi = {
    ...req.body,
    "updatedAt": updatedAtOld,
    "createdAt": createdAtOld
  }
  // Save new Object
  const item = await db.collection(col).set(key, isi)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
});

// #############################################################################
// This configures is for header to get a ticket API hehe :)
// #############################################################################
app.get('/jobTicket', async function (req, res, next) {
  //Define Variable
  const phoneNumber = JSON.parse(process.env.PHONE_NUMBER);
  const apiKey = JSON.parse(process.env.API_KEY);
  const options = {
    method: 'POST',
    url: process.env.ENDPOINT_TICKET,
    data: {
      "requestItems": [
        "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jEyKEf0T6jhTqogS5QSHqaYrI93wNWcFgvlTINGpM46o",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jLJA7G0QaH2lAceGwyf3U1_4b0L8ASmzc_7PDvdyRUJU",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jsZTjBPHUZI1-Z4R_iKFMXxfHNutk_VfNMuvSOh9Is8U",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jBhQe6cYOekGwRW9bW7d4q6AHAbvXkTLlNHenCht5_QA",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jfT2S06WdIqQZ3PxOij-QJ4FN3lWa0iJRoLYDIgdaepc",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6j7ytyvBHbceP3Fv6SOLprErdxmu5IbitoiyoH64jZW_4",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jQcFkuVgmkD-vgJbX-5UZZk2MgiDxbJ0Qn1UevSC_8L4",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jO4DCz8FpWgc5Bwk1SfOf4tYwY6dEMnWHK-sTk-3UphU",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jxqbRAcl2osE9aR2Gi4E1y7Uc4Wq86__lZPRLOSfKeDI",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jW2u-qtqQETUbifXhloSnMRbRxwLtcCeYWI_0U1gT36Q",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5BTHMrx6zRgfr4r9hhEyp6jtYNWEaUSautd39NbkdFB5MmAOZV_-BrCCgWVYMd6AKA",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F56DDSTjnGj7Jj83x6wUTzSylhVHYESAlOxAVNI2uC54",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FPa2yi99nvCF8GJSEq05WJitZ72iyTL_MyOyTc2bDhDE",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5Fl7jvkN-a2PPCCugcctPaVygjQUgs6aG0KTGsXRER_Ow",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5FDf8hYPtF_Ak1NfOpio_Ncn4-TuhK132lkEIETeIszPc",
      "qPysQBLP41OSVm8sWJxSE0zL0FxFb1gWrep4FDbQk5Am36YSVPavGhyNW8RBaL5F3tBy-IOVg95Tpcr9ahVaSQNMZ8tkYAWZX6vrE_B5-js"]
    }
  };

  //GET Data
  await axios.request(options)
    .then(async function (response) {
      let pesan = response.data.data.searchList.departureFlights.map(({
        marketingAirline,
        fareDetail,
        departure
      }) => ({
        maskapai: marketingAirline.displayName,
        harga: fareDetail.cheapestFare,
        tanggal: departure.date
      })).sort(function (a, b) {
        return a.harga - b.harga
      }).slice(0, 1);

      const maskapai = pesan.map(({
        maskapai
      }) => maskapai)
      let harga = pesan.map(({
        harga
      }) => harga);
      const currency = new Intl.NumberFormat('en-ID', {
        style: 'currency',
        currency: 'IDR'
      });
      const tanggal = pesan.map(({
        tanggal
      }) => tanggal)

      let results =[];

      //Message
      let msg = '*' + maskapai + '*' + '%0a' + '*' + currency.format(harga) + '*' + '%0a' + tanggal;
    
      //send Message to WA 
      for (let i = 0; i < phoneNumber.length; i++) {
        const hit = await axios.request({
          method: 'POST',
          url: `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber[i]}&text=${msg}&apikey=${apiKey[i]}`,
          headers: {
            'Host': 'api.callmebot.com'
          }
        })
        results.push(hit);
        console.log(phoneNumber[i]);
      }
      const res = await Promise.all(results);
      return res.flat();
    })
  res.status(200).json({
    status: 'success',
    data: "Sended to WA"
  });
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({
    msg: 'no route handler found'
  }).end()
})

// Start the servers
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})