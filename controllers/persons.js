const personsRouter = require('express').Router();
const Person = require('../models/person')

personsRouter.get('/', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()));
    })
})

//Adding person to the database
personsRouter.post('/', (request, response, next) => {
    const body = request.body;
    //console.log(body);
    if (!body.name) {
        return response.status(400).json({
            error: "name missing",
        });
    } else if (!body.number) {
        return response.status(400).json({
            error: " number missing",
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then((savedPerson) => savedPerson.toJSON())
        .then((savedAndFormattedPerson) => {
            response.json(savedAndFormattedPerson);
        })
        .catch((error) => next(error));
})

//Get perosn by id
personsRouter.get('/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON());
            } else {
                response.status(404).end();
            }
        }).catch(error => next(error))
})

//Delete person by id
personsRouter.delete('/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end();
        }).catch(error => next(error));
})

personsRouter.put('/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person)
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON());
        }).catch(error => next(error))
})

module.exports = personsRouter;