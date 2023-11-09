const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(
	cors({
		origin: "http://localhost:5173", // update to match the URL of your react frontend
		credentials: true,
	})
); //allow cross origin resource sharing (CORS)
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oh6dvsr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

//middlewares
const logger = async (req, res, next) => {
	console.log("called", req.host);
	next();
};

//verify token and grant access

const verifyToken = async (req, res, next) => {
	const token = req.cookies?.token;
	console.log("value of token in middleware", token);
	if (!token) {
		return res.status(401).send({ message: "not authorized" });
	}
	// verify a token symmetric
	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		//error
		if (err) {
			console.log(err);
			return res.status(401).send({ message: "unauthorized" });
		}
		//if token is valid it would be decoded
		console.log("value in the token", decoded);
		//attach decoded user so that others can get it
		req.user = decoded;
		next();
	});
};

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		//const roomCollection = client.db("hotelBook").collection("rooms");
		const bookingCollection = client.db("hotelBook").collection("bookings");
		const roomCategoriesCollection = client
			.db("hotelBook")
			.collection("roomCategories");
		const reviewsCollection = client.db("hotelBook").collection("reviews");

		//jwt
		app.post("/jwt", logger, async (req, res) => {
			//send to client
			const user = req.body;
			const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
				expiresIn: "3h",
			}); // post the name as a token
			res.cookie("token", token, {
				httpOnly: true,
				secure: false,
			}).send({ success: true });
		});
		app.post("/logout", async (req, res) => {
			const user = req.body;
			console.log("logging out", user);
			res.clearCookie("token", { maxAge: 0 }).send({ success: true });
		});

		// get all roomcategories data
		app.get("/room", async (req, res) => {
			const cursor = roomCategoriesCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// get roomcategories data by id
		app.get("/room/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };

			const room = await roomCategoriesCollection.findOne(filter);

			res.send(room);
		});

		// // get all reviews data
		// app.get("/reviews", async (req, res) => {
		// 	const cursor = reviewsCollection.find();
		// 	const result = await cursor.toArray();
		// 	res.send(result);
		// });

		// get reviews by categoryId
		app.get("/api/reviews", async (req, res) => {
			const categoryId = new ObjectId(req.query.categoryId);
			// Fetch reviews from the database where `categoryId` matches
			const cursor = reviewsCollection.find({categoryId: categoryId});
			const reviews = await cursor.toArray();
			res.send(reviews);
		});

		// post booked data
		app.post("/bookings", async (req, res) => {
			const newBooking = req.body;
			const result = await bookingCollection.insertOne(newBooking);
			res.send(result);
		});
		// get booked data
		app.get("/bookings", async (req, res) => {
			const cursor = bookingCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		// filter booking by userId
		app.get("/bookings/:userId", async (req, res) => {
			const userId = req.params.userId;
			const bookings = await bookingCollection
				.find({ userId: new ObjectId(userId) })
				.toArray();
			res.send(bookings);
		});

		// booking cancellation
		app.delete("/bookings/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await bookingCollection.deleteOne(query);
			if (result.deletedCount === 1) {
				// Document was successfully deleted
				// You can send the deleted data as a response if needed
				res.send({
					message: "Booking deleted successfully",
					deletedId: id,
				});
			} else {
				// No document was deleted
				res.status(404).send({ message: "Booking not found" });
			}
			//res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	let currentDate = moment().format("YYYY-MM-DD");
	res.send(`Hotel-Booking Server is running on ${currentDate}`);
});

app.listen(port, () => {
	console.log(`Hotel-Booking Server is running on port, ${port}`);
});
