var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ngasto01_db_user:NkLbRCxY8e7cNAAw@zipcodes.bht4kcv.mongodb.net/?appName=zipCodes";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function getDatabaseData(searchCriteria, userInput)
{
    await client.connect();
  
    var db = client.db("zipCodes");
    var collection = db.collection('zipCodeData');

    // if it is a city
    if(searchCriteria == 1)
    {
     var query = {name:userInput};
     
    }
    else
    {
     var query = {zips:userInput};
    }

    console.log('Query: ', query);
    try{
        const result = await collection.find(query).toArray();

        console.log("Results: ");
        for (i=0; i< result.length; i++)
        {
            console.log(i + ": " + result[i].name );         
            console.log("zips", result[i].zips);    
        }   
        return result;
    
    } catch (err) {
        console.log("Error:", err);
    } finally {
        await client.close();
    }

}


const server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  urlObj = url.parse(req.url,true)
  path = urlObj.pathname;
  if (path == "/")
  {
    file="homeview.txt";
    fs.readFile(file, function(err, homeView) {
    res.write(homeView);
    res.end();
    })
  }
  else if (path == "/process")
  {
	
    var body = '';
    req.on('data', chunk => { 
        
        // Parse the body to usable data
        body += chunk.toString(); 
     });
    req.on('end', async () => { 
        
        // Rip out the user input
        var input = qs.parse(body).data;

        //Check if we have a zipcode or a city to query
        if( /^\d$/.test(input[0]))
        {
            console.log("is a digit");
            var type =0;
        }
        else
        {
            var type = 1;
        }
        const displayData = await getDatabaseData(type,input);
        if(displayData.lenght > 0)
        {
            res.write("<h2>"+displayData[0].name +"</h2>");
            res.write ("<p>The zip codes are:  " + displayData[0].zips +"</p>" );
        }
        else
        {
            res.write("<h2>No City or Zip Code Found!!!</h2>")
        }
        res.end();
    });
  }
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
