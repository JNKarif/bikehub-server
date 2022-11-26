const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ei4prfy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('bikehub').collection('categories')
        const productsCollection = client.db('bikehub').collection('products')

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories= await categoriesCollection.find(query).toArray();
            res.send(categories)
        })

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: parseInt(id) };
            const category = await productsCollection.find(query).toArray();
            res.send(category)
        });

    }
    finally {

    }
}

run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('bike hub portal is running')
})


app.listen(port, () => console.log(`Bike Hub portal running on ${port}`))