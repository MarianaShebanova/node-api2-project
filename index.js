// implement your API here
// import express from 'express'; // ES2015 module syntax
const express = require('express'); // CommonJS modules

const Users = require('./data/db.js'); // our users database library

const server = express();

// middleware: teaches express new things
server.use(express.json()); // needed to parse JSON

// routes or endpoints

// GET to "/"
server.get('/', function (request, response) {
    response.send({ hello: 'Web 25!' });
});

// see a list of users
server.get('/api/posts', (req, res) => {
    // read the data from the database
    Users.find() // return a promise
        .then(users => {
            console.log('Users', users);
            res.status(200).json(users);
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: 'The posts information could not be retrieved.',
            });
        });
});

server.get('/api/posts/:id', (req, res) => {
    // GET a user by its id, which is a parameter of the path
    const { id } = req.params;
    Users.findById(id)
        .then(data => {
            // two things can happen: id exists or not
            // id exists: we just res.json the data
            // id does not exist: we just res.json a 404
            if (data) {
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    errorMessage: `The post with the specified ID does not exist.`
                })
            }
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: "The posts information could not be retrieved."
            });
        })
})

server.get('/api/posts/:id/comments', (req, res) => {
    // GET a user by its id, which is a parameter of the path
    Users.findById(req.params.id)
        .then(user => {
            if (user.length == 0)
                return res.status(404).json({ errorMessage: 'The post with the specified ID does not exist.' });
        });
    const { id } = req.params;
    Users.findPostComments(id)
        .then(data => {
            // two things can happen: id exists or not
            // id exists: we just res.json the data
            // id does not exist: we just res.json a 404
            if (data) {
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    errorMessage: `The user with the specified ID does not exist.`
                })
            }
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: "The comments information could not be retrieved."
            });
        })
})
server.post('/api/posts/:id/comments', (req, res) => {
    const changes = req.body;
    if (!changes || !changes.text) {
        return res.status(400).json({ errorMessage: 'Please provide text for the comment.' });
    }
    Users.findById(req.params.id)
        .then(user => {
            if(user.length == 0)
                return res.status(404).json({ errorMessage: 'The post with the specified ID does not exist.' });
        });
    changes.post_id = req.params.id;
    Users.insertComment(changes)
        .then(data => {
            // two things can happen: id exists or not
            // id exists: we just res.json the data
            // id does not exist: we just res.json a 404
            Users.findCommentById(data.id)
               .then(user => {
                   res.status(200).json(user);
            });
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: "There was an error while saving the comment to the database."
            });
        })
})

server.post('/api/posts/', (req, res) => {
    const changes = req.body;
    
    if (!changes || !changes.title || !changes.contents) {
        return res.status(400).json({ errorMessage: 'Please provide title and contents for the post.' });
    }
    Users.insert(changes)
        .then(user => {
            Users.findById(user.id)
                .then(userD => {
                    res.status(201).json(userD);
                });
        })
        .catch(error => {
            // log error to database
            console.log(error);
            res.status(500).json({
                message: 'Error updating the hub',
            });
        });
});
// delete a user
server.delete('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    let userD= {};
    Users.findById(id)
        .then(user => {
            userD = user;
        });
    Users.remove(id)
        .then(deleted => {
            if (deleted) {
                res.status(201).json(userD);
            } else {
                res.status(404).json({ errorMessage: `The post with the specified ID does not exist.` });
            }
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: "The post could not be removed."
            });
        });
});

server.put('/api/posts/:id', (req, res) => {
    const changes = req.body;
    if (!changes || !changes.title || !changes.contents) {
        return res.status(400).json({ errorMessage: 'Please provide title and contents for the post.' });
    }
    Users.update(req.params.id, changes)
        .then(hub => {
            if (hub) {
                Users.findById(req.params.id)
                    .then(user => {
                        res.status(200).json(user);
                    });
            } else {
                res.status(404).json({ errorMessage: 'The post with the specified ID does not exist' });
            }
        })
        .catch(error => {
            // log error to database
            console.log(error);
            res.status(500).json({
                errorMessage: 'The post information could not be modified.',
            });
        });
});

const port = 8000;
server.listen(port, () => console.log(`\n ** api on port: ${port} ** \n`));
