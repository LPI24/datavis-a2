// Waiting until document has loaded
window.onload = () => {

  // specifing charts dimension

  const width = 928;
  const height = 600;
  const marginTop = 25;
  const marginRight = 20;
  const marginBottom = 35;
  const marginLeft = 40;

  //Creating the SVG Container
  const svg = d3.select("#scatter_plot")
    .append("svg")
      .attr("width", width + marginLeft + marginRight)
      .attr("heigth", height + marginBottom + marginTop)
    .append("g")


  // Load the data set from the assets folder:

};
