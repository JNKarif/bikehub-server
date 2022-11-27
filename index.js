const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ei4prfy.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorised access')
    }

    const token = authHeader.split(' ')[1]
}


async function run() {
    try {
        const categoriesCollection = client.db('bikehub').collection('categories')
        const productsCollection = client.db('bikehub').collection('products')
        const bookingsCollection = client.db('bikehub').collection('bookings')
        const usersCollection = client.db('bikehub').collection('users')

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        })

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: parseInt(id) };
            const category = await productsCollection.find(query).toArray();
            res.send(category)
        });


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '3d' })
                return res.send({ accessToken: token })
            }
            console.log(user);
            res.status(403).send({ accessToken: 'Forbidden Access' })
        })


        // my orders api reading
        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;

            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        })


        // my orders api creating
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            // console.log(booking)
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        // users data storing in db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

    }
    finally {

    }
}

run().catch(console.log)

app.get('/', async (req, res) => {
    res.send('bike hub portal is running')
})


app.listen(port, () => console.log(`Bike Hub portal running on ${port}`))