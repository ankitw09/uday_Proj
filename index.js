const express = require('express');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
mongoose.connect('mongodb://localhost:27017/shopyfy');
const path = require('path');
const imgModel = require('./models/imageschema');
const cartsModel = require('./models/carts');
const fs = require('fs');
const userMessage = require('./models/userMessage');
const newsletter = require('./models/newsLetter');
const divsub = require('./models/subscribe');
const { json } = require('body-parser');
const e = require('express');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.set('view engine', 'ejs');
app.set('views','views')

app.use(express.static('public'))



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/images'));
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.fieldname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('index', { items: items, message:''});
        }
    });
})


app.get("/about",(req,res)=>{
    res.render("about");  
 })
 app.get("/blog_list",(req,res)=>{
    res.render("blog_list");  
 })
 app.get("/contact",(req,res)=>{
    res.render("contact",{message:''});  
 })



 app.post("/cart/:id", (req, res) => {
    console.log("called");
    const _id = req.params.id;
    const newCart = new cartsModel({
        id: _id
    });

    newCart.save()
        .then(() => {
            cartsModel.find({}, { id: 1, _id: 0 })
                .then((cartIds) => {
                    const idsArray = cartIds.map((cart) => cart.id);

                    imgModel.find({ _id: { $in: idsArray } }, (err, items) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send('An error occurred', err);
                        } else {
                            res.render('cart', { items: items });
                        }
                    });
                })  
                .catch((err) => {
                    res.status(400).json({ error: err });
                });
        })
        .catch((err) => {
            if (err.code === 11000) { // Check if the error is a duplicate key error
                res.status(400).send("Cart already exists"); // Send an appropriate response
            } else {
                res.status(400).json({ error: err });
            }
        }); 
});

 
app.delete("/deleteCartItem/:id", (req, res) => {
    const id = req.params.id;
    cartsModel.findOneAndDelete({ id: id }, (err, doc) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else if (!doc) {
            console.log(`Item in the cart NOt found`);
            res.status(404).send(`Item not found in the CART`);
        } else {
            console.log(`Cart with id ${id} removed`);
            res.status(200).send(`CART item removed successfully`);
        }

        // res.redirect('cart');
    });
});

app.get("/cart", (req, res) => {
    console.log("called cart");
    cartsModel.find({}, { id: 1, _id: 0 })
        .then((cartIds) => {
            const idsArray = cartIds.map((cart) => cart.id);

            imgModel.find({ _id: { $in: idsArray } }, (err, items) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('An error occurred', err);
                } else {
                    res.render('cart', { items: items });
                }
            });
        })  
        .catch((err) => {
            res.status(400).json({ error: err });
        });
});


app.get("/addCard/:id", (req, res) => {
    const _id = req.params.id;
    
    imgModel.findOne({ _id } ,(err, image) => {
        if (err) {
            console.log(err);
            res.status(500).send('an error occured', err);
        } else {
        
           res.render('addCard', { image })
        }
    });
  
})
 
app.get('/product', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('product', { items: items });
        }
    });
})

 app.get('/upload', (req, res) => {
    res.render('upload');
 })



 app.post("/newsletter",async(req,res) => {  // contact is action method POST
    try {
        // res.send(req.body);
        
        const subData = new newsletter(req.body);  // calling schema
        await subData.save();  // saving data
        imgModel.find({}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('index', { items: items, message: 'Successfully subscribed to newsletter' });
            }
        })
    } catch (error) {
       
        res.status(500).send(error);

    }
})

app.post("/subscribed",async(req,res) => {  // contact is action method POST
    try {
        // res.send(req.body);
        
        const subData = new divsub(req.body);  // calling schema
        await subData.save();  // saving data

        imgModel.find({}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('index', { items: items, message: 'Successfully subscribed to discounts' });
            }
        })
    
        // submit ke bad jaha jana he wo page render kro
    } catch (error) {
       
        res.status(500).send(error);

    }
})

 app.post("/contact",async(req,res) => {  // contact is action method POST
    try {
        //res.send(req.body);
        const userData = new userMessage(req.body);  // calling schema
        await userData.save();  // saving data
        res.status(201).render("contact",{message:"Succesfully responded"}); // submit ke bad jaha jana he wo page render kro
            } catch (error) {
        res.status(500).send(error);
    }
})



app.post('/upload', upload.single('image') , async (req, res,next) => {
    var obj = {
        price: req.body.price,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/images/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/upload');
        }
    });
});








app.listen(5000, () => {
    console.log("Everything working fine and app is running at port 5000");
})
