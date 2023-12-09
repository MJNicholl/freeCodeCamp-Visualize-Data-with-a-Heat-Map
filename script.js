"use strict"

const externalDatasetURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const container = document.getElementById("container");
const width = window.innerWidth;
const height = 500;
const padding = 100;
const tooltipOffset = 10;
const numberOfColors = 4;
const numberOfMonths = 12;
const barHeight = 27;

let svg;
let dataset;
let tooltip;
let xScale;
let yScale;
let xLimits;
let yLimits;
let varianceLimits;
let colorThreshhold;
let baseTemperature;
let yearsList;
let monthsList;

const CreateSVG = () =>{
    svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
};


const FilterData = (data) => {
    dataset = data;

    baseTemperature = dataset.baseTemperature;
};


const DefineLimits = () => {
    yearsList = dataset.monthlyVariance.map(d => new Date(`01-01-${d.year}`));
    monthsList = dataset.monthlyVariance.map(d => new Date(`${d.month}-01-2023`));

    xLimits = d3.extent(yearsList);
    yLimits = d3.extent(monthsList);

    varianceLimits = d3.extent(dataset.monthlyVariance, d => d.variance);
    colorThreshhold = (varianceLimits[1] - varianceLimits[0]) / numberOfColors;
};


const DefineAxis = () => {
    xScale = d3.scaleTime()
        .domain(xLimits)
        .range([padding, width - padding]);
    
    svg.append("g")
        .attr("transform", `translate(${0}, ${height - padding})`)
        .attr("color", "white")
        .attr("id", "x-axis")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")))

    yScale = d3.scaleTime()
        .domain(yLimits)
        .range([height - padding, padding])

    svg.append("g")
        .attr("transform", `translate(${padding}, ${0})`)
        .attr("fill", "white")
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B")))
};


const CreateBars = () => {
    const barSize = (width - (2 * padding)) / dataset.monthlyVariance.length;

    svg.selectAll("rect")
        .data(dataset.monthlyVariance)
        .enter()
        .append("rect")
        .attr("fill", (d) => (d.variance < 0) ? ((d.variance < -colorThreshhold) ? "blue" : "lightblue") : ((d.variance > colorThreshhold) ? "darkred" : "yellow" ))
        .attr("class", "cell")
        .attr("data-id", (_, i) => i)
        .attr("data-month", (_, i) => monthsList[i].getMonth())
        .attr("data-year", (_, i) => yearsList[i].getFullYear())
        .attr("data-temp", (d) => (baseTemperature + d.variance).toFixed(1))
        .attr("data-variance", (d) => d.variance.toFixed(1))
        .attr("x", (_, i) => xScale(yearsList[i]))
        .attr("width", barSize * numberOfMonths)
        .attr("y", (_, i) => yScale(monthsList[i]) - barHeight)
        .attr("height", (_) => barHeight)
        .on("mouseover", (event) => ShowTooltip(event))
        .on("mouseout", () => HideTooltip())
};


const GetTooltip = () => {
    if(tooltip == null)
    {
        tooltip = document.getElementById("tooltip");
    }
};


const ShowTooltip = (event) => {
    GetTooltip();

    tooltip.dataset.year = event.target.dataset.year;

    let year = event.target.dataset.year;
    let month = monthsList[event.target.dataset.id].toLocaleString("en-us", { month: "long" });
    let temperature = event.target.dataset.temp;
    let variance = event.target.dataset.variance;
    let text = `
    ${year} - ${month}
    Temperature: ${temperature}°C
    Variance: ${variance}°C
    `;

    tooltip.style.top = event.pageY + tooltipOffset + "px";
    tooltip.style.left = event.pageX + tooltipOffset + "px";

    tooltip.textContent = text;

    tooltip.style.visibility = "visible";
};


const HideTooltip = () => {
    GetTooltip();
    tooltip.style.visibility = "hidden";
};


const DrawGraph = () => container.append(svg.node());


const MainProcess = () => {
    CreateSVG();
    d3.json(externalDatasetURL)
        .then((data) => FilterData(data))
        .then(() => DefineLimits())
        .then(() => DefineAxis())
        .then(() => CreateBars())
        .then(() => DrawGraph());
};


MainProcess();
