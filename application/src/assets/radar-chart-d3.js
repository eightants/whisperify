/** RadarChart
 *
 * This is the main reuseable function to draw radar charts.
 *
 * The original d3 project is found on: https://github.com/alangrafu/radar-chart-d3
 * This version is based on the cleaned version found on: http://bl.ocks.org/nbremer/6506614
 * with some reorganization of code and added commenting, as well as further function abstractions
 * to allow for addition/removal of visualization components via tweaking configuration parameters.
 *
 **/





var EdgeRadarChart = {
  draw: function(id, data, options) {

    // add touch to mouseover and mouseout
    var over = "ontouchstart" in window ? "touchstart" : "mouseover";
    var out = "ontouchstart" in window ? "touchend" : "mouseout";

    /** Initiate default configuration parameters and vis object
     *
     **/
    // initiate default config
    var w = 300;
    var h = 300;
    var config = {
      w: w,
      h: h,
      facet: false,
      levels: 5,
      levelScale: 0.85,
      labelScale: 1.0,
      facetPaddingScale: 2.5,
      maxValue: 0,
      radians: 2 * Math.PI,
      polygonAreaOpacity: 0.3,
      polygonStrokeOpacity: 1,
      polygonPointSize: 4,
      legendBoxSize: 10,
      translateX: w / 4,
      translateY: h / 4,
      paddingX: w,
      paddingY: h,
      colors: d3.scale.category10(),
      showLevels: true,
      showLevelsLabels: true,
      showAxesLabels: true,
      showAxes: true,
      showLegend: false,
      showVertices: true,
      showPolygons: true, 
      labelColor: "#c4c4c4"
    };

    // initiate main vis component
    var vis = {
      svg: null,
      tooltip: null,
      levels: null,
      axis: null,
      vertices: null,
      legend: null,
      allAxis: null,
      total: null,
      radius: null
    };

    // feed user configuration options
    if ("undefined" !== typeof options) {
      for (var i in options) {
        if ("undefined" !== typeof options[i]) {
          config[i] = options[i];
        }
      }
    }

    render(data); // render the visualization





    /** helper functions
     *
     * @function: render: render the visualization
     * @function: updateConfig: update configuration parameters
     * @function: buildVis: build visualization using the other build helper functions
     * @function: buildVisComponents: build main vis components
     * @function: buildLevels: build "spiderweb" levels
     * @function: buildLevelsLabels: build out the levels labels
     * @function: buildAxes: builds out the axes
     * @function: buildAxesLabels: builds out the axes labels
     * @function: buildCoordinates: builds [x, y] coordinates of polygon vertices.
     * @function: buildPolygons: builds out the polygon areas of the dataset
     * @function: buildVertices: builds out the polygon vertices of the dataset
     * @function: buildLegend:  builds out the legend
     **/
    // render the visualization
    function render(data) {
      // remove existing svg if exists
      d3.select(id).selectAll("svg").remove();
      updateConfig();
      
      if (config.facet) {
        data.forEach(function(d, i) {
          buildVis([d]); // build svg for each data group

          // override colors
          vis.svg.selectAll(".polygon-areas")
            .attr("stroke", config.colors(i))
            .attr("fill", config.colors(i));
          vis.svg.selectAll(".polygon-vertices")
            .attr("fill", config.colors(i));
          vis.svg.selectAll(".legend-tiles")
            .attr("fill", config.colors(i));
        });
      } else {
        buildVis(data); // build svg
      }
    }


    // update configuration parameters
    function updateConfig() {
      // adjust config parameters
      config.maxValue = Math.max(config.maxValue, d3.max(data, function(d) {
        return d3.max(d.axes, function(o) { return o.value; });
      }));
      config.w *= config.levelScale;
      config.h *= config.levelScale;
      config.paddingX = config.w * config.levelScale;
      config.paddingY = config.h * config.levelScale;


      // if facet required:
      if (config.facet) {
        config.w /= data.length;
        config.h /= data.length;
        config.paddingX /= (data.length / config.facetPaddingScale);
        config.paddingY /= (data.length / config.facetPaddingScale);
        config.polygonPointSize *= Math.pow(0.9, data.length);
      }
    }


    //build visualization using the other build helper functions
    function buildVis(data) {
      buildVisComponents();
      buildCoordinates(data);
      if (config.showLevels) buildLevels();
      if (config.showLevelsLabels) buildLevelsLabels();
      if (config.showAxes) buildAxes();
      if (config.showAxesLabels) buildAxesLabels();
      if (config.showLegend) buildLegend(data);
      if (config.showVertices) buildVertices(data);
      if (config.showPolygons) buildPolygons(data);
    }

    // build main vis components
    function buildVisComponents() {
      // update vis parameters
      vis.allAxis = data[0].axes.map(function(i, j) { return i.axis; });
      vis.totalAxes = vis.allAxis.length;
      vis.radius = Math.min(config.w / 2, config.h / 2);

      // create main vis svg
      vis.svg = d3.select(id)
        .append("svg").classed("svg-vis", true)
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('viewBox','0 0 '+Math.min(config.w,config.h)+' '+Math.min(config.w,config.h))
        .attr('preserveAspectRatio','xMinYMin')
        .append("svg:g")
        .attr("transform", "translate(" + 50 + "," + 50 + ") scale(0.7,0.7)");;

      // create verticesTooltip
      vis.verticesTooltip = d3.select("body")
        .append("div").classed("verticesTooltip", true)
        .attr("opacity", 0)
        .style({
          "position": "absolute",
          "color": "white",
          "font-size": "10px",
          "width": "100px",
          "height": "auto",
          "padding": "5px",
          "border": "0px solid gray",
          "border-radius": "5px",
          "pointer-events": "none",
          "opacity": "0",
          "background-color": "#191919"
        });


      // create levels
      vis.levels = vis.svg.selectAll(".levels")
        .append("svg:g").classed("levels", true);

      // create axes
      vis.axes = vis.svg.selectAll(".axes")
        .append("svg:g").classed("axes", true);

      // create vertices
      vis.vertices = vis.svg.selectAll(".vertices");

      //Initiate Legend	
      vis.legend = vis.svg.append("svg:g").classed("legend", true)
        .attr("height", config.h / 2)
        .attr("width", config.w / 2)
        .attr("transform", "translate(" + 0 + ", " + 1.1 * config.h + ")");
    }


    // builds out the levels of the spiderweb
    function buildLevels() {
      for (var level = 0; level < config.levels; level++) {
        var levelFactor = vis.radius * ((level + 1) / config.levels);

        // build level-lines
        vis.levels
          .data(vis.allAxis).enter()
          .append("svg:line").classed("level-lines", true)
          .attr("x1", function(d, i) { return levelFactor * (1 - Math.sin(i * config.radians / vis.totalAxes)); })
          .attr("y1", function(d, i) { return levelFactor * (1 - Math.cos(i * config.radians / vis.totalAxes)); })
          .attr("x2", function(d, i) { return levelFactor * (1 - Math.sin((i + 1) * config.radians / vis.totalAxes)); })
          .attr("y2", function(d, i) { return levelFactor * (1 - Math.cos((i + 1) * config.radians / vis.totalAxes)); })
          .attr("transform", "translate(" + (config.w / 2 - levelFactor) + ", " + (config.h / 2 - levelFactor) + ")")
          .attr("stroke", "gray")
          .attr("stroke-width", "0.5px");
      }
    }


    // builds out the levels labels
    function buildLevelsLabels() {
      for (var level = 0; level < config.levels; level++) {
        var levelFactor = vis.radius * ((level + 1) / config.levels);

        // build level-labels
        vis.levels
          .data([1]).enter()
          .append("svg:text").classed("level-labels", true)
          .text((config.maxValue * (level + 1) / config.levels).toFixed(2))
          .attr("x", function(d) { return levelFactor * (1 - Math.sin(0)); })
          .attr("y", function(d) { return levelFactor * (1 - Math.cos(0)); })
          .attr("transform", "translate(" + (config.w / 2 - levelFactor + 5) + ", " + (config.h / 2 - levelFactor) + ")")
          .attr("fill", config.labelColor)
          .attr("font-family", "sans-serif")
          .attr("font-size", 10 * config.labelScale + "px");
      }
    }


    // builds out the axes
    function buildAxes() {
      vis.axes
        .data(vis.allAxis).enter()
        .append("svg:line").classed("axis-lines", true)
        .attr("x1", config.w / 2)
        .attr("y1", config.h / 2)
        .attr("x2", function(d, i) { return config.w / 2 * (1 - Math.sin(i * config.radians / vis.totalAxes)); })
        .attr("y2", function(d, i) { return config.h / 2 * (1 - Math.cos(i * config.radians / vis.totalAxes)); })
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");
    }


    // builds out the axes labels
    function buildAxesLabels() {
      vis.axes
        .data(vis.allAxis).enter()
        .append("svg:text").classed("axis-labels", true)
        .text(function(d) { return d; })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) { return (config.w / 2 * (1 - 1.2 * Math.sin(i * config.radians / vis.totalAxes))); })
        .attr("y", function(d, i) { return config.h / 2 * (1 - 1.1 * Math.cos(i * config.radians / vis.totalAxes)); })
        .attr("font-family", "sans-serif")
        .attr("font-size", 12 * config.labelScale + "px")
        .attr("fill", config.labelColor);
    }


    // builds [x, y] coordinates of polygon vertices.
    function buildCoordinates(data) {
      data.forEach(function(group) {
        group.axes.forEach(function(d, i) {
          d.coordinates = { // [x, y] coordinates
            x: config.w / 2 * (1 - (parseFloat(Math.max(d.value, 0)) / config.maxValue) * Math.sin(i * config.radians / vis.totalAxes)),
            y: config.h / 2 * (1 - (parseFloat(Math.max(d.value, 0)) / config.maxValue) * Math.cos(i * config.radians / vis.totalAxes))
          };
        });
      });
    }


    // builds out the polygon vertices of the dataset
    function buildVertices(data) {
      data.forEach(function(group, g) {
        vis.vertices
          .data(group.axes).enter()
          .append("svg:circle").classed("polygon-vertices", true)
          .attr("r", config.polygonPointSize)
          .attr("cx", function(d, i) { return d.coordinates.x; })
          .attr("cy", function(d, i) { return d.coordinates.y; })
          .attr("fill", config.colors(g))
          .on(over, verticesTooltipShow)
          .on(out, verticesTooltipHide);
      });
    }


    // builds out the polygon areas of the dataset
    function buildPolygons(data) {
      vis.vertices
        .data(data).enter()
        .append("svg:polygon").classed("polygon-areas", true)
        .attr("points", function(group) { // build verticesString for each group
          var verticesString = "";
          group.axes.forEach(function(d) { verticesString += d.coordinates.x + "," + d.coordinates.y + " "; });
          return verticesString;
        })
        .attr("stroke-width", "2px")
        .attr("stroke", function(d, i) { return config.colors(i); })
        .attr("fill", function(d, i) { return config.colors(i); })
        .attr("fill-opacity", config.polygonAreaOpacity)
        .attr("stroke-opacity", config.polygonStrokeOpacity)
        .on(over, function(d) {
          vis.svg.selectAll(".polygon-areas") // fade all other polygons out
          .transition(250)
            .attr("fill-opacity", 0.1)
            .attr("stroke-opacity", 0.1);
          d3.select(this) // focus on active polygon
          .transition(250)
            .attr("fill-opacity", 0.7)
            .attr("stroke-opacity", config.polygonStrokeOpacity);
        })
        .on(out, function() {
          d3.selectAll(".polygon-areas")
            .transition(250)
            .attr("fill-opacity", config.polygonAreaOpacity)
            .attr("stroke-opacity", 1);
        });
    }


    // builds out the legend
    function buildLegend(data) {
      //Create legend squares
      vis.legend.selectAll(".legend-tiles")
        .data(data).enter()
        .append("svg:rect").classed("legend-tiles", true)
        .attr("x", config.w - config.paddingX / 2)
        .attr("y", function(d, i) { return i * 2 * config.legendBoxSize; })
        .attr("width", config.legendBoxSize)
        .attr("height", config.legendBoxSize)
        .attr("fill", function(d, g) { return config.colors(g); });

      //Create text next to squares
      vis.legend.selectAll(".legend-labels")
        .data(data).enter()
        .append("svg:text").classed("legend-labels", true)
        .attr("x", config.w - config.paddingX / 2 + (1.5 * config.legendBoxSize))
        .attr("y", function(d, i) { return i * 2 * config.legendBoxSize; })
        .attr("dy", 0.07 * config.legendBoxSize + "em")
        .attr("font-size", 11 * config.labelScale + "px")
        .attr("fill", "gray")
        .text(function(d) {
          return d.group;
        });
    }


    // show tooltip of vertices
    function verticesTooltipShow(d) {
      vis.verticesTooltip.style("opacity", 1)
        .html("<strong>Value</strong>: " + d.value.toFixed(3) + "<br />")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    // hide tooltip of vertices
    function verticesTooltipHide() {
      vis.verticesTooltip.style("opacity", 0);
    }
  }
};