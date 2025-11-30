// main.js


window.onload = () => {

    //1. Define Setup and Dimensions


    const margin = {top: 40, right: 200, bottom: 60, left: 70};
    const width = 800 - margin.left - margin.right; // Breite des eigentlichen Plots
    const height = 500 - margin.top - margin.bottom; // Höhe des eigentlichen Plots

    // SVG-Container creation
    const svg = d3.select("#scatter_plot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`); //set orogin g to (0,0)

//----------------------------------------------------------------------------------------------------
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
            !isNaN(d.Horsepower) &&
            !isNaN(d.Dealer_Cost) &&
            !isNaN(d.Weight)
        );

        console.log("Nutzbare Punkte nach Filterung:", filteredData.length);
        console.log("Erster Datenpunkt (gefiltert):", filteredData[0]);



//----------------------------------------------------------------------------------------------------
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


 //--------------------------------------------
        const numberFormat = d3.format(",.0f");

//----------------------------------------------------------------------------------------------------
//Draw Axis
        // 4.1. X-Axis and Label (Horsepower)
        svg.append("g")
            .attr("transform", `translate(0,${height})`) //moving x axis from top to bottom
            .call(d3.axisBottom(xScale).ticks(10))
            .append("text")
            .attr("x", width/2).attr("y", 45).attr("fill", "black")
            .style("text-anchor", "middle").text("Horsepower (PS)");

        // 4.2. Y-Axis and Label (Dealer Cost)
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10, "$.2s"))
            .append("text")
            .attr("transform", "rotate(-90)").attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2)).attr("fill", "black")
            .style("text-anchor", "middle").text("Dealer Cost (USD)");

//----------------------------------------------------------------------------------------------------
//draw legend and data points

        //legend
        // right next to plot area
        const legend = svg.append("g")
            .attr("transform",`translate(${width +20}, 0)`)

        legend.append("text")
            .attr("x", 0).attr("y", -15)
            .style("text-anchor", "start").style("font-weight", "bold").text("Vehicle Type (Color)");

        //generating dots
        legend.selectAll(".legend-dot")
            .data(typeDomain)
            .enter().append("circle")
                .attr("cx", 0).attr("cy", (d,i) => i*20) //space between dots
                .attr("r", 5).style("fill", d => colorScale(d)); //radius and color

        //adding labels
        legend.selectAll(".legend-label")
            .data(typeDomain)
            .enter().append("text")
                .attr("x", 10).attr("y", (d, i) => i * 20 + 4)
                .text(d => d);

        //plotting data
        svg.selectAll(".dot")
            .data(filteredData)
            .enter()
            .append("circle")
                .attr("class", "dot")
                .attr("cx", d => xScale(d.Horsepower))
                .attr("cy", d => yScale(d.Dealer_Cost))
                .attr("r", d => rScale(d.Weight))
                .style("fill", d => colorScale(d.Type))
                .attr("opacity", 0.5)
                .on("click", (event, d, filteredData) => updateDetailview(event, d));
;

//----------------------------------------------------------------------------------------------------
//function update detail view for the dots

        // main.js (Innerhalb des .then(data) Blocks)



        function updateDetailview(event, d, dataset) {

            d3.selectAll(".dot").classed("selected", false);
            d3.select(event.currentTarget).classed("selected", true);

            const infoList = d3.select("#info-list");

            infoList.html(`
                <li>Name: <b>${filteredData[d].Name}</b></li>
                <li>Type: ${filteredData[d].Type}</li>
                <li>AWD: ${filteredData[d].AWD}</li>
                <li>RWD: ${filteredData[d].RWD}</li>
                <li>Retail Price: $ ${numberFormat(filteredData[d].Retail_Price)}</li>
                <li>Dealer Cost: $ ${numberFormat(filteredData[d].Dealer_Cost)}</li>
                <li>Engine Size: ${filteredData[d].Engine_Size} litre</li>
            `);

            console.log("Object by klick:", d);
            console.log("Engine Size Test:", d['Engine Size (l)'], filteredData[d].Engine_Size);
        }






    }).catch(error => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
    });
};
