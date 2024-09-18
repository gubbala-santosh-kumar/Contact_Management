// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize the app
const app = express();

// Set up the middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (optional, if you have styles or assets in public folder)
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/contactDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Define the schema for contact data
const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    number: String
});

// Create a model based on the schema
const Contact = mongoose.model('Contact', contactSchema);

app.get('/',(req,res)=>{
    res.render('main');
})
// Render the form on the root route
app.get('/index', (req, res) => {
    res.render('index'); // Renders the 'index.ejs' file
});

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { first_name, last_name, number } = req.body;

    // Create a new contact
    const newContact = new Contact({
        firstName: first_name,
        lastName: last_name,
        number: number
    });

    // Save the contact to the database
    newContact.save()
        .then(() => {
            res.send('Contact information saved successfully!');
            res.render('search');
        })
        .catch((err) => {
            console.error('Error saving contact:', err);
            res.status(500).send('Failed to save contact information.');
        });
});

// Route to render the search page
app.get('/search', (req, res) => {
    res.render('search', { contact: null, searchPerformed: false });
});

// Route to handle search form submission
app.post('/search', (req, res) => {
    const contactName = req.body.contact_name;

    // Find the contact in the database (search by first name or last name)
    Contact.findOne({ firstName: contactName })
        .then((foundContact) => {
            if (foundContact) {
                res.render('search', { contact: foundContact, searchPerformed: true });
            } else {
                res.render('search', { contact: null, searchPerformed: true });
            }
        })
        .catch((err) => {
            console.error('Error searching for contact:', err);
            res.status(500).send('Failed to search for contact.');
        });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});