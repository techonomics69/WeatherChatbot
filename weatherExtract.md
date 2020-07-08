# Explaination “weatherExtract.js”

For the **“weatherExtract.js”** action, I will go through it step-by-step now.

First of all, you have to set up some variables and functions before starting the action. You should call **“Axios”** this javascript library in order to achieve an HTTP request. Then you should set the variable months as a string array object, which associates with the `Date.getMonth()` method. Finally, you also have to set up the function `dtCon()`, which associates with your main function to convert the `dt` object to Date object in javascript, and the correct timezone of your city.  

```javascript
const axios = require('axios')
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function dtCon(dt, offset) {    //function to transform dataType "dt" to "Date" and change the timezone
    console.log("dt: ", dt)
    console.log("timezone_offset: ", offset)

    if (dt == undefined) {
    console.log('Error: var dt is undefined')
    return 0
    } else {
    var tempDate = new Date()
    var utc = (dt * 1000) + (tempDate.getTimezoneOffset() * 60000)
    var localTime = utc + (offset * 1000)
    var date = new Date(localTime)
    return date
    }
}
```

Then, we will jump into the main function, which will be the const `weatherInfoExtraction{}` in reference. You have to call the API once to get the latitude and longitude of the input city. Furthermore, we should bond it with the **“try-catch” function** in order to prevent HTTP request error. It may cause the crash of the program.

```javascript
//get the Latitude and Longitude value of the city
var url =
      'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid={{YOUR OWN API}}'     
    console.log(cityName)
    console.log(url)
    try {
      const { data } = await axios.get(url)
      var lat = data.coord.lat
      var lon = data.coord.lon
    } catch (err) {
      console.log("Error: Can't find your city")
    }
```

After that, the first **“if” condition** is going to get the current weather information. You have to call the API with `await axios.get()` again with your city’s latitude and longitude. This will give you the whole data of current information.

```javascript
if (name == 'current') {    //get the current weather information
      console.log('current')
      const { data } = await axios.get(
        'https://api.openweathermap.org/data/2.5/onecall?lat=' +
          lat +'&lon=' + lon +
          '&exclude=hourly,minutely,daily&units=metric&appid={{	YOUR OWN API}}'
      )
```

The data received will be like this(example):
![image](https://github.com/cheukming0607/WeatherChatbot/blob/master/HTTP_request_data.png)

Then, you can use `JSON.parse(JSON.stringtify())` to convert the data into a date object. After that use `dtCon()` to do **“dt” conversion**.

```javascript
var weatherCurrentCon = JSON.parse(JSON.stringify(data))
//change the JSON data to Javascript object
var dateInfo = dtCon(weatherCurrentCon.current.dt, weatherCurrentCon.timezone_offset)
//change dt to Date
```

After converting the data into a Date object, you can start putting the weather information into temp.weatherInfo, which can be used in Botpress directly. In reference, I will use the `Date.getDate()`, `Date.getMonth()`, `Date.getHour()`, `Date.getMinute()` to get the current date, index of month, and time respectively. Furthermore, I will use the `months[Date.getMonth()]` to get the short form of the month. The `weatherTonightCon.hourly[i].temp` and `weatherTonightCon.hourly[i].weather[0].description` will get the current temperature and weather condition respectively.

```javascript
temp.weatherInfo =     //append the weatherInfo to "temp" in botpress
        dateInfo.getDate() +
        ' ' +
        months[dateInfo.getMonth()] +
        ' ' +
        dateInfo.getHours() +
        ':' +
        dateInfo.getMinutes() +
        '\n' +
        'Now temperature is ' +
        weatherCurrentCon.current.temp +
        '℃\n' +
        'and the weather condition is ' +
        weatherCurrentCon.current.weather[0].description
```

For the **“tonight”** part, it basically is the same as the **“current”** part. However, we have to consider when it is the time of users checking. If the user is in the afternoon, which is before sunset, you can just display the weather information from after sunset until the next day at sunrise. If no, we have to move the index until the time that the users check. Then display the weather information until the next day's sunset. For doing the comparison, we may directly compare the curInfo.dt and curInfo.sunset. In reference, I write an argument like this:

```javascript
if(curInfo.dt < curInfo.sunset){ //if your current time is in the afternoon
    //Your code...
} else if (curInfo.dt >= curInfo.sunset){
    //Your code...
}
```
  
For moving the index to a specific time, I use **while loop**:

```javascript
while (weatherTonightCon.hourly[i].dt <= weatherTonightCon.daily[1].sunrise) 
{
    i++;
}
```

For inputting the array type object into temp.weatherInfo, I use while loop again:

```javascript
while (weatherTonightCon.hourly[i].dt <= weatherTonightCon.daily[1].sunrise)
{
  //Your code which appends the data in temp.weatherInfo…
  i++;
}
```

Then we can jump into the **“7-day_forcasting” part**, it is almost the same as the parts that I have mentioned but with only one while loop. In order to display the coming seven-day weather information, we have to set the index that will not exceed the array. Therefore, I will use the argument `k < dayNum` in this **while loop**. Then the while loop is going to be like this:

```javascript
While (k < dayNum) {
    //Your code to append weather information in the coming seven-day…
    i++;
}
```

*P.S. If you cannot finish the code by yourself, don’t worry. I will put the reference code down below in the appendix. You may need it before jumping into the next part.*

After that, you may find that the bot is not very intelligent. Therefore, we can now try to work with NLU and let the bot understand what you are talking about.
