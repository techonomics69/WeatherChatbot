  /**
   * Here is the weatherExtract.js actions.
   * @title weatherExtract
   * @category Weather
   * @author AU Cheuk Ming
   * @param {string} name - An example string variable
   * @param {string} cityName - The city your are looking for
   */
  const axios = require('axios')

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  function dtCon(dt, offset) {
    //function to transform dataType "dt" to "Date"
    console.log('dt: ', dt)
    console.log('timezone_offset: ', offset)

    if (dt == undefined) {
      console.log('Error: var dt is undefined')
      return 0
    } else {
      var tempDate = new Date()
      var utc = dt * 1000 + tempDate.getTimezoneOffset() * 60000
      var localTime = utc + offset * 1000
      var date = new Date(localTime)
      return date
    }
  }

  const weatherInfoExtraction = async (name, cityName) => {
    var url =
      'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=12a728e8826a1d066d77af024be3cc40' //get the Latitude and Lontitude value of the city
    console.log(cityName)
    console.log(url)
    try {
      const { data } = await axios.get(url)
      var lat = data.coord.lat
      var lon = data.coord.lon
    } catch (err) {
      console.log("Error: Can't find your city")
    }

    if (name == 'current') {
      //get the current weather information
      console.log('current')
      const { data } = await axios.get(
        'https://api.openweathermap.org/data/2.5/onecall?lat=' +
          lat +
          '&lon=' +
          lon +
          '&exclude=hourly,minutely,daily&units=metric&appid=12a728e8826a1d066d77af024be3cc40'
      )
      var weatherCurrentCon = JSON.parse(JSON.stringify(data)) //change the JSON data to Javascript object
      var dateInfo = dtCon(weatherCurrentCon.current.dt, weatherCurrentCon.timezone_offset) //change dt to Date

      temp.weatherInfo = //append the weatherInfo to "temp" in botpress
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
    } else if (name == 'tonight') {
      //get the tonight weather information
      console.log('tonight')
      const { data } = await axios.get(
        'https://api.openweathermap.org/data/2.5/onecall?lat=' +
          lat +
          '&lon=' +
          lon +
          '&exclude=minutely&units=metric&appid=12a728e8826a1d066d77af024be3cc40'
      )

      var weatherTonightCon = JSON.parse(JSON.stringify(data))
      var curInfo = weatherTonightCon.current
      temp.weatherInfo = ''

      if (curInfo.dt < curInfo.sunset) {
        //if your current time is in the afternoon
        console.log('In the afternoon')
        var i = 0

        while (weatherTonightCon.hourly[i].dt <= curInfo.sunset) {
          //move the index of "hourly" to sunset hour
          i++
        }

        while (weatherTonightCon.hourly[i].dt <= weatherTonightCon.daily[1].sunrise) {
          //append the array type weatherInfo to "temp" in botpress
          dateInfo = dtCon(weatherTonightCon.hourly[i].dt, weatherTonightCon.timezone_offset)

          temp.weatherInfo +=
            dateInfo.getDate() +
            ' ' +
            months[dateInfo.getMonth()] +
            ' ' +
            dateInfo.getHours() +
            ':' +
            dateInfo.getMinutes() +
            '\n' +
            'Temperature is :' +
            weatherTonightCon.hourly[i].temp +
            '℃\n' +
            'Weather condition: ' +
            weatherTonightCon.hourly[i].weather[0].description +
            '\n' +
            ' ' +
            '\n'

          i++
        }
      } else if (curInfo.dt >= curInfo.sunset) {
        //if your current time is in the evening
        console.log('In the evening')
        var i = 0
        while (weatherTonightCon.hourly[i].dt <= weatherTonightCon.daily[1].sunrise) {
          dateInfo = dtCon(weatherTonightCon.hourly[i].dt, weatherTonightCon.timezone_offset)

          temp.weatherInfo +=
            dateInfo.getDate() +
            ' ' +
            months[dateInfo.getMonth()] +
            ' ' +
            dateInfo.getHours() +
            ':' +
            dateInfo.getMinutes() +
            '\n' +
            'Temperature is :' +
            weatherTonightCon.hourly[i].temp +
            '℃\n' +
            'Weather condition: ' +
            weatherTonightCon.hourly[i].weather[0].description +
            '\n' +
            ' ' +
            '\n'

          i++
        }
      }
    } else if (name == '7-day_forcasting') {
      //get the 7-day_forcasting's weather information

      console.log('7-day_forcasting')
      const { data } = await axios.get(
        'https://api.openweathermap.org/data/2.5/onecall?lat=' +
          lat +
          '&lon=' +
          lon +
          '&exclude=minutely&units=metric&appid=12a728e8826a1d066d77af024be3cc40'
      )
      console.log(data)
      temp.weatherInfo = ''
      var weatherSevenDayCon = JSON.parse(JSON.stringify(data))
      var dayNum = weatherSevenDayCon.daily.length
      console.log(dayNum)

      var k = 1

      while (k < dayNum) {
        console.log('No of K: ', k)
        dateInfo = dtCon(weatherSevenDayCon.daily[k].dt, weatherSevenDayCon.timezone_offset)
        sunriseInfo = dtCon(weatherSevenDayCon.daily[k].sunrise, weatherSevenDayCon.timezone_offset)
        sunsetInfo = dtCon(weatherSevenDayCon.daily[k].sunset, weatherSevenDayCon.timezone_offset)
        console.log(
          'dt = ',
          weatherSevenDayCon.daily[k].dt,
          'sunrise = ',
          weatherSevenDayCon.daily[k].sunrise,
          'sunset = ',
          weatherSevenDayCon.daily[k].sunset
        )
        console.log('Day: ', k, dateInfo, sunriseInfo, sunsetInfo)

        temp.weatherInfo +=
          dateInfo.getDate() +
          ' ' +
          months[dateInfo.getMonth()] +
          '\n' +
          'Day time: ' +
          sunriseInfo.getHours() +
          ':' +
          sunriseInfo.getMinutes() +
          ' to ' +
          sunsetInfo.getHours() +
          ':' +
          sunsetInfo.getMinutes() +
          '\n' +
          'Temperature is: ' +
          weatherSevenDayCon.daily[k].temp.day +
          '℃ ' +
          '\n' +
          '(Highest: ' +
          weatherSevenDayCon.daily[k].temp.max +
          '℃, Lowest: ' +
          weatherSevenDayCon.daily[k].temp.min +
          '℃)' +
          '\n' +
          'Weather condition: ' +
          weatherSevenDayCon.daily[k].weather[0].description +
          '\n' +
          ' ' +
          '\n'

        k++
      }
    } else {
      console.log('Invaild weather type input: ', name)
    }
  }

  return weatherInfoExtraction(args.name, args.cityName)