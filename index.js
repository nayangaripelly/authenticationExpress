const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const jwt_secret = "neverstoptolearn";

app.use(express.json());

const users = [];

// stateful so need to be stored.. too many hits on db... so use jwt instead of such tokens...
// function generatetoken()
// {
//     const alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
//         '1','2','3','4','5','6','7','8','9','0'];

//     let token  = "";
//     for(let i=0;i<32;i++)
//     {
//         token += alphabets[Math.floor(Math.random()*alphabets.length)];
//     }
//     return token;
// }

app.post("/signup",function(req,res)
{
    const username = req.body.username;
    const password = req.body.password;

    users.push({
        username:username,
        password:password
    });

    res.status(200).json({
        msg:"You have successfully signed up!!"
    })
})

app.get("/",function(req,res)
{
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signin",function(req,res)
{
    const username = req.body.username;
    const password = req.body.password;

    let founduser = null;
    for(let i=0;i<users.length;i++)
    {
        if(users[i].username == username && users[i].password == password)
        {
            founduser = users[i];
        }
    }

    if(founduser)
    {
        const token = jwt.sign({
            username:username
        },jwt_secret);

        res.status(200).json(
            {
                token: token
            }
        )
    }else
    {
        res.status(403).json({
            msg:"incorrect username or password..."
        })
    }
})

// app.get("/me",function(req,res)
// {
//     const token = req.headers.token;
//     try{
//         const verify = jwt.verify(token,jwt_secret);
//         const username = verify.username;

//         const founduser = null;
//         for(let i = 0;i<users.length;i++)
//         {
//             if(users[i].username == username)
//             {
//                 founduser = users[i];
//             }
//         }
//         res.status(200).json({
//             username : username,
//             password: founduser.password
//         })
//     }catch(e)
//     {
//         res.status(403).json({
//             msg:"there is something wrong with your token, login once again!!"
//         })
//     }
// })

function authMiddleware(req,res,next)
{
    const token = req.headers.token;
    try{
        const verify = jwt.verify(token,jwt_secret);
        const username = verify.username;
        req.username = username; //sending username(data) to next functions (middlewares/endpoints)
        next();
    }catch(e)
    {
        res.status(403).json({
            msg:"your token is tampered/incorrect so login once again!!"
        })
    }
}

app.use(authMiddleware);

app.get("/me",function(req,res)
{
        let founduser = null;
        for(let i = 0;i<users.length;i++)
        {
            if(users[i].username == req.username)
            {
                founduser = users[i];
            }
        }
        res.status(200).json({
            username : req.username,
            password: founduser.password
        })
})
app.listen(3000);