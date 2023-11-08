// async function checkAndUpdateRoomAvailability() {
//     const today = moment().startOf('day').toDate();
  
//     // Get all bookings where the check-out date is in the past
//     const pastBookings = await bookingCollection.find({
//       check_out_date: { $lt: today },
//     }).toArray();
  
//     for (const booking of pastBookings) {
//       // Increment room count
//       await roomCollection.updateOne(
//         { _id: booking.room_id }, // Assuming each booking references the room's ObjectId
//         { $inc: { "rooms.room_number": booking.room_number } }
//       );
  
//       // Optionally, delete the past booking or mark it as complete
//       // await bookingCollection.deleteOne({ _id: booking._id });
//       // OR
//       // await bookingCollection.updateOne({ _id: booking._id }, { $set: { status: 'completed' } });
//     }
//   }

// app.post("/bookings", async (req, res) => {
//     try {
//         const newBooking = req.body;
//         const { category_name, checkIn, checkOut, room_number } =
//             newBooking;

//         // Get the existing bookings to check for room availability
//         const existingBookings = await bookingCollection
//             .find({
//                 category_name,
//                 checkIn: { $lte: checkOut },
//                 checkOut: { $gte: checkIn },
//             })
//             .toArray();

//         // Get the total number of rooms available
//         const availableRooms = await roomCollection.findOne({
//             category_name,
//         });
//         const totalRooms = parseInt(availableRooms.rooms.room_number);
//         const roomsBooked = existingBookings.reduce(
//             (total, booking) => total + parseInt(booking.room_number),
//             0
//         );
//         const availableRoomCount = totalRooms - roomsBooked;

//         // Check if there are enough rooms available for the new booking
//         if (availableRoomCount >= room_number) {
//             // Insert the new booking
//             const result = await bookingCollection.insertOne(
//                 newBooking
//             );

//             // Update the room count only if the booking was successful
//             if (result.insertedId) {
//                 res.send({ success: true, result });

//                 // This logic assumes room count should be decremented after a successful booking
//                 // and updated in the 'roomCollection' database
//                 const updateRoomCount = totalRooms - room_number;
//                 await roomCollection.updateOne(
//                     { category_name },
//                     { $set: { "rooms.room_number": updateRoomCount } }
//                 );
//             } else {
//                 res.status(500).json({
//                     success: false,
//                     message: "Failed to insert booking",
//                 });
//             }
//         } else {
//             res.status(400).json({
//                 message: "Not enough available rooms",
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "An error occurred",
//             error,
//         });
//     }
// });