const express = require('express')
const bodyParser = require('body-parser')

const route = require('./routes/route')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const mongoose =  require('mongoose')

mongoose.connect("mongodb+srv://vishal:project123@nodejsprojects.dfqks.mongodb.net/Project_6_Quora_DB?authSource=admin&replicaSet=atlas-i7c1ik-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", {useNewUrlParser: true})
    .then(() => console.log('mongodb running and connected'))
    .catch(err => console.log(err))


app.use('/', route)

app.listen(process.env.PORT || 3000, function(){
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})
