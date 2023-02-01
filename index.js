const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const mongoose = require('mongoose')

const app = express()

app.use(express.json())
app.use(cors())

app.use(express.static('build'))

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] :body - :response-time ms'))

app.post('/api/persons', async (request, response) => {

    const person = request.body

    if (!person.name || !person.number)
        return response.status(400).json({ error: 'name or number missing' })

    const exists = await Person.find({ name: person.name }).exec()
    if (exists.length !== 0)
        return response.status(409).json({ error: 'name must be unique' })

    const personToSave = new Person({
        ...person
    })

    const savedPerson = await personToSave.save()
    response.json(savedPerson)
})

app.delete('/api/persons/:id', async (request, response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(request.params.id))
            response.status(422).end()

        const person = await Person.findByIdAndDelete(request.params.id)
        if (person)
            response.status(204).end()
        else
            response.status(404).end()
    } catch (error) {
        console.error(error)
    }
})

app.get('/api/persons/:id', async (request, response) => {
    if (!mongoose.Types.ObjectId.isValid(request.params.id))
        response.status(422).end()

    try {
        const person = await Person.findById(request.params.id)
        if (person)
            response.json(person)
        else
            response.status(404).end()
    } catch (e) {
        console.error(e)
    }
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get('/info', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.send(`
                <div>
                    <div>
                        Phonebook has info for ${persons.length} people
                    </div>
                    <div>
                        ${new Date}
                    </div>
                </div>
            `)
        })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})