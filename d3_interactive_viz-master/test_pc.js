
var margin = {top: 30, right: 100, bottom: 20, left: 280},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var dset = "times_2016_top200.csv";
startD3();
var yearSelector = function (event) {
  var element = document.getElementById("year");
  var selectedValue = element.options[element.selectedIndex].text;

    if (selectedValue == "2016") {
      dset = "times_2016_top200.csv";
      startD3();
    }
    else if (selectedValue =="2015") {
      dset = "times_2015_top200.csv";
      startD3();
    }
    else if (selectedValue =="2014") {
      dset = "times_2014_top200.csv";
      startD3();
    }
    else if (selectedValue =="2013") {
      dset = "times_2013_top200.csv";
      startD3();
    }
    else if (selectedValue =="2012") {
      dset = "times_2012_top200.csv";
      startD3();
    }
    else if (selectedValue =="2011") {
      dset = "times_2011_top200.csv";
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


// linear color scale
var blue_to_brown = d3.scale.linear()
 .domain([1, 20,40,60,80,100,120,140,160,180,200])
  .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
            "#cab2d6","#6a3d9a","#ffff99","#b15928"])
  .interpolate(d3.interpolateLab);

var zcolorscale = d3.scale.linear()
  .domain([-2,-0.5,0.5,2])
  .range(["#b15928", "#999", "#999", "#cab2d6"])
  .interpolate(d3.interpolateLab);
// interact with this variable from a javascript console
var pc1;

// load csv file and create the chart
d3.csv(dset, function(data) {
  pc1 = d3.parcoords()("#pc")
    .data(data)
    .hideAxis(["name","world_rank","university_name","country","","num_students","student_staff_ratio","international_students","female_male_ratio","year"])
    .composite("darken")
    .color(function(d) { return blue_to_brown(d['world_rank']); })  // quantitative color scale
    .alpha(0.35)
    .render()
    .reorderable()
    .brushMode("1D-axes")  // enable brushing
    .interactive()  // command line mode

//change_color("total_score");


  var explore_count = 0;
  var exploring = {};
  var explore_start = false;

  pc1.svg
    .selectAll(".dimension")
    .style("cursor", "pointer")
    .on("click", function(d) {
      exploring[d] = d in exploring ? false : true;
      event.preventDefault();
      if (exploring[d]) d3.timer(explore(d,explore_count));
      //change_color;
    });

  function explore(dimension,count) {
    if (!explore_start) {
      explore_start = true;
      d3.timer(pc1.brush);
    }
    var speed = (Math.round(Math.random()) ? 1 : -1) * (Math.random()+0.5);
    return function(t) {
      if (!exploring[dimension]) return true;
      var domain = pc1.yscale[dimension].domain();
      var width = (domain[1] - domain[0])/4;

      var center = width*1.5*(1+Math.sin(speed*t/1200)) + domain[0];

      pc1.yscale[dimension].brush.extent([
        d3.max([center-width*0.01, domain[0]-width/400]),
        d3.min([center+width*1.01, domain[1]+width/100])
      ])(pc1.g()
          .filter(function(d) {
            return d == dimension;
          })
      );
    };
  };
/*
  // update color
function change_color(dimension) {
  pc1.svg.selectAll(".dimension")
    .style("font-weight", "normal")
    .filter(function(d) { return d == dimension; })
    .style("font-weight", "bold")

  pc1.color(zcolor(pc1.data(),dimension)).render()
}

// return color function based on plot and dimension
function zcolor(col, dimension) {
  var z = zscore(_(col).pluck(dimension).map(parseFloat))
  return function(d) { return zcolorscale(z(d[dimension])) }
};

// color by zscore
function zscore(col) {
  var n = col.length,
      mean = _(col).mean(),
      sigma = _(col).stdDeviation();
  return function(d) {
    return (d-mean)/sigma;
  };
};
*/

  //mouseover tooltip
  var projection = pc1.svg.selectAll(".axis text,.background path,.foreground path")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  function mouseover(d) {
    pc1.svg.classed("active", true);
    projection.classed("inactive", function(p) { return p !== d; });
    projection.filter(function(p) { return p === d; }).each(moveToFront);
    tooltip.text(d.world_rank + "- " + d.name );
    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").style("visibility","visible");

  }

  function mouseout(d) {
    pc1.svg.classed("active", false);
    projection.classed("inactive", false);
    return tooltip.style("visibility","hidden");
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  };

}
);


}
