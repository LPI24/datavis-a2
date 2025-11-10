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

      //checking unique values for selected attributes -> checking for na values
      //in this case no na values

      const horsepowerValues = data.map(d => d['Horsepower(HP)']);


      const uniqueHorsepowerStrings = [...new Set(horsepowerValues)]
            .sort((a, b) => +a - +b);

      const dealerCostValues = data.map(d => d['Dealer Cost']);
      const uniqueDealerCostStrings = [...new Set(dealerCostValues)]
          .sort((a, b) => +a - +b);

      console.log("Einzigartige Werte (Strings) in Dealer Cost:", uniqueDealerCostStrings);

      const typeValues = data.map(d => d.Type);
      const uniqueTypeStrings = [...new Set(typeValues)].sort();

      console.log("Einzigartige Werte (Strings) in Type:", uniqueTypeStrings);

      // --- Debugging für Weight (Größe) ---
      const weightValues = data.map(d => d.Weight); // Da 'Weight' keine Leerzeichen hat
      const uniqueWeightStrings = [...new Set(weightValues)]
          .sort((a, b) => +a - +b);

      console.log("Einzigartige Werte (Strings) in Weight:", uniqueWeightStrings);

      console.log("Einzigartige Werte (Strings) in Horsepower:", uniqueHorsepowerStrings);
        //convert types of data

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



        //console.log("Daten erfolgreich geladen. Gefilterte Punkte:", filteredData.length);
        console.log("Erster Datenpunkt:", data[0]);
    }).catch(error => {
    console.error("Fehler beim Laden der CSV-Datei:", error);

    const filteredData = data.filter(d =>
            !isNaN(d.Horsepower) && !isNaN(d.Dealer_Cost) && !isNaN(d.Weight)
        );

        console.log("Nutzbare Punkte nach Filterung:", filteredData.length);



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



    }).catch(error => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
    });
};
