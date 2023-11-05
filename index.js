const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
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

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		const roomCollection = client.db("hotelBook").collection("rooms");

		//jwt
		app.post("/jwt", async (req, res) => {
			//send to client
			const user = req.body;
			const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
				expiresIn: "1h",
			}); // post the name as a token
			res.cookie("token", token, {
				httpOnly: true,
				secure: false,
			}).send({ success: true });
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
	res.send("Hotel-Booking Server is running");
});

app.listen(port, () => {
	console.log(`Hotel-Booking Server is running on port, ${port}`);
});
