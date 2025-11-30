// main.js


window.onload = () => {

    //1. Define Setup and Dimensions


    const margin = {top: 40, right: 150, bottom: 60, left: 70};
    const width = 800 - margin.left - margin.right; // Breite des eigentlichen Plots
    const height = 500 - margin.top - margin.bottom; // Höhe des eigentlichen Plots

    // SVG-Container creation
    const svg = d3.select("#scatter_plot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`); //set orogin g to (0,0)

//Loading and Parsing Data
//scatter plot x: horsepower y: dealer cost color: type, size: weight

    d3.csv("cars.csv").then(function(data) {


        data.forEach(d => {
          //convert attributes to numeric if applicable
            d.Horsepower = +d['Horsepower(HP)'];
            d.Dealer_Cost = +d['Dealer Cost'];
            d.Retail_Price = +d['Retail Price'];
            d.AWD = +d.AWD;
            d.RWD = +d.RWD;
            d.Engine_Size = +d['Engine Size (l)'];
            d.Cyl = +d.Cyl;
            d.City_MPG = +d['City Miles Per Gallon'];
            d.Highway_MPG = +d['Highway Miles Per Gallon'];
            d.Weight = +d.Weight;
            d.Wheel_Base = +d['Wheel Base'];
            d.Len = +d.Len;
            d.Width = +d.Width;

            // d.Type und d.Name remain as String
        });



        //console.log("Daten erfolgreich geladen. Gefilterte Punkte:", data.length);
        const filteredData = data.filter(d =>
            !isNaN(d.Horsepower) && !isNaN(d.Dealer_Cost) && !isNaN(d.Weight)
        );

        console.log("Nutzbare Punkte nach Filterung:", filteredData.length);
        console.log("Erster Datenpunkt (gefiltert):", filteredData[0]);




//Define Axis of the plot
        // x-scale = horsepower
        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.Horsepower))
            .range([0, width]);

        // y-scale =dealer cost
        const yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.Dealer_Cost))
            .range([height, 0]);

        // radius = weight
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(filteredData, d => d.Weight))
            .range([3, 15]);

        // color = category
        const typeDomain = [...new Set(filteredData.map(d => d.Type))].sort();
        const colorScale = d3.scaleOrdinal()
            .domain(typeDomain)
            .range(d3.schemeCategory10);

        // 4.1. X-Achse und Label (Horsepower)
        svg.append("g")
            .attr("transform", `translate(0,${height})`) //moving x axis from top to bottom
            .call(d3.axisBottom(xScale).ticks(10))
            .append("text")
            .attr("x", width/2).attr("y", 45).attr("fill", "black")
            .style("text-anchor", "middle").text("Horsepower (PS)");

        // 4.2. Y-Achse und Label (Dealer Cost)
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10, "$.2s"))
            .append("text")
            .attr("transform", "rotate(-90)").attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2)).attr("fill", "black")
            .style("text-anchor", "middle").text("Dealer Cost (USD)");

    }).catch(error => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
    });
};
