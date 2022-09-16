module.exports.response = (api = '', secondAPI = '', channelID, purpose = '') => { // A GENERAL API FETCHING FUNCTION
        
    let today = new Date();
    let date = today.getDate() + '-' +(today.getMonth()+1) + '-' + today.getFullYear();
    
    fetch(`${api}`)
        .then(response => {
            return response.json();
        })

        .then((data) => {
            if(purpose=='getWeather'){
            let forecast = `[${":white_sun_small_cloud:"} Forecast] ${weatherIcon(data.hourly[0].weather[0].icon)} ${data.hourly[0].weather[0].description}, ${weatherIcon(data.hourly[4].weather[0].icon)} ${data.hourly[4].weather[0].description}, ${weatherIcon(data.hourly[8].weather[0].icon)} ${data.hourly[8].weather[0].description}`;
            let dailyMax = `[${":small_red_triangle:"} Max] ${temperatureIcon(data.daily[0].temp.max)} ${data.daily[0].temp.max}\xB0 Celsius`;
            let dailyMin = `[${":small_red_triangle_down:"} Min] ${temperatureIcon(data.daily[0].temp.min)} ${data.daily[0].temp.min}\xB0 Celsius `;
            
            async function response2 (api = '', channelID) {
                
                fetch(`${api}`)
                .then(response => {
                    return response.json();
                })
                .then((data) => {
                    const weatherEmbed = new Discord.MessageEmbed() // BELOW IS THE EMBED OPTIONS FOR THE MSG
                    .setColor('#e4cd3b')
                    .addField(`${":map:"} Location: Ottawa, ON`, `
                    ${forecast}
                    [${":thermometer:"} Current] ${temperatureIcon(data.main.temp)} ${data.main.temp}\xB0 Celsius 
                    ${dailyMax}
                    ${dailyMin} 
                    `)
                    .setFooter(`Date: ${date}`)
                channelID.send(weatherEmbed); // SENDS THE EMBED
                })
            }
            response2(secondAPI, channelID);
        }

        if(purpose=='etc'){}
    })
}