const { request, response } = require('express');
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Person = require('./models/person');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());


const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name == 'CastError') {
        response.status(500).send({ error: 'malformatted id' })
    }
    next(error);
}

//middleware sample
/* const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger); */

morgan.token('body', (req) => JSON.stringify(req.body));

morgan.token('custom', (req, res) => {
    return (
        `${req.method} ${req.url}`
    )
})

app.use(morgan(':custom :status - :response-time ms :body'));

//Fetching data from mongodb database
app.get('/api/persons', (require, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    })
})

//Adding person to the database
app.post('/api/persons', (request, response) => {
    const body = request.body;
    console.log(body);

    if (body.name === "" || body.number === "") {
        return response.status(400).json({
            error: 'Content missing!'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson);
    })
})

//Get perosn by id
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        }).catch(error => next(error))
})

//Delete person by id
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        }).catch(error => next(error));
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
