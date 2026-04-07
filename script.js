const apiKey="1d4f6cf3c79b31241dd1d4c732059e8c"
let tempData=[]
let windData=[]
let humidityData=[]
let hourLabels=[]

window.onload=()=>{
getLocationWeather()
loadTheme()
}

document.getElementById("city").addEventListener("keypress",function(e){
if(e.key==="Enter"){
getWeather()
}
})

async function getWeather(){
let city=document.getElementById("city").value.trim()
if(city==="") return
let res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
)

let data=await res.json()
showWeather(data)
getForecast(city)
}

function getLocationWeather(){
navigator.geolocation.getCurrentPosition(async pos=>{
let lat=pos.coords.latitude
let lon=pos.coords.longitude
let res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
)

let data=await res.json()
showWeather(data)
getForecast(data.name)
})
}

function showWeather(data){
document.getElementById("cityName").innerText="📍 "+data.name
document.getElementById("temp").innerText=data.main.temp+" °C"
document.getElementById("desc").innerText=data.weather[0].description
document.getElementById("humidity").innerText=data.main.humidity+"%"

let windKmh = data.wind.speed * 3.6
document.getElementById("wind").innerText =
windKmh < 1 ? "Calm" : windKmh.toFixed(1)+" km/h"
document.getElementById("pressure").innerText=data.main.pressure+" hPa"
document.getElementById("sunrise").innerText=
new Date(data.sys.sunrise*1000).toLocaleTimeString()
document.getElementById("sunset").innerText=
new Date(data.sys.sunset*1000).toLocaleTimeString()
}

async function getForecast(city){
let res=await fetch(
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
)

let data=await res.json()
tempData=[]
windData=[]
humidityData=[]
hourLabels=[]

let currentHour=new Date().getHours()
for(let i=0;i<24;i++){
let index=Math.floor(i/3)
let prev=data.list[Math.max(0,index-1)]
let curr=data.list[index]
let next=data.list[Math.min(data.list.length-1,index+1)]
let hour=(currentHour+i)%24
hourLabels.push(hour+":00")
tempData.push(curr.main.temp)

let smoothWind = (
(prev.wind.speed + curr.wind.speed + next.wind.speed)/3
)*3.6
if(smoothWind < 1){
windData.push("Calm")
}else{
windData.push(smoothWind.toFixed(1))
}
humidityData.push(curr.main.humidity)
}
showTempHourly()
showHourly("wind")

let forecastHTML=""
for(let i=0;i<5;i++){
let dayData=data.list.slice(i*8,(i+1)*8)
if(dayData.length===0) continue

let temps=dayData.map(x=>x.main.temp)
let minTemp=Math.min(...temps)
let maxTemp=Math.max(...temps)
let humidityArr=dayData.map(x=>x.main.humidity)
let avgHumidity=Math.round(
humidityArr.reduce((a,b)=>a+b,0)/humidityArr.length
)

let windArr=dayData.map(x=>x.wind.speed*3.6)
windArr.sort((a,b)=>a-b)
let mid=Math.floor(windArr.length/2)
let medianWind=windArr[mid]
let windText=medianWind < 1
? "Calm"
: medianWind.toFixed(1)+" km/h"

let day=new Date(dayData[0].dt*1000)
.toLocaleDateString("en-US",{weekday:"short"})
forecastHTML+=`
<div class="forecast-card">
<div class="forecast-day">${day}</div>
<div class="temp-range">
${Math.round(minTemp)}° / ${Math.round(maxTemp)}°
</div>
<div style="font-size:12px">
💧 ${avgHumidity}% | 💨 ${windText}
</div>
</div>
`
}
document.getElementById("forecast").innerHTML=forecastHTML
}

function showTempHourly(){
let html=""
for(let i=0;i<hourLabels.length;i++){
html+=`
<div class="hour-card">
<p>${hourLabels[i]}</p>
<p>${tempData[i]}°C</p>
</div>
`
}
document.getElementById("tempHourly").innerHTML=html
}

function showHourly(type){
let html=""
for(let i=0;i<hourLabels.length;i++){
let value=""
if(type==="wind") value=windData[i]+" km/h"
if(type==="humidity") value=humidityData[i]+"%"
html+=`
<div class="hour-card">
<p>${hourLabels[i]}</p>
<p>${value}</p>
</div>
`
}
document.getElementById("hourly").innerHTML=html
}

const toggle=document.getElementById("themeToggle")
toggle.addEventListener("change",()=>{
if(toggle.checked){
document.body.classList.add("light")
localStorage.setItem("theme","light")
}else{
document.body.classList.remove("light")
localStorage.setItem("theme","dark")
}
})

function loadTheme(){
if(localStorage.getItem("theme")==="light"){
document.body.classList.add("light")
toggle.checked=true
}
}