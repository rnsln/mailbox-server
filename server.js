const express = require('express')
const cors = require('cors')
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')

const app = express()

var corsOptions = {
    credentials: true,
    origin: "*"
}

app.use(cors(corsOptions))

// parse requests of type JSON
app.use(express.json())

// parse url-encoded types
app.use(express.urlencoded({extended: true}))

app.use(
    cookieSession({
        name: 'mailbox-session',
        keys: [process.env.COOKIE_KEY],
        httpOnly: true
    })
)

const db = require('./app/models')
const Role = db.roles
const User = db.users
db.mongoose.connect(db.url).then(()=>{
    console.log('Connected to database!')
    initial()
}).catch(err => {
    console.log('Cannot connect to database! ', err)
    process.exit()
})

function initial() {
    Role.estimatedDocumentCount().then(count => {
        if(count === 0){
            let role = new Role({
                name: 'user'
            })

            role.save(role).then(data => {
                console.log('added \'user\' to roles collection')
            }).catch(err => {
                console.log('error', err)
            })

            role = new Role({
                name: 'admin'
            })

            role.save(role).then(data => {
                console.log('added \'admin\' to roles collection')
            }).catch(err => {
                console.log('error', err)
            })
        }
    })
    Role.findOne({name:'admin'}).then(role => {
        User.countDocuments({
            roles : role._id
        }).then(count => {
            if(count === 0){
                let user = new User({
                    username: 'admin',
                    email: 'admin@admin.com',
                    password: bcrypt.hashSync('admin', 8),
                    roles: [role._id]
                })

                user.save(user).then(user => {
                    console.log(`User ${user.username} was added as an admin`)
                }).catch(err => {
                    console.log('error: ', err)
                })
            }
        }).catch(err => {
            console.log("error: ", err)
        })
    }).catch(err => {
        console.log("error: ", err)
    })
}

// basic route
app.get('/', (req, res)=>{

    res.json({
        message: 'Welcome to rnsln\'s mailbox app.'
    })
})

require('./app/routes/message.routes')(app)
require('./app/routes/user.routes')(app)
require('./app/routes/auth.routes')(app)

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
})