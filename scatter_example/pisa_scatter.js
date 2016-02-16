var margin = {top: 50, right: 20, bottom: 50, left: 70};
    var w = 960 - margin.left - margin.right;
    var h = 500 - margin.top - margin.bottom;

var mycontinent = "All";
var dataset; //to hold full dataset
var maxMath;
var maxReading;
var maxScience;
var attributes = ["reading", "math", "science"];
var ranges = [[0, maxMath], [0, maxReading], [0,maxScience]];


d3.csv("PISA_Spending_2012_summary.csv", function (error, test_scores) {
    //read in the data
    if (error) return console.warn(error);
    test_scores.forEach(function (d) {
        d.reading = +d.Reading;
        d.math = +d.Math;
        d.science = +d.Science;
        d.spending= +d.Expenditure;
    });
    dataset = test_scores;

    minReading = d3.min(dataset.map(function (d) {
        return d.reading
    }));
    maxReading = d3.max(dataset.map(function (d) {
        return d.reading
    }));

    minMath = d3.min(dataset.map(function (d) {
        return d.math
    }));
    maxMath = d3.max(dataset.map(function (d) {
        return d.math
    }));

    minScience = d3.min(dataset.map(function (d) {
        return d.science
    }));
    maxScience = d3.max(dataset.map(function (d) {
        return d.science
    }));

    drawVis(dataset); // here we run this function so we can draw at first. So we load data and draw at same moment
    //

    d3.select("#myselector")
        .on('change', function () {
            mycontinent = d3.select(this).property('value'); //Using filter function seen in class storing the nominal value selected
            filterData("price", ranges[0]);
        });

    // creating sliders
    $(function () {
        $("#math").slider({
            range: true,
            min: Math.floor(minMath),
            max: Math.ceil(maxMath),
            values: [Math.floor(minMath), Math.ceil(maxMath)],
            float: top,
            slide: function (event, ui) {
                $("#mathamount").val(ui.values[0] + " - " + ui.values[1]);
                filterData("math", ui.values);
            }
        });
        $("#mathamount").val($("#math").slider("values", 0) +
            " - " + $("#math").slider("values", 1));
    });

    $(function () {
        $("#reading").slider({
            range: true,
            min: Math.floor(minReading),
            max: Math.ceil(maxReading),
            values: [Math.floor(minReading), Math.ceil(maxReading)],
            slide: function (event, ui) {
                $("#readingamount").val(ui.values[0] + " - " + ui.values[1]);
                filterData("reading", ui.values)
            }
        });
        $("#readingamount").val($("#reading").slider("values", 0) +
            " - " + $("#reading").slider("values", 1));
    });
});



var col = d3.scale.linear();

var x = d3.scale.linear()
    .domain([300, 650])
    .range([0, w]);

var y = d3.scale.linear()
    .domain([300, 650])
    .range([h, 0]);

var svg = d3.select("body").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
  .append("g")
    .classed("plot", true)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom)) // adding zoom feature
  .append("g");


var xAxis = d3.svg.axis()
    .ticks(8)
    .scale(x);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
    .append("text")
    .attr("id", "axis-label")
    .attr("x", w/2)
    .attr("y", 35)
    .text("Math");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    .attr("id", "axis-label")
    .attr("transform", "translate(" + -56 + "," + h/2 +") rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .text("Reading");

svg.append("g")
    .classed("header", true)
    .append("text")
    .attr("class", "header")
    .attr("transform", "translate(" + w/2.8 + "," + -30 +")")
    .text("PISA 2012 Test results");


var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var label = svg.append("text")
    .attr("class", "country label")
    .attr("text-anchor", "end")
    .attr("y", h - 24)
    .attr("x", w)
    .text("");


function drawVis(data) {
//calling color scale to implement diverging color scale
    col.domain([d3.min(dataset.map(function (d) {
        return d.spending;
    })), d3.mean(dataset.map(function (d) {
        return d.spending;
    })), d3.max(dataset.map(function (d) {
        return d.spending;
    }))])
        .range(["red", "white", "blue"])

    // Adding an overlay for the country label.
    var box = label.node().getBBox();

    var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", box.x)
        .attr("y", box.y)
        .attr("width", box.width)
        .attr("height", box.height);

    // data join
    var circles = svg.selectAll("circle")
      .data(data);

    // UPDATE phase and mouseover/country text interactivity
    circles
      .attr("class", "mycircles")
        .attr("cx", function(d) { return x(d.math);  })
        .attr("cy", function(d) { return y(d.reading);  })
        .attr("r", 4)
        .style("fill", function(d) { return col(d.spending); })
        .style("stroke", "black")
        .style("stroke-linejoin", "round")
        .on("mouseover", function(d){
          label.text(d.Country)
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);

          tooltip.text("Math:" + Math.round(d.math) + "  Reading:" + Math.round(d.reading))
              .style("left", (d3.event.pageX + 3) + "px")
              .style("top", (d3.event.pageY - 28) + "px");

          d3.select(this)
              .style("fill", "yellow")
              .attr("r", 10);
      })
        .on("mouseout", function(d,i){
          label.text("");

          tooltip.transition()
              .duration(500)
              .style("opacity", 0);

          d3.select(this)
              .style("fill", function(d){return col(d.spending);})
              .attr("r", 4);
      });

    // ENTER Phase + mouse interactivity
    circles.enter()
        .append("circle")
        .attr("class", "mycircles")
        .attr("cx", function(d) { return x(d.math);  })
        .attr("cy", function(d) { return y(d.reading);  })
        .style("stroke", "black")
        .style("stroke-linejoin", "round")
        .attr("r", 4)
        .style("fill", function(d) { return col(d.spending); })        
        .on("mouseover", function(d){
          label.text(d.Country)
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);

          tooltip.text("Math:" + Math.round(d.math) + "  Reading:" + Math.round(d.reading))
              .style("left", (d3.event.pageX + 3) + "px")
              .style("top", (d3.event.pageY - 28) + "px");

          d3.select(this)
              .style("fill", "yellow")
              .attr("r", 10);
      })
        .on("mouseout", function(d,i){
          label.text("");

          tooltip.transition()
              .duration(500)
              .style("opacity", 0);

          d3.select(this)
              .style("fill", function(d){return col(d.spending);})
              .attr("r", 4);
      });


    // EXIT Phase. Cleaning up old elements.
    circles.exit()
        .transition()
        .duration(1500)
        .style("fill-opacity", 0.001)
        .style("stroke", "white")
        .attr("r", 10)
        .remove();
};

function filterData(attr, values){ // modified lecture's filtered function
    for (i = 0; i < attributes.length; i++){
        if (attr == attributes[i]){
            ranges[i] = values;
        }
    }
    if (mycontinent ==="All"){
        var toVisualize = dataset.filter(function(d) { return isInRange(d)}); 
    }

    else{
        var toVisualize = dataset.filter(function(d) { return isInRange(d) && (d.Continent===mycontinent)});
    }
    drawVis(toVisualize);
}


function isInRange(datum){ // checks if each of the datum is in range or not.
    for (i = 0; i < attributes.length; i++){
            if (datum[attributes[i]] < ranges[i][0] || datum[attributes[i]] > ranges[i][1]){
                return false;
            }
    }
    return true;
};

// zoom function using rescale.
function zoom() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}