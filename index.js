const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors()); //allow cross origin resource sharing (CORS)
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hotel-Booking Server is running");
});

app.listen(port, () => {
	console.log(`Hotel-Booking Server is running on port, ${port}`);
});
