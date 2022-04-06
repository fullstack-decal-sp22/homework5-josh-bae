const mongoose = require('mongoose')
const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())
const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser:true})
const Schema = mongoose.Schema
const apodSchema = Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, {collection: 'images'})

const APOD = mongoose.model('APOD', apodSchema)

//routes
app.get("/", function(req, res) {
    APOD.find().exec((error, images) => {
        if (error) {
            console.log(error)
            res.send(500)
        } else {
            res.json({all: images})
        }
    })
})
app.get("/favorite", function (req,res) {
    APOD.find().sort({'rating' : 'desc'}).exec((error, images) => {
        if (error) {
            console.log(error)
            res.send(500)
        } else{
            res.json({favorite: images[0]})
        }
    })
})

app.post("/add", function(req,res) {
    const {title, url, rating} = req.body;
            APOD.findOne({title: title}, function(err, existinimage) {
                if (err) {
                    res.status(500).json({msg: err});
                } else {
                    if (existinimage) {
                        return res.status(400).json({msg: "alreaady in db"});
                    }
                }
            })
            var apod = new APOD({
                title: title,
                url: url,
                rating: rating,
            });
            
            apod.save((err, images) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        status: 'succeed',
                        id: apod._id,
                        content: req.body,
                    });
                } 
            });
});

app.delete("/delete", function (req, res) {
    const {title} = req.body;
    APOD.findOneAndDelete({title: title}, function(err, doc) {
        if (err) {
            console.log(err);
            res.json({msg: "cant delete"})
        } else{
            res.json({
                status: 'delete successful', doc,
            })
        }
    })
    
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })