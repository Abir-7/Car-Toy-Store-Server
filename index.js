const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
require('dotenv').config()



app.use(cors())
app.use(express.json())
//////////////////////////////


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.zi72aqo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        //////////starting//////////
        app.get('/', (req, res) => {
            res.send('Toys Are running')
        })
        //////create database name//////////
        const database = client.db("CarToyStore");
        const toyCollection = database.collection("allToys");
        const userReview=database.collection("userReview");
        /////////////getData////////////////
        app.get('/alltoys', async (req, res) => {
            console.log('hit')
           
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            if (req.query?.category) {
                query = {
                    sub_category: req.query?.category
                }
            }
            if (req.query?.name) {
                query = {
                    t_name:{$regex:req.query.name ,$options:'i'}
                }
            }
    
            if(req.query.value){
                const result = await toyCollection.find().sort({price:req.query.value}).collation({locale:"en_US",numericOrdering:true}).toArray();
                res.send(result)
            }
            else{
                const result = await toyCollection.find(query).limit(parseInt(req.query?.limit)).toArray();
                res.send(result)
            }
        
          
           
        })
        
        app.get('/alltoys/:id', async (req, res) => {

            const id = req.params.id;
           
            const query = { _id: new ObjectId(id) }

            const result = await toyCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/userreview',async(req,res)=>{
            const result = await userReview.find().toArray();
            res.send(result)
        })

        //////////update data/////////////
        app.put('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
          
            const findToy = { _id: new ObjectId(id) }

            const options = { upsert: true }
            const updateToy = req.body;
            const update_toy = {
                $set: {
                    price: updateToy.price,
                    quantity: updateToy.quantity,
                    supplier: updateToy.details
                },
            };
            const result = await toyCollection.updateOne(findToy, update_toy, options)
            res.send(result)
        })
        /////Create Data////////////
        app.post('/alltoys', async (req, res) => {
            const newtoy = req.body;
            const result = await toyCollection.insertOne(newtoy)
            res.send(result)
        })


        ////delete Data///
        app.delete('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query)
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);













app.listen(port, () => {
    console.log(`Toys app listening on port ${port}`)
})