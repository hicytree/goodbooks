import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Popup from 'reactjs-popup';
import './Home.css'

const Home = () => {
	const navigate = useNavigate();
	const [authenticated, setAuthenticated] = useState(false)
	const [books, setBooks] = useState(new Map())
	const [tempBook, setTempBook] = useState('')

	async function populateBooks() {
		const req = await fetch('http://localhost:1337/api/books', {
			headers: {
				'x-access-token': localStorage.getItem('token')
			}
		})

		const data = await req.json()
		
		if (data.status === 'ok') {
			const stringJSON = JSON.stringify(data.books)
			const bookMap = new Map(Object.entries(JSON.parse(stringJSON)))
			setBooks(bookMap)
		}
		else {
			alert(data.error)
		}
	}

    useEffect(() => {
		const token = localStorage.getItem('token')

		if (token) {
			const user = jwt_decode(token)
			console.log(user)
			
			if (!user) {
				navigate('/login')
				localStorage.removeItem('token')
			}
			else {
				setAuthenticated(true)
				populateBooks()
			}
		}
		else {
			localStorage.removeItem('token')
			navigate('/login')
		}
	}, [navigate])

	function logoutUser() {
		localStorage.removeItem('token')
		setAuthenticated(false)
		window.location.href ='/login'
	}

	async function updateBooks(event) {
		event.preventDefault()

		const bookNameInput = document.getElementById('bookName');
		bookNameInput.value = ''

		if (!tempBook) {
			alert("Please type in a name for a book.")
			setTempBook('')
			return
		}

		if (books.has(tempBook)) {
			alert("This book already exists in your list!")
			setTempBook('')
			return
		}

		const req = await fetch('http://localhost:1337/api/books', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token')
			},
			body: JSON.stringify({
				book: tempBook,
			}),
		})

		const data = await req.json()
		
		if (data.status === 'ok') {
			setBooks(books.set(tempBook, ["All Books", "-", []]))
		}
		else {
			alert(data.error)
		}

		setTempBook('')
	}

	async function removeBook(event, bookName) {
		event.preventDefault()

		const req = await fetch('http://localhost:1337/api/removebook', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token')
			},
			body: JSON.stringify({
				book: bookName,
			}),
		})

		const data = await req.json()
		
		if (data.status === 'ok') {
			books.delete(bookName)
			setBooks(new Map(books))
		}
		else {
			alert(data.error)
		}
	}

	async function changeBookStats(event, bookName) {
		event.preventDefault()

		let elStatus = document.getElementById('status');
		let status = elStatus.options[elStatus.selectedIndex].value;

		let elRating = document.getElementById('rating');
		let rating = elRating.options[elRating.selectedIndex].value;

		const req = await fetch('http://localhost:1337/api/bookstats', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token')
			},
			body: JSON.stringify({
				book: bookName,
				status: status,
				rating: rating,
			}),
		})

		const data = await req.json()
		
		if (data.status === 'ok') {
			books.set(bookName, [status, rating, books.get(bookName)[2]])
			setBooks(new Map(books))
		}
		else {
			alert(data.error)
		}
	}

	if(authenticated) {
		return (
			<div>
				<table>
					<tbody>
						<tr>
							<th>#</th>
							<th>Name</th>
							<th>Reading Status</th>
							<th>Rating</th>
						</tr>
						{([...books.keys()] || []).map((item, i) => (
							<tr>
								<td>{i+1}.</td>
								<td>{item}</td>
								<td>{books.get(item)[0]}</td>
								<td>{books.get(item)[1]}/5</td>
								<Popup trigger={<td>Edit</td>} modal nested>
									{close => (
										<div className="modal">
											<button className="close" onClick={close}>&times;</button>
											<div className="header"> {item} </div>
											<div className="content">
												<label for="status">Select your current reading status: </label>
												<select name="status" id="status">
													<option value="All Books">All Books</option>
													<option value="Finished Reading">Finished Reading</option>
													<option value="Currently Reading">Currently Reading</option>
													<option value="Dropped">Dropped</option>
													<option value="Plan to Read">Plan to Read</option>
												</select>
												<br />
												<br />
												<label for="rating">Select your rating for this book: </label>
												<select name="rating" id="rating">
													<option value="-">-</option>
													<option value="1">1</option>
													<option value="2">2</option>
													<option value="3">3</option>
													<option value="4">4</option>
													<option value="5">5</option>
												</select>
											</div>
											<div className="actions">
												<button className="button" onClick={(e) => 
												{
													changeBookStats(e, item)
													close();
												}}>
													Finish
												</button>
												<button className="button" onClick={(e) => 
												{
													removeBook(e, item); 
													close();
												}}>
													Delete Book
												</button>
											</div>
										</div>
									)}
								</Popup>
							</tr>
						))}
					</tbody>
				</table>
				<form onSubmit={updateBooks}>
					<input id="bookName" type="text" placeholder='Book name' onChange={(e) => setTempBook(e.target.value)} /> <br />
					<input type="submit" value="Add Book" />
				</form>
				<button onClick={logoutUser}>Logout</button>
				
			</div>	
		);
	}
}

export default Home