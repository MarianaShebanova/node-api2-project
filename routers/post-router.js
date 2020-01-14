const express = require('express');

const router = express.Router();

const Posts = require('../data/db.js'); // our users database library

router.get('/', (req, res) => {
    // read the data from the database
    Posts.find() // return a promise
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.log(error);
            // handle the error
            res.status(500).json({
                errorMessage: 'The posts information could not be retrieved.',
            });
        });
});

router.get('/:id', (req, res) => {
    // GET a user by its id, which is a parameter of the path
    const { id } = req.params;
    Posts.findById(id)
        .then(data => {
            // two things can happen: id exists or not
            // id exists: we just res.json the data
            // id does not exist: we just res.json a 404
            if (data.length != 0) {
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

router.get('/:id/comments', (req, res) => {
    // GET a user by its id, which is a parameter of the path
    Posts.findById(req.params.id)
        .then(post => {
            if (post.length == 0)
                return res.status(404).json({ errorMessage: 'The post with the specified ID does not exist.' });
        });
    const { id } = req.params;
    Posts.findPostComments(id)
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
router.post('/:id/comments', (req, res) => {
    const changes = req.body;
    if (!changes || !changes.text) {
        return res.status(400).json({ errorMessage: 'Please provide text for the comment.' });
    }
    Posts.findById(req.params.id)
        .then(post => {
            if (post.length == 0)
                return res.status(404).json({ errorMessage: 'The post with the specified ID does not exist.' });
        });
    changes.post_id = req.params.id;
    Posts.insertComment(changes)
        .then(data => {
            // two things can happen: id exists or not
            // id exists: we just res.json the data
            // id does not exist: we just res.json a 404
            Posts.findCommentById(data.id)
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

router.post('/', (req, res) => {
    const changes = req.body;

    if (!changes || !changes.title || !changes.contents) {
        return res.status(400).json({ errorMessage: 'Please provide title and contents for the post.' });
    }
    Posts.insert(changes)
        .then(post => {
            Posts.findById(post.id)
                .then(postD => {
                    res.status(201).json(postD);
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
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    let postD = {};
    Posts.findById(id)
        .then(post => {
            postD = post;
        });
    Posts.remove(id)
        .then(deleted => {
            if (deleted) {
                res.status(201).json(postD);
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

router.put('/:id', (req, res) => {
    const changes = req.body;
    if (!changes || !changes.title || !changes.contents) {
        return res.status(400).json({ errorMessage: 'Please provide title and contents for the post.' });
    }
    Posts.update(req.params.id, changes)
        .then(hub => {
            if (hub) {
                Posts.findById(req.params.id)
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


module.exports = router;