const { json } = require('body-parser');
const express = require('express');
const fs = require('fs');
let app = express();
app.use(express.json());
const axios = require('axios'); 

app.use(express.static('assets')); 

app.get('/index.html', (request, response) => {
    response.sendFile(__dirname + '/index.html');
})

app.get('/weather.html', (request, response) => {
    response.sendFile(__dirname + '/weather.html');
})

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/index.html');
})

app.get('/cart.html', (request, response) => {
    response.sendFile(__dirname + '/cart.html');
})

app.get('/contact.html', (request, response) => {
    response.sendFile(__dirname + '/contact.html');
})

app.get('/product.html', (request, response) => {
    response.sendFile(__dirname + '/product.html');
})

app.get('/profile.html', (request, response) => {
    response.sendFile(__dirname + '/profile.html');
})

app.get('/shop.html', (request, response) => {
    response.sendFile(__dirname + '/shop.html');
})

app.get('/about.html', (request, response) => {
    response.sendFile(__dirname + '/about.html');
})



app.get('/hello', (request, response) => { 
    response.json({message: "Hello from SERVEEEEEEEER<3"});
})

app.get('/time', (request, response) => {
    const now = new Date();
    
    response.send("Present time: " + now.toDateString());
});

app.get('/status', (request, response) => {
    response.status(200).json({
        status: "OK",
        message: "Semakina zemli poela"
    });
});

app.get('/items', (request, response) => {
    fs.readFile('data.json', 'utf8', (err, data) => {

        const jsonData = JSON.parse(data);

        response.json(jsonData);
    });
});

app.post('/items', (req, res) => {

    fs.readFile('data.json', 'utf8', (err, data) => {

        const db = JSON.parse(data);
        
        const newItem = {
            id: db.items.length > 0 ? db.items[db.items.length - 1].id + 1 : 1,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category || "General",
            description: req.body.description || ""
        };

        db.items.push(newItem);

        fs.writeFile('data.json', JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.json(newItem);
        });
    });
});

app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id); 

    fs.readFile('data.json', 'utf8', (err, data) => {
        
        const db = JSON.parse(data);
        
        const item = db.items.find(i => i.id === id);

        if (!item) {
            return res.status(404).send("Item not found"); 
        }

        item.name = req.body.name || item.name;
        item.price = req.body.price || item.price;
        item.category = req.body.category || item.category;
        item.description = req.body.description || item.description;

        fs.writeFile('data.json', JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.json(item); 
        });
    });
});

app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile('data.json', 'utf8', (err, data) => {

        let db = JSON.parse(data);

        const newItems = db.items.filter(i => i.id !== id);

        if (newItems.length === db.items.length) {
            return res.status(404).send("Item not found");
        }

        db.items = newItems; 
        fs.writeFile('data.json', JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file");
            res.json({ message: "Deleted" })
        });
    });
});


app.get('/weather', async (req, res) => {
    const city = req.query.city; 
    const apiKey = '5f764c98cec648822301320198aae8ef'; 

    if (!city) {
        return res.status(400).json({ error: "City name is required" });
    }

    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        const data = weatherResponse.data;

        const weatherResult = {
            temperature: data.main.temp,
            description: data.weather[0].description,
            icon: data.weather[0].icon, 
            coordinates: data.coord,
            feels_like: data.main.feels_like,
            wind_speed: data.wind.speed,
            country_code: data.sys.country,
            rain_volume: (data.rain && data.rain['3h']) ? data.rain['3h'] : 0 
        };

        let countryInfo = {};
        try {
            const countryUrl = `https://restcountries.com/v3.1/alpha/${weatherResult.country_code}`;
            const countryResponse = await axios.get(countryUrl);
            const countryData = countryResponse.data[0];

            const currencyKey = Object.keys(countryData.currencies)[0];
            const languages = Object.values(countryData.languages).join(', '); 

            countryInfo = {
                currency: countryData.currencies[currencyKey].name,
                currency_symbol: countryData.currencies[currencyKey].symbol,
                population: countryData.population,
                flag: countryData.flags.png,
                capital: countryData.capital ? countryData.capital[0] : "No Capital", 
                region: countryData.region, 
                googleMaps: countryData.maps.googleMaps 
            };
        } catch (err) {
            console.log("Error fetching country data:", err.message);
            countryInfo = { error: "Could not fetch extra country data" };
        }

        res.json({
            weather: weatherResult,
            country_facts: countryInfo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching data. Check city name." });
    }
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
})