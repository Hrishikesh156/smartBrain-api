const express = require('express');
const bodyparser = require('body-parser');
const app = express();
app.use(bodyparser.json());
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
app.use(cors());
const knex = require('knex');
//const register = require('./controllers/register')

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'hrishi156',
      database : 'smart-brain'
    }
  });

 


  
const database = {
    users: [
        {
            id: '123',
            name:'john',
            email:'john@gmail.com',
            password:'cookies',
            entries:0,
            joined: new Date()
        },
        {
            id: '124',
            name:'sally',
            email:'sally@gmail.com',
            password:'bananas',
            entries:0,
            joined: new Date()
        }


    ]
}
app.get('/',(req,res)=>{
    res.send(database.users);
})

app.post('/signin',(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password) {
        return res.status(400).json('incorrect form submission');

    }
    db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data=>{
        const isvalid = bcrypt.compareSync(req.body.password,data[0].hash);
        if(isvalid){
            return db.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user=>{
                console.log(user);
                res.json(user[0])
            })
            .catch(err=> res.status(400).json('unable to get user'))
         }
         else{
            res.status(400).json('wrong credentials')
         }
    
      
    })
    .catch(err=> res.status(400).json('wrong credentials'))
 
})


app.post('/register',(req,res)=>{
    const {email,name,password} = req.body;
    if(!email || !name || !password) {
        return res.status(400).json('incorrect form submission');

    }
    const hash = bcrypt.hashSync(password);
    db.transaction(trx=>{
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            return trx('users')
            .returning('*')
            .insert({
                email:loginEmail[0],
                name:name,
                joined:new Date()
            })
            .then(user=> {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })

    .catch(err => res.status(400).json('user already exists'))
   
  

   
})

app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;
    
    db.select('*').from('users').where({
        id:id
    })
    .then(user=>{
        if(user.length){
            res.json(user[0])

        }
        else{
            res.status(400).json('not found')
        }
      

    })  
    .catch(err=>res.status(400).json('error getting user'))     
    // if(!found){
    //         res.status(400).res.json("not found");
    //     }

})

app.put('/image',(req,res)=>{
    const {id} = req.body;
    db('users').where('id','=',id)
    .increment('entries',1)
    .returning('entries')
    .then(entries=>{
       res.json(entries[0]);
    })
    .catch(err=>res.status(400).json('unable to get count'))

})
app.listen(3080,()=>{
    console.log("app is running");
})
  /*
/--> res  = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId -->GET =user
/image --> PUT -->user


  */