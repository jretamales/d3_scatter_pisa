/**
 * Created by Jorge on 2/14/2016.
 */

var val = 0.5;

$( "#slider" ).slider({
    value: val,
    min: 1/20,
    max: 2,
    step:0.5,
    slide: function( event, ui ) {
        val = ui.value;
        $( "#slider-value").html(Math.round(10/val)/10);
    }
});

$( "#slider-value").html(Math.round(10/val)/10);

//$( "#slider" ).slider( "option", "value", 0.2);

var margin = {top: 50, right: 20, bottom: 50, left: 70};
var w = 960 - margin.left - margin.right;
var h = 500 - margin.top - margin.bottom;
var radius = 6;


function nextTime(rateParameter){
    return -1000*Math.log(1-Math.random())/rateParameter;
}


/*for (i = 0; i < 20; i++){
    arrival = nextTime(1/5000);
    setTimeout
    if(arrivals.length==0){
        setInterval(arrivals.push(arrival), arrival);
    }
    else{
        previous_arrival = arrivals[arrivals.length-1];
        setTimeout(arrivals.push(previous_arrival + arrival), arrival);
    }
}*/

var x = d3.scale.linear()
    .domain([0, 4])
    .range([0, w]);


var svg = d3.select("body").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .classed("plot", true)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

arrivals = [];

function update(data) {
    // adding new arrivals
    arrivals.push(Math.random()); // just a place holder
    // join selection
    var circles = svg.selectAll("circle")
        .data(data, function(d) { return d; });

    //enter phase
    circles
            .enter()
            .append("circle")
        .attr("class", "newCircles")
        .attr("cx", 20)
        .attr("cy", 80)
        .attr("r", radius)
        .transition()
        .duration(1000)
        .attr("cx", function(){
            return w - 2*radius*updatePlacement("newCircles");
        });
}

function updatePlacement(chartId) {
    /**
     * Since we dynamically add/remove bars we can't use data indexes but must determine how
     * many bars we have already in the graph to calculate x-axis placement
     */
    var numCircles = document.querySelectorAll("." + chartId).length + 1;

    return numCircles;
}

/*setInterval(function(){
    update(arrivals);
    $( "#new_arrival").html(nextTime(val));
}, nextTime(val));
 */
var tmpTime;

function timeout() {
    setTimeout(function () {
        update(arrivals);
        tmpTime = nextTime(val);
        $( "#new_arrival").html(tmpTime);
        timeout();
    }, tmpTime);
};

timeout();