// main.js

window.onload = () => {

    //1. Define Setup and Dimensions


    const margin = {top: 40, right: 400, bottom: 60, left: 70};
    const containerWidth = 1000;
    const width = containerWidth - margin.left - margin.right; // Breite des eigentlichen Plots
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
//scatter plot x: horsepower y: dealer cost color: type, shape: AWD

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

//Cleaning Data
        const filteredData = data.filter(d =>
            !isNaN(d.Horsepower) &&
            !isNaN(d.Dealer_Cost) &&
            !isNaN(d.Weight) &&
            !isNaN(d.Retail_Price) &&
            !isNaN(d.Engine_Size) &&
            !isNaN(d.Cyl) &&
            // NEU: Ausschluss des positiven Ausreißers (1000) und negativer Werte
            !isNaN(d.City_MPG) && d.City_MPG !== 1000 && d.City_MPG > 0 &&
            // NEU: Ausschluss des negativen Ausreißers (-1000) und negativer Werte
            !isNaN(d.Highway_MPG) && d.Highway_MPG !== -1000 && d.Highway_MPG > 0
        );

        console.log("Nutzbare Punkte nach Filterung:", filteredData.length);
        console.log("Erster Datenpunkt (gefiltert):", filteredData[0]);


        // Table Definition
        const tableDataDefinition = [
            { key: "Name", label: "Name" },
            { key: "Type", label: "Type" },
            { key: "Horsepower", label: "Horsepower (HP)" },
            { key: "Dealer_Cost", label: "Dealer Cost" },
            { key: "Retail_Price", label: "Retail Price" },
            { key: "Engine_Size", label: "Engine Size (l)" },
            { key: "Weight", label: "Weight (lbs)" },
            { key: "AWD", label: "AWD" },
            { key: "RWD", label: "RWD" },
        ];


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

        const typeDomain = [...new Set(filteredData.map(d => d.Type))].sort();


        const colorScale = d3.scaleOrdinal()
            .domain(typeDomain)
            .range(d3.schemeCategory10);


        // symbole scale for awd
        const symbolScale = d3.scaleOrdinal()
            .domain([0, 1])
            .range([d3.symbolCircle, d3.symbolTriangle]);

        //star plot
        const features = [
            "Retail_Price", "Engine_Size", "Cyl", "Horsepower",
            "City_MPG", "Highway_MPG"
        ];


        const normalizationScales = new Map();

        //max values for star schema
        features.forEach(feature => {
            const max = d3.max(filteredData, d => d[feature]);
            const domain = [0, max];

            normalizationScales.set(feature, d3.scaleLinear().domain(domain).range([0, 1]));
        });

        //star plot config
        const numFeatures = features.length;
        const starRadius = 150;
        const center_x = 260;
        const center_y = 260;

        const starPlotSVG = d3.select("#star_plot_svg");

        // function help for coordinates in the star plot
        function angleToCoordinate(angle, value) {
            const x = center_x + value * Math.cos(angle);
            const y = center_y + value * Math.sin(angle);
            return { x: x, y: y };
        }

   //--------------------------------------------
        //number format
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
                .on("click", (event, d) => updateDetailview(event, d));

//----------------------------------------------------------------------------------------------------
//Detail View SetUp in the first attempt now as table for more structure
/*
const detailGroup = svg.append("g")
    // Platziert die Details unterhalb der Form-Legende (+250 Pixel vertikal)
    .attr("transform", `translate(${width + 50}, 250)`);

detailGroup.append("text")
    .attr("x", 0).attr("y", -15)
    .style("font-weight", "bold")
    .text("Vehicle Details (click)");

// Initialisiere leere Textfelder für die Details
const detailLabels = [
    "Name", "Type", "AWD", "RWD", "Retail Price", "Dealer Cost", "Engine Size"
];

// Füge leere Textfelder hinzu, die später gefüllt werden
detailGroup.selectAll(".detail-info")
    .data(detailLabels)
    .enter().append("text")
        .attr("class", d => `detail-info detail-${d.replace(/\s/g, '_')}`)
        .attr("x", 0).attr("y", (d, i) => i * 20 + 4); */

//----------------------------------------------------------------------------------------------------

// Legend for Shape of Data Points

        const formLegend = svg.append("g")
            .attr("transform", `translate(${width + 50}, 150)`);

        formLegend.append("text")
            .attr("x", 0).attr("y", -15)
            .style("font-weight", "bold").text("Drive Type (Shape)");

        // Daten: [0 (no AWD), 1 (AWD)]
        const awdStatus = [
            { value: 0, label: "No AWD (2WD)" },
            { value: 1, label: "AWD (All-Wheel Drive)" }
        ];

        formLegend.selectAll(".form-item")
            .data(awdStatus)
            .enter().append("g")
                .attr("transform", (d, i) => `translate(0, ${i * 25})`) // space between vertical

        // Zeichnet das Symbol (Path)
        formLegend.selectAll("g").append("path")
        //retrieving forms with filling
            .attr("d", d => d3.symbol().type(symbolScale(d.value)).size(100)())
            .style("fill", "black");

        //Text for legend
        formLegend.selectAll("g").append("text")
            .attr("x", 15).attr("y", 4)
            .text(d => d.label);



//----------------------------------------------------------------------------------------------------
    // Draw Star Plot Function
    function drawStarPlot(dataObject) {
        // calculation normalized coordinates
        const coordinates = features.map((feature, i) => {
            const normalizedValue = normalizationScales.get(feature)(dataObject[feature]);

            // calculating polar coordinates
            const angle = (Math.PI / 2) - (i / numFeatures * 2 * Math.PI);
            const radius = normalizedValue * starRadius;

            return angleToCoordinate(angle, radius);
        });

        //clear previous plot if needed
        starPlotSVG.selectAll('*').remove();

        // Axis and labels
        features.forEach((feature, i) => {
            const angle = (Math.PI / 2) - (i / numFeatures * 2 * Math.PI);
            const endpoint = angleToCoordinate(angle, starRadius);

            // axis
            starPlotSVG.append("line")
                .attr("x1", center_x).attr("y1", center_y)
                .attr("x2", endpoint.x).attr("y2", endpoint.y)
                .attr("stroke", "#ccc");

            // Label
            const labelPoint = angleToCoordinate(angle, starRadius + 20); //distance to star
            starPlotSVG.append("text")
                .attr("x", labelPoint.x).attr("y", labelPoint.y)
                .attr("text-anchor", Math.abs(labelPoint.x - center_x) < 5 ? "middle" : (labelPoint.x > center_x ? "start" : "end"))
                .text(feature);
        });

        // drawing of area in plot
        const lineGenerator = d3.line()
            .x(d => d.x).y(d => d.y);

        starPlotSVG.append("path")
            .datum([...coordinates, coordinates[0]])
            .attr("d", lineGenerator)
            .attr("fill", colorScale(dataObject.Type)) // take color of vehicle type
            .attr("fill-opacity", 0.5)
            .attr("stroke", colorScale(dataObject.Type))
            .attr("stroke-width", 2);
    }

//----------------------------------------------------------------------------------------------------
//function update detail view for the dots
function updateDetailview(event, d) {

    const carData = filteredData[d];


    if (!carData) {
        console.error("Datenobjekt mit Index", d, "nicht gefunden.");
        return;
    }


//update detail view table
    d3.select(".detail-detail-Name").html(`Name: ${carData.Name}`);
    d3.select(".detail-detail-Type").text(`Type: ${carData.Type}`);
    d3.select(".detail-detail-AWD").text(`AWD: ${carData.AWD}`);
    d3.select(".detail-detail-RWD").text(`RWD: ${carData.RWD}`);
    d3.select(".detail-detail-Retail_Price").text(`Retail Price: $ ${numberFormat(carData.Retail_Price)}`);
    d3.select(".detail-detail-Dealer_Cost").text(`Dealer Cost: $ ${numberFormat(carData.Dealer_Cost)}`);
    d3.select(".detail-detail-Engine_Size").text(`Engine Size: ${carData.Engine_Size} litre`);

    // update new html table
    const tbody = d3.select("#car_details tbody");


    const rows = tbody.selectAll("tr")
        .data(tableDataDefinition, k => k.key);

    // Enter-Selection (Erstellen neuer Zeilen, falls das tbody leer ist)
    const newRows = rows.enter().append("tr");

    // creating labels column
    newRows.append("td")
        .style("font-weight", "bold")
        .text(k => k.label);

    // value column
    newRows.append("td")
        .attr("class", k => `table-value-${k.key}`);

    // Selects all value cells (second column) in both newly created and existing rows.
    const allCells = newRows.merge(rows).selectAll("td:nth-child(2)");

    // format values in value column
    allCells.text(k => {
        let value = carData[k.key];

        switch (k.key) {
            case "Dealer_Cost":
            case "Retail_Price":
                return !isNaN(value) ? `$ ${numberFormat(value)}` : 'N/A';
            case "AWD":
            case "RWD":
                return value == 1 ? "Yes" : "No";
            case "Horsepower":
                return !isNaN(value) ? `${numberFormat(value)} HP` : 'N/A';
            case "Weight":
                return !isNaN(value) ? `${numberFormat(value)} lbs` : 'N/A';
            case "Engine_Size":
                return !isNaN(value) ? `${value} litre` : 'N/A';
            default:
                return value;
        }
    });

    drawStarPlot(carData);

    //debugging
    console.log("Objekt beim Klick (Index):", d);
    console.log("Datenobjekt Name:", carData.Name);
    console.log("HighwayMPG", carData.Highway_MPG);
    console.log("City MPG", carData.City_MPG);
}


    }).catch(error => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
    });
};
