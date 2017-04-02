
var margin = {top: 30, right: 100, bottom: 20, left: 280},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var dset = "times_2016_US.csv";
startD3();
var yearSelector = function (event) {
	var element = document.getElementById("year");
	var selectedValue = element.options[element.selectedIndex].text;
    
    if (selectedValue == "2016") {
    	dset = "times_2016.csv";
    	startD3();
    }
    else if (selectedValue =="2015") {
    	dset = "times_2015.csv";
    	startD3();
    }
    else if (selectedValue =="2014") {
    	dset = "times_2014.csv";
    	startD3();
    }
    else if (selectedValue =="2013") {
    	dset = "times_2013.csv";
    	startD3();
    }
    else if (selectedValue =="2012") {
      dset = "times_2012.csv";
      startD3();
    }
    else if (selectedValue =="2011") {
      dset = "times_2011.csv";
      startD3();
    }
    console.log(dset);
};

function startD3(){
	console.log("entering main");
	document.getElementById("pc").innerHTML = "";
  
var tooltip = d3.select("body")
    .append("tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class","sc_tooltip");

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(dset, function(error, cars) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
    return d != "university_name" && d!= "world_rank" && d!= "country" && (y[d] = d3.scale.linear()
        .domain(d3.extent(cars, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(cars)
    .enter().append("path")
      .attr("d", path);

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));
  var projection = svg.selectAll(".axis text,.background path,.foreground path")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  function mouseover(d) {
    svg.classed("active", true);
    projection.classed("inactive", function(p) { return p !== d; });
    projection.filter(function(p) { return p === d; }).each(moveToFront);
    tooltip.text(d.world_rank + "- " + d.university_name );
    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").style("visibility","visible");

  }

  function mouseout(d) {
    svg.classed("active", false);
    projection.classed("inactive", false);
    return tooltip.style("visibility","hidden");
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}
}


/*
var dimensions = [
/*
 {
    name: "country",
    scale: d3.scale.ordinal().rangePoints([0, height]),
    type: String
  },
 */
 /* 
  {
    name: "teaching",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  },
  {
    name: "research",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  },
  {
    name: "income",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  },
  {
    name: "citations",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  },
  {
    name: "international",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  },
   {
    name: "total_score",
    scale: d3.scale.linear().range([height, 0]),
    type: Number
  }
];
var dragging = {}, foreground, background;
var y = {}; // this element for brushing

var tooltip = d3.select("body")
    .append("tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("class","sc_tooltip");

/*var color = d3.scale.ordinal()
  .domain(['United States of America','United Kingdom','Switzerland','Canada','Singapore','Sweden','Germany','Australia','Belgium','China','Japan','Hong Kong','South Korea'])
  .range(['#ff7761','#fdc23e','#a8dba8','#A593E0','purple','olive','black','brown','orange','#fd999a','#8F2D56','yellow','magenta']);
*/
/*
var colors = d3.scale.category20b(); 
function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

var x = d3.scale.ordinal()
    .domain(dimensions.map(function(d) { return d.name; }))
    .rangePoints([0, width]);

var line = d3.svg.line()
    .defined(function(d) { return !isNaN(d[1]); });

var yAxis = d3.svg.axis()
    .orient("left");

var svg = d3.select("#pc").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dimension = svg.selectAll(".dimension")
    .data(dimensions)
  .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; });

d3.csv(dset, function(error, data) {
  if (error) throw error;
//trying to set y
d3.keys(data[0]).filter(function(d) {
    y[d]=d3.scale.linear().domain(d3.extent(data, function(p) { return +p[d]; })).range([height, 0]);
    //console.log(y[d]);
    return d != "university_name" && y[d];
  });
// -----
  dimensions.forEach(function(dimension) {
    dimension.scale.domain(dimension.type === Number
        ? d3.extent(data, function(d) { return +d[dimension.name]; })
        : data.map(function(d) { return d[dimension.name]; }));
  });

  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", draw);

  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", draw)
      .attr('stroke', function(d,i) {return colores_google(i); });
    //  .attr('stroke', function(d,i) {return colores_google(i); });
    //  .attr('stroke', function(d) {return color(d.country); });

  dimension.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(yAxis.scale(d.scale)); })
    .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d.name; })
      .on("click", function(d) {
      exploring[d] = d in exploring ? false : true;
      event.preventDefault();
      if (exploring[d]) d3.timer(explore(d,explore_count));
    });

  // Rebind the axis data to simplify mouseover.
  svg.select(".axis").selectAll("text:not(.title)")
      .attr("class", "label")
      .data(data, function(d) {  return d.name || d; });

  var projection = svg.selectAll(".axis text,.background path,.foreground path")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  function mouseover(d) {
    svg.classed("active", true);
    projection.classed("inactive", function(p) { return p !== d; });
    projection.filter(function(p) { return p === d; }).each(moveToFront);
    tooltip.text(d.world_rank + "- " + d.university_name );
    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").style("visibility","visible");

  }

  function mouseout(d) {
    svg.classed("active", false);
    projection.classed("inactive", false);
    return tooltip.style("visibility","hidden");
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
  
  var explore_count = 0;
  var exploring = {};
  var explore_start = false;

  function explore(dimension,count) {
    if (!explore_start) {
      explore_start = true;
      d3.timer(d3.svg.brush);
    }
    var speed = (Math.round(Math.random()) ? 1 : -1) * (Math.random()+0.5);
    return function(t) {
      if (!exploring[dimension]) return true;
      var domain = d3.svg.yscale[dimension].domain();
      var width = (domain[1] - domain[0])/4;

      var center = width*1.5*(1+Math.sin(speed*t/1200)) + domain[0];

      d3.svg.yscale[dimension].brush.extent([
        d3.max([center-width*0.01, domain[0]-width/400]),
        d3.min([center+width*1.01, domain[1]+width/100])
      ])(pc1.g()
          .filter(function(d) {
            return d == dimension;
          })
      );
    };
  };
  //for brushing
    // Add a group element for each dimension.
  var g = dimension.call(d3.behavior.drag()
        .origin(function(d) { console.log({x: x(d)});return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d.name] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d.name] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path); //ch path to draw
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);//ch
          background
              .attr("d", path)//ch
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  /*g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });*/
/*
  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
//end of brushing part
});

function draw(d) {
  return line(dimensions.map(function(dimension) {
    return [x(dimension.name), dimension.scale(d[dimension.name])];
  }));
}
// setting up brushing

// Add a group element for each dimension.
function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { 
    return [position(p), y[p](d[p])]; 
  }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}

}
*/
