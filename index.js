const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
// const corsConfig = {
//     origin: '*',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
// app.use(cors(corsConfig))
// app.options("*", cors(corsConfig))

app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ei4prfy.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorised access')
//     }

//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden accesss' })
//         }
//         req.decoded = decoded;
//         next()
//     })
// }


async function run() {
    try {
        const categoriesCollection = client.db('bikehub').collection('categories')
        const productsCollection = client.db('bikehub').collection('products')
        const bookingsCollection = client.db('bikehub').collection('bookings')
        const usersCollection = client.db('bikehub').collection('users')
        const newProductsCollection = client.db('bikehub').collection('newProducts')


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





        // app.get('/jwt', async (req, res) => {
        //     const email = req.query.email;
        //     console.log(email)
        //     const query = { email: email };
        //     console.log('inside jwt', query)
        //     const user = await usersCollection.findOne(query);
        //     console.log(user)
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '3d' })
        //         // const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
        //         return res.send({ accessToken: token })
        //     }
        //     // console.log(user);
        //     res.status(403).send({ accessToken: 'Forbidden Access' })
        // })


        // my orders api reading
        // app.get('/bookings', verifyJWT, async (req, res) => {
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // console.log(email)
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden accesss' })
            // }

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

        // reading all ussers in the browser
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        // users data storing in db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })



        // isAdmin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })

        // making admin
        // app.put('/users/admin/:id', verifyJWT, async (req, res) => {
        app.put('/users/admin/:id', async (req, res) => {
            // const decodedEmail = req.decoded.email;
            // const query = { email: decodedEmail };
            // const user = await usersCollection.findOne(query);

            // if (user?.role !== 'admin') {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }

            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })






        // seller reading
        // app.get('/users/seller/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email };
        //     const user = await usersCollection.find(query).toArray();
        //     console.log(user)
        //     res.send({ isSeller: user?.role === 'seller' })
        // })



        // need to add verifyJWT letter ##########
        // app.get('/users/seller',verifyJWT, async (req, res) => {
        app.get('/users/seller', async (req, res) => {

            const email = req.query.email;
            // const decodedEmail = req.decoded.email;

            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden accesss' })
            // }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user)
            res.send({ isSeller: user?.role === 'seller' })
        })


       

        app.get('/users/buyer', async (req, res) => {

            const email = req.query.email;
            // const decodedEmail = req.decoded.email;

            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden accesss' })
            // }
            console.log(email)
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user)
            res.send({ isBuyer: user?.role === 'buyer' })
        })


        app.get('/users/seller/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const userRole = await usersCollection.find(query).toArray();
            res.send(userRole)
        })

        app.get('/users/buyer/:role', async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const userRole = await usersCollection.find(query).toArray();
            res.send(userRole)
        })

        // mo need
        // app.get('/users/seller', async (res, req) => {
        //     const query = {}
        //     const result = await usersCollection.find(query).toArray()
        //     res.send(result)
        // })



        // delete seller by admin
        app.delete('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter)
            res.send(result)
        })

        //    delete buyer by admin
        app.delete('/users/buyer/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter)
            res.send(result)
        })
















        // product category name for seller to add product
        app.get('/productsCategory', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).project({ cateogoryName: 1 }).toArray()
            res.send(result)
        })


        // ##### verifyJWT add krte hobey
        // adding new product by seller
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await newProductsCollection.insertOne(product);
            res.send(result)
        })

        // ##### verifyJWT add krte hobey
        // all new product reading by get
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await newProductsCollection.find(query).toArray();
            res.send(products)

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