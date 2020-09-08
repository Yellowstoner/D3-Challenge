// D-3 Challenge

// if the SVG area isn't empty when the browser loads,
// remove it and replace it with a resized version of the chart
var svgArea = d3.select("body").select("svg");
if (!svgArea.empty()) {
    svgArea.remove();
}

// chart dimensions and margins
var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

var margin = {top: 50, bottom: 50, right: 50, left: 50};
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;
  
// Append SVG and group
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);
  
// Create svg container
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial chart axis
var chosenXaxis = "poverty"
var chosenYaxis = "healthcare"
    
// Function used for updating x-scale var upon click on axis label
function xScale(USdata, chosenXAxis) {
  
  // Create scales
  var newXScale = d3.scaleLinear()
  .domain([d3.min(USdata, d => d[chosenXaxis]) * 0.8,
  d3.max(USdata, d => [chosenXaxis] * 0.8)])
  .range([0, width]);
  
return newXScale;
}
    
// Function to update x-axis upon label click
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  var xAxis = d3.axisBottom(newXScale);
  
xAxis.transition()
.duration(1000)
.call(bottomAxis);

return xAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]));
  
return circlesGroup;
}

// function to update tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var label = chosenXAxis;
  var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([80, -60])
  .html(function(d) {
    return `<div>${d.state}</div><div>${label}: ${d[chosenXAxis]}</div>`
        });
  
  circlesGroup.call(toolTip);
  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
        }).on("mouseout", function(d) {
          toolTip.hide(d);
        });
return circlesGroup;
};

// Retrieve data and execute
d3.csv("assets/data/data.csv").then(function(USdata, err) {
  
  // Parse data
  USdata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });
  
  // xlinearScale and yLinearScale
  var xLinearScale = xScale(USdata, chosenXaxis);
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(USdata, d => d.chosenYaxis)])
  .range([height, 0]);
  
  // Create axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  
  // Append X Axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);
  
  // Append Y Axis
  chartGroup.append("g").call(leftAxis);
  
  // Append initial circles
  var circlesGroup = chartGroup.selectAll('circles')
  .data(USData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.healthcare))
  .attr("r", 20)
  .attr("opacity", ".5");
  
  // Two x-axis label groups
  var labelsGroup = chartGroup.append("g").attr("transform", "translate(${width / 2}, ${height 20})");
  
  var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // Event listener    
  .classed("active", true)
  .text("% of Population in Poverty");
  
  var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "income") // Event listener
  .classed("inactive", true)
  .text("Avg. Annual Income");

  // Append Y-axis
  chartGroup.append('text')
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Healthcare (%)");
  
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
  // X-axis even listener
  labelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    
    if (value !== chosenXAxis) {
      chosenXAxis = value;
      console.log(chosenXAxis);
      xLinearScale = xScale(USdata, chosenXaxis);
      xAxis = renderAxes(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis);
      circlesGroup = updateToolTip(chosenXaxis, circlesGroup);
      
      // Bold Text
      if (chosenXaxis === "income") {
        incomeLabel.classed("active", true).classed("inactive", false);
        povertyLabel.classed("active", false).classed("active", true);
      } else {
        incomeLabel.classed("active", false).classed("inactive", true);
        povertyLabel.classed("active", true).classed("active", false);
      }
    }
  }).catch(function(error) {
    console.log(error) 
  })
});