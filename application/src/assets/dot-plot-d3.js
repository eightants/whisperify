// Customizable Dot Plot (for D3 v3)
// by Anthony Teo
// adapted from code by Yan Holtz
/* 
This function generates a responsive and customisable dot plot that can be used as 
a lolipop plot, a dumbell plot, or other dot-plot-like graphs. 
I needed a really lightweight dot plot function in D3 v3 that shows the domain in each plot without needing axes, 
so I made this by adapting a basic Cleveland plot implementation that used D3 v4, and added configurations.  
The config object is passed in for styling customisations. 
*/

function DotPlot(id, data, options) {
  // set the default configs for the graph
  // all these are customisable through passing in values for these fields in options
  var cfg = {
    margin: { top: 10, right: 30, bottom: 30, left: 30 },
    width: 500, // NOTE: width and height is only used for the aspect ratio of the graph container, the graph is always responsive
    height: 200,
    domain: [0, 1], // domain of x-axis, range of values of data
    color: d3.scale.category10(),
    radius: "6px", // radius of the dots
    yoffset: 0, // if the plots aren't aligning with axes, change this
    showAxes: true,
    axesColor: "black",
    axesWidth: "1px",
    lineColor: "grey", //settings for the line that goes through all the points for each group
    lineStroke: "2px",
    lineToMatchAxes: false, // false means it is a regular Cleveland/Dumbell plot,
    //if true, the line connecting all dots in a category is as long as the x-axis
    // (useful if you are hiding the axes but still want to show the range)
  };

  //Put all of the options into a variable called cfg
  if ("undefined" !== typeof options) {
    for (var i in options) {
      if ("undefined" !== typeof options[i]) {
        cfg[i] = options[i];
      }
    }
  }

  // remove the previous graph in the container
  d3.select(id).select("svg").remove();

  // append the svg object to the body of the page
  var svg = d3
    .select(id)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr(
      "viewBox",
      "0 0 " + cfg.width.toString() + " " + cfg.height.toString()
    )
    .attr("preserveAspectRatio", "xMinYMid")
    .append("g")
    .attr(
      "transform",
      "translate(" + cfg.margin.left + "," + cfg.margin.top + ")"
    );

  // Add X axis
  var x = d3.scale
    .linear()
    .domain(cfg.domain)
    .range([0, cfg.width - cfg.margin.left - cfg.margin.right]);
  var xaxis = svg
    .append("g")
    .attr(
      "transform",
      "translate(0," + (cfg.height - cfg.margin.top - cfg.margin.bottom) + ")"
    )
    .attr("visibility", cfg.showAxes ? "visible" : "hidden")
    .attr("stroke", cfg.axesColor)
    .attr("fill", "none")
    .attr("stroke-width", cfg.axesWidth)
    .call(d3.svg.axis().scale(x));

  // Y axis
  var y = d3.scale
    .ordinal()
    .rangeRoundBands([0, cfg.height - cfg.margin.top - cfg.margin.bottom])
    .domain(
      data.map(function (d) {
        return d.group;
      })
    );
  var yaxis = svg
    .append("g")
    .attr("visibility", cfg.showAxes ? "visible" : "hidden")
    .attr("stroke", cfg.axesColor)
    .attr("fill", "none")
    .attr("stroke-width", cfg.axesWidth)
    .call(d3.svg.axis().orient("left").scale(y));
  
  xaxis.selectAll("text").attr("fill", cfg.axesColor).attr("stroke-width", "0");
  yaxis.selectAll("text").attr("fill", cfg.axesColor).attr("stroke-width", "0");

  var keys = Object.keys(data[0]);
  keys.splice(keys.indexOf("group"), 1);
  // Lines
  svg
    .selectAll("myline")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", function (d) {
      return x(cfg.lineToMatchAxes ? cfg.domain[0] : d3.min(keys, (k) => d[k]));
    }) // get min and max values for dumbell chart
    .attr("x2", function (d) {
      return x(cfg.lineToMatchAxes ? cfg.domain[1] : d3.max(keys, (k) => d[k]));
    }) // if that is the config
    .attr("y1", function (d) {
      return (y(d.group) + cfg.yoffset);
    })
    .attr("y2", function (d) {
      return (y(d.group) + cfg.yoffset);
    })
    .attr("stroke", cfg.lineColor)
    .attr("stroke-width", cfg.lineStroke);

  // gets all the circles on the plot
  var circles = Object.keys(data[0]);
  for (var i = 0; i < circles.length; i++) {
    if (circles[i] != "group") {
      // plot circles
      svg
        .selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d[circles[i]]);
        })
        .attr("cy", function (d) {
          return (y(d.group) + cfg.yoffset);
        })
        .attr("r", cfg.radius)
        .style("fill", cfg.color(i - 1)); // takes the color of previous index because the chart title Group is one of the keys
    }
  }
}
