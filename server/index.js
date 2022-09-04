const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://localhost:27017/goodbooks')

app.use(cors())
app.use(express.json())

app.post('/api/register', async (req, res) => {
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
            name: req.body.name,
			email: req.body.email,
			password: newPassword,
        })
        res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    if(!user) {
        return res.json({status: 'error', user: false, error: 'invalid login'})
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if (isPasswordValid) {
        const token = jwt.sign({
            name: user.name,
            email: user.email,
        }, 'BAW7QBAYAGA10RD9IL7R')

        return res.json({ status: 'ok', user: token})
    }
    else {
        return res.json({ status: 'error', user: false })
    }
})

app.get('/api/books', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'BAW7QBAYAGA10RD9IL7R')
        const email = decoded.email
        const user = await User.findOne({email: email})
        return res.json({ status: 'ok', books: user.books})
    }
    catch(error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
})

app.post('/api/books', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'BAW7QBAYAGA10RD9IL7R')
        const email = decoded.email
        const user = await User.findOne({email: email})
        await user.books.set(req.body.book, ["All Books", "-", []])
        await user.save()
        return res.json({status: 'ok', books: user.books})
    }
    catch(error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
})

app.post('/api/removebook', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'BAW7QBAYAGA10RD9IL7R')
        const email = decoded.email
        const user = await User.findOne({email: email})
        await user.books.delete(req.body.book)
        await user.save()
        return res.json({status: 'ok', books: user.books})
    }
    catch(error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
})

app.post('/api/bookstats', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'BAW7QBAYAGA10RD9IL7R')
        const email = decoded.email
        const user = await User.findOne({email: email})
        await user.books.set(req.body.book, [req.body.status, req.body.rating, user.books.get(req.body.book)[2]])
        await user.save()
        return res.json({status: 'ok', books: user.books})
    }
    catch(error) {
        console.log(error)
        res.json({status: 'error', error: 'invalid token'})
    }
})

app.listen(1337, () => {
    console.log('Server started on 1337...')
})