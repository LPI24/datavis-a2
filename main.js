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

        // 1st try with weight aas size of the circle but was difficult to distinguish the different data points hence we ignore that. Pls find attached a Screenshot
        // radius = weight
        /*
        const rScale = d3.scaleSqrt()
            .domain(d3.extent(filteredData, d => d.Weight))
            .range([3, 15]); */

        const typeDomain = [...new Set(filteredData.map(d => d.Type))].sort();



        const colorScale = d3.scaleOrdinal()
            .domain(typeDomain)
            .range(d3.schemeCategory10);


        // symbole scale for awd
        const symbolScale = d3.scaleOrdinal()
            .domain([0, 1])
            .range([d3.symbolCircle, d3.symbolTriangle]);



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
            .attr("transform",`translate(${width +50}, 0)`)

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
            .append("path")
                .attr("class", "dot")
                .attr("transform", d => `translate(${xScale(d.Horsepower)},${yScale(d.Dealer_Cost)})`)
                .attr("d", d => d3.symbol().type(symbolScale(d.AWD)).size(100)())
                .style("fill", d => colorScale(d.Type))
                .attr("opacity", 0.9)
                .on("click", (event, d, filteredData) => updateDetailview(event, d));

//----------------------------------------------------------------------------------------------------
// Legend for Shape of Data Points

        const formLegend = svg.append("g")
            .attr("transform", `translate(${width + 50}, 150)`);

        formLegend.append("text")
            .attr("x", 0).attr("y", -15)
            .style("font-weight", "bold").text("Drive Type (Shape)");

        // Daten: [0 (Kein AWD), 1 (AWD)]
        const awdStatus = [
            { value: 0, label: "No AWD (2WD)" },
            { value: 1, label: "AWD (All-Wheel Drive)" }
        ];

        formLegend.selectAll(".form-item")
            .data(awdStatus)
            .enter().append("g")
                .attr("transform", (d, i) => `translate(0, ${i * 25})`) // Vertikaler Abstand

        // Zeichnet das Symbol (Path)
        formLegend.selectAll("g").append("path")
            // Ruft die symbolScale auf, um entweder Kreis (0) oder Dreieck (1) zu zeichnen.
            // Größe 100 ist fest und dient nur der Darstellung in der Legende.
            .attr("d", d => d3.symbol().type(symbolScale(d.value)).size(100)())
            .style("fill", "black"); // Feste Farbe, da Farbe bereits Typ kodiert

        // Fügt den Text hinzu
        formLegend.selectAll("g").append("text")
            .attr("x", 15).attr("y", 4)
            .text(d => d.label);

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
