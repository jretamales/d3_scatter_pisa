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


d3.csv("PISA_Spending_2012_summary.csv", function (error, scores) {
    //read in the data
    if (error) return console.warn(error);
    scores.forEach(function (d) {
        d.reading = +d.Reading;
        d.math = +d.Math;
        d.science = +d.Science;
        d.spending= +d.Expenditure;
    });
    dataset = scores;

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
            mycontinent = d3.select(this).property('value'); //storing the nominal value selected
            filterData("price", ranges[0]);// here we just make use of filterData function which draws the function and
            // while keeping track of the current range. We could've used the filteredData with vol and ranges[1].
            // Whichever would've worked..
        });

    // sliders
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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxis = d3.svg.axis()
    .ticks(4)
    .scale(x);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
    .append("text")
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
    .attr("transform", "translate(" + -56 + "," + h/2 +") rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .text("Reading");

svg.append("g")
    .classed("header", true)
    .append("text")
    .attr("transform", "translate(" + w/2.8 + "," + -30 +")")
    .text("PISA 2012 Test results");


var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function drawVis(data) {
    // Data JOIN, update selection. I guess here is where we need to input the data, input the filtered data.


    col.domain([d3.min(dataset.map(function (d) {
        return d.spending
    })), d3.mean(dataset.map(function (d) {
        return d.spending
    })), d3.max(dataset.map(function (d) {
        return d.spending
    }))])
        .range(["red", "white", "blue"])

    var cont_set = d3.map(data, function(d){return d.Continent;}).keys();

    var circles = svg.selectAll("circle")
      .data(data);

    // ENTER Phase
    circles.enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.math);  })
        .attr("cy", function(d) { return y(d.reading);  })
        .style("stroke", "black")
        .attr("r", 4)
        .style("fill", function(d) { return col(d.spending); });


    // UPDATE phase mouseover interactivity
    circles
        .attr("cx", function(d) { return x(d.math);  })
        .attr("cy", function(d) { return y(d.reading);  })
        .attr("r", 4)
        .style("fill", function(d) { return col(d.spending); })
        .style("stroke", "black")
        .on("mouseover", function(d,i){
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);
          tooltip.html("Country:" + d.Country + "   Math:" + d.math + "   Reading:" + d.reading)
              .style("left", (d3.event.pageX + 5) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          d3.select(this)
              .style("fill", "yellow")
              .attr("r", 10);
      })
        .on("mouseout", function(d,i){
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          d3.select(this)
              .style("fill", function(d){return col(d.spending);})
              .attr("r", 4);
      });



    // EXIT Phase. Cleaning up old elements without data bounded.
    circles.exit()
        .transition()
        .duration(1500)
        .style("fill-opacity", 0.001)
        .style("stroke", "white")
        .attr("r", 10)
        .remove();
};

function filterData(attr, values){ // maybe write 2 fors here one for the nominal other for the quantitative?
    for (i = 0; i < attributes.length; i++){
        if (attr == attributes[i]){
            ranges[i] = values;
        }
    }
    if (mycontinent ==="All"){
        var toVisualize = dataset.filter(function(d) { return isInRange(d)}); // add here if else statement to include when
        // we have all.
    }
    else{
        var toVisualize = dataset.filter(function(d) { return isInRange(d) && (d.Continent===mycontinent)});
    }
        // add here if else statement to include when
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

Array.prototype.unique = function(a){
    return function(){ return this.filter(a) }
}(function(a,b,c){ return c.indexOf(a,b+1) < 0 });

