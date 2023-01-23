const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.use(express.json())
app.use(cors())

app.use(express.static('build'))

morgan.token('body', (req, res) =>  JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] :body - :response-time ms'))

app.post('/api/persons', (request, response) => {

    const person = request.body

    if (!person.name || !person.number)
        return response.status(400).json({ error: 'name or number missing' })

    const exists = persons.find(p => p.name === person.name)

    if (exists)
        return response.status(409).json({ error: 'name must be unique' })

    person.id = Math.floor(Math.random() * 100)
    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person)
        response.json(person)
    else
        response.status(404).end()
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})